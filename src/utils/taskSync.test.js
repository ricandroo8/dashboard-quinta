import assert from "node:assert/strict";
import test from "node:test";

import {
  prepareTaskMutation,
  reconcileTaskSources,
  resolveInitialTaskCache,
} from "./taskSync.js";

const baseTask = {
  completed: false,
  completedAt: null,
  createdAt: "2026-09-01T08:00:00.000Z",
  description: "",
  dueDate: null,
  externalTaskId: null,
  id: "tsk-1",
  isImportant: false,
  isUrgent: false,
  subjectId: "subj-info",
  title: "Ripassare React",
  type: "HOMEWORK",
  updatedAt: "2026-09-01T08:00:00.000Z",
};

test("migra un’attività locale assente nel cloud senza duplicarla", () => {
  const result = reconcileTaskSources([baseTask], [], []);

  assert.equal(result.tasks.length, 1);
  assert.equal(result.tasksToUpsert.length, 1);
  assert.equal(result.tasks[0].id, "tsk-1");
});

test("mantiene la versione cloud più recente dello stesso task", () => {
  const cloudTask = {
    ...baseTask,
    title: "Versione cloud",
    updatedAt: "2026-09-02T08:00:00.000Z",
  };
  const result = reconcileTaskSources(
    [baseTask],
    [],
    [{ deletedAt: null, task: cloudTask }],
  );

  assert.equal(result.tasks.length, 1);
  assert.equal(result.tasks[0].title, "Versione cloud");
  assert.equal(result.tasksToUpsert.length, 0);
});

test("propaga una cancellazione locale più recente", () => {
  const deletedAt = "2026-09-03T08:00:00.000Z";
  const result = reconcileTaskSources(
    [],
    [{ id: "tsk-1", deletedAt }],
    [{ deletedAt: null, task: baseTask }],
  );

  assert.equal(result.tasks.length, 0);
  assert.deepEqual(result.tombstonesToPush, [{ id: "tsk-1", deletedAt }]);
});

test("marca aggiornamenti e cancellazioni con lo stesso timestamp", () => {
  const now = "2026-09-04T08:00:00.000Z";
  const result = prepareTaskMutation(
    [baseTask, { ...baseTask, id: "tsk-2" }],
    [{ ...baseTask, completed: true }],
    now,
  );

  assert.equal(result.tasks[0].updatedAt, now);
  assert.deepEqual(result.tasksToUpsert, [result.tasks[0]]);
  assert.deepEqual(result.deletedTombstones, [{ id: "tsk-2", deletedAt: now }]);
});

test("non riscrive i task che non sono cambiati", () => {
  const result = prepareTaskMutation(
    [baseTask],
    [{ ...baseTask }],
    "2026-09-05T08:00:00.000Z",
  );

  assert.equal(result.tasks[0].updatedAt, baseTask.updatedAt);
  assert.deepEqual(result.tasksToUpsert, []);
});

test("una cancellazione cloud più recente non viene ricreata dal cache locale", () => {
  const result = reconcileTaskSources(
    [baseTask],
    [],
    [{
      deletedAt: "2026-09-06T08:00:00.000Z",
      task: {
        ...baseTask,
        updatedAt: "2026-09-06T08:00:00.000Z",
      },
    }],
  );

  assert.deepEqual(result.tasks, []);
  assert.equal(result.tombstones.length, 1);
  assert.deepEqual(result.tasksToUpsert, []);
});

test("assegna la cache precedente solo al primo profilo", () => {
  const firstProfile = resolveInitialTaskCache({
    legacyOwnerId: null,
    legacyTasks: [baseTask],
    userId: "user-1",
    userTasks: null,
  });
  const secondProfile = resolveInitialTaskCache({
    legacyOwnerId: "user-1",
    legacyTasks: [baseTask],
    userId: "user-2",
    userTasks: null,
  });

  assert.equal(firstProfile.shouldClaimLegacyTasks, true);
  assert.deepEqual(firstProfile.tasks, [baseTask]);
  assert.equal(secondProfile.shouldClaimLegacyTasks, false);
  assert.deepEqual(secondProfile.tasks, []);
});

test("preferisce sempre la cache già separata per profilo", () => {
  const profileTask = { ...baseTask, id: "profile-task" };
  const result = resolveInitialTaskCache({
    legacyOwnerId: null,
    legacyTasks: [baseTask],
    userId: "user-1",
    userTasks: [profileTask],
  });

  assert.equal(result.shouldClaimLegacyTasks, false);
  assert.deepEqual(result.tasks, [profileTask]);
});
