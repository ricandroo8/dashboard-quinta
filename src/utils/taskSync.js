const EPOCH = "1970-01-01T00:00:00.000Z";

function getTimestamp(value) {
  const timestamp = new Date(value ?? EPOCH).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function taskSignature(task) {
  const content = { ...task };
  delete content.updatedAt;
  return JSON.stringify(content);
}

export function normalizeTask(task) {
  const createdAt = task.createdAt ?? EPOCH;

  return {
    ...task,
    completed: Boolean(task.completed),
    completedAt: task.completedAt ?? null,
    createdAt,
    description: task.description ?? "",
    dueDate: task.dueDate ?? null,
    externalTaskId: task.externalTaskId ?? null,
    isImportant: Boolean(task.isImportant),
    isUrgent: Boolean(task.isUrgent),
    subjectId: task.subjectId ?? "",
    type: task.type ?? "OTHER",
    updatedAt: task.updatedAt ?? task.completedAt ?? createdAt,
  };
}

export function mergeTombstones(...groups) {
  const byId = new Map();

  groups.flat().forEach((tombstone) => {
    if (!tombstone?.id || !tombstone?.deletedAt) {
      return;
    }

    const current = byId.get(tombstone.id);
    if (!current || getTimestamp(tombstone.deletedAt) > getTimestamp(current.deletedAt)) {
      byId.set(tombstone.id, tombstone);
    }
  });

  return [...byId.values()];
}

export function resolveInitialTaskCache({
  legacyOwnerId,
  legacyTasks,
  userId,
  userTasks,
}) {
  if (Array.isArray(userTasks)) {
    return { shouldClaimLegacyTasks: false, tasks: userTasks };
  }

  if (
    legacyOwnerId &&
    legacyOwnerId !== userId
  ) {
    return { shouldClaimLegacyTasks: false, tasks: [] };
  }

  if (!Array.isArray(legacyTasks) || legacyTasks.length === 0) {
    return { shouldClaimLegacyTasks: false, tasks: [] };
  }

  return {
    shouldClaimLegacyTasks: !legacyOwnerId,
    tasks: legacyTasks,
  };
}

export function prepareTaskMutation(currentTasks, requestedTasks, now) {
  const currentById = new Map(currentTasks.map((task) => [task.id, normalizeTask(task)]));
  const tasksToUpsert = [];
  const nextTasks = requestedTasks.map((task) => {
    const normalized = normalizeTask(task);
    const current = currentById.get(normalized.id);

    if (current && taskSignature(current) === taskSignature(normalized)) {
      return { ...normalized, updatedAt: current.updatedAt };
    }

    const updatedTask = { ...normalized, updatedAt: now };
    tasksToUpsert.push(updatedTask);
    return updatedTask;
  });
  const nextIds = new Set(nextTasks.map((task) => task.id));
  const deletedTombstones = currentTasks
    .filter((task) => !nextIds.has(task.id))
    .map((task) => ({ id: task.id, deletedAt: now }));

  return { deletedTombstones, tasks: nextTasks, tasksToUpsert };
}

export function reconcileTaskSources(localTasks, localTombstones, cloudRecords) {
  const candidatesById = new Map();

  function addCandidate(id, candidate) {
    if (!id) {
      return;
    }

    const candidates = candidatesById.get(id) ?? [];
    candidates.push(candidate);
    candidatesById.set(id, candidates);
  }

  localTasks.map(normalizeTask).forEach((task) => {
    addCandidate(task.id, {
      deleted: false,
      source: "local",
      task,
      timestamp: getTimestamp(task.updatedAt),
    });
  });

  mergeTombstones(localTombstones).forEach((tombstone) => {
    addCandidate(tombstone.id, {
      deleted: true,
      source: "local",
      timestamp: getTimestamp(tombstone.deletedAt),
      tombstone,
    });
  });

  cloudRecords.forEach((record) => {
    const task = normalizeTask(record.task);
    const deletedAt = record.deletedAt;

    addCandidate(task.id, {
      deleted: Boolean(deletedAt),
      source: "cloud",
      task,
      timestamp: getTimestamp(deletedAt ?? task.updatedAt),
      tombstone: deletedAt ? { id: task.id, deletedAt } : null,
    });
  });

  const tasks = [];
  const tombstones = [];
  const tasksToUpsert = [];
  const tombstonesToPush = [];

  candidatesById.forEach((candidates, id) => {
    const winner = [...candidates].sort((first, second) => {
      if (first.timestamp !== second.timestamp) {
        return second.timestamp - first.timestamp;
      }

      return Number(second.source === "cloud") - Number(first.source === "cloud");
    })[0];
    const cloudCandidate = candidates.find((candidate) => candidate.source === "cloud");

    if (winner.deleted) {
      const tombstone = winner.tombstone ?? {
        id,
        deletedAt: new Date(winner.timestamp).toISOString(),
      };
      tombstones.push(tombstone);

      if (winner.source === "local" && cloudCandidate && !cloudCandidate.deleted) {
        tombstonesToPush.push(tombstone);
      }

      return;
    }

    tasks.push(winner.task);
    if (winner.source === "local") {
      tasksToUpsert.push(winner.task);
    }
  });

  tasks.sort((first, second) => getTimestamp(first.createdAt) - getTimestamp(second.createdAt));

  return { tasks, tasksToUpsert, tombstones, tombstonesToPush };
}
