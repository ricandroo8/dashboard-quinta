import { useCallback, useEffect, useRef, useState } from "react";

import useLocalStorage from "./useLocalStorage";
import {
  fetchTaskRecords,
  softDeleteTasks,
  upsertTasks,
} from "../services/taskRepository";
import {
  mergeTombstones,
  prepareTaskMutation,
  reconcileTaskSources,
  resolveInitialTaskCache,
} from "../utils/taskSync";

const LEGACY_TASKS_KEY = "dashboard_tasks";
const LEGACY_OWNER_KEY = "dashboard_tasks_legacy_owner";

function readStoredArray(key) {
  try {
    const savedValue = localStorage.getItem(key);

    if (savedValue === null) {
      return null;
    }

    const parsedValue = JSON.parse(savedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function readInitialTaskCache(userId, storageKey) {
  let legacyOwnerId = null;

  try {
    legacyOwnerId = localStorage.getItem(LEGACY_OWNER_KEY);
  } catch {
    // useLocalStorage gestirà e segnalerà eventuali limitazioni del browser.
  }

  return resolveInitialTaskCache({
    legacyOwnerId,
    legacyTasks: readStoredArray(LEGACY_TASKS_KEY),
    userId,
    userTasks: readStoredArray(storageKey),
  });
}

export default function useSyncedTasks(userId) {
  const storageKey = `dashboard_tasks:${userId}`;
  const tombstoneKey = `dashboard_task_tombstones:${userId}`;
  const [initialCache] = useState(() =>
    readInitialTaskCache(userId, storageKey),
  );

  const [tasks, setStoredTasks] = useLocalStorage(
    storageKey,
    initialCache.tasks,
  );
  const [tombstones, setStoredTombstones] = useLocalStorage(tombstoneKey, []);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const tasksRef = useRef(tasks);
  const tombstonesRef = useRef(tombstones);
  const runQueueRef = useRef(Promise.resolve());
  const activeUserRef = useRef(userId);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    tombstonesRef.current = tombstones;
  }, [tombstones]);

  useEffect(() => {
    activeUserRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!initialCache.shouldClaimLegacyTasks) {
      return;
    }

    try {
      localStorage.setItem(LEGACY_OWNER_KEY, userId);
    } catch (storageError) {
      console.error("Impossibile assegnare la cache attività al profilo:", storageError);
    }
  }, [initialCache.shouldClaimLegacyTasks, userId]);

  const runSynchronization = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setError(null);
        setStatus("loading");
      }

      try {
        let cloudRecords = await fetchTaskRecords(userId);
        let result = reconcileTaskSources(
          tasksRef.current,
          tombstonesRef.current,
          cloudRecords,
        );

        await upsertTasks(userId, result.tasksToUpsert);
        await softDeleteTasks(userId, result.tombstonesToPush);

        if (result.tasksToUpsert.length > 0 || result.tombstonesToPush.length > 0) {
          cloudRecords = await fetchTaskRecords(userId);
          result = reconcileTaskSources(result.tasks, result.tombstones, cloudRecords);
        }

        if (activeUserRef.current !== userId) {
          return;
        }

        tasksRef.current = result.tasks;
        tombstonesRef.current = result.tombstones;
        setStoredTasks(result.tasks);
        setStoredTombstones(result.tombstones);
        setError(null);
        setStatus("ready");
      } catch (syncError) {
        console.error("Sincronizzazione attività non riuscita:", syncError);

        if (activeUserRef.current === userId) {
          setError("Sincronizzazione non riuscita. Le modifiche restano salvate su questo dispositivo.");
          setStatus("error");
        }
      }
    },
    [setStoredTasks, setStoredTombstones, userId],
  );

  const synchronize = useCallback(
    (options) => {
      runQueueRef.current = runQueueRef.current
        .catch(() => undefined)
        .then(() => runSynchronization(options));

      return runQueueRef.current;
    },
    [runSynchronization],
  );

  useEffect(() => {
    synchronize();

    const handleFocus = () => synchronize({ showLoading: false });
    const handleOnline = () => synchronize({ showLoading: false });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        synchronize({ showLoading: false });
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [synchronize]);

  const setTasks = useCallback(
    (nextValue) => {
      const currentTasks = tasksRef.current;
      const requestedTasks =
        typeof nextValue === "function" ? nextValue(currentTasks) : nextValue;

      if (!Array.isArray(requestedTasks)) {
        return;
      }

      const now = new Date().toISOString();
      const mutation = prepareTaskMutation(currentTasks, requestedTasks, now);
      const activeTaskIds = new Set(mutation.tasks.map((task) => task.id));
      const nextTombstones = mergeTombstones(
        tombstonesRef.current,
        mutation.deletedTombstones,
      ).filter((tombstone) => !activeTaskIds.has(tombstone.id));

      tasksRef.current = mutation.tasks;
      tombstonesRef.current = nextTombstones;
      setStoredTasks(mutation.tasks);
      setStoredTombstones(nextTombstones);

      runQueueRef.current = runQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          await upsertTasks(userId, mutation.tasksToUpsert);
          await softDeleteTasks(userId, mutation.deletedTombstones);
        })
        .then(() => runSynchronization({ showLoading: false }))
        .catch((syncError) => {
          console.error("Salvataggio attività non riuscito:", syncError);
          setError("Modifica salvata solo su questo dispositivo. Premi Riprova quando sei online.");
          setStatus("error");
        });
    },
    [runSynchronization, setStoredTasks, setStoredTombstones, userId],
  );

  return {
    error,
    isLoading: status === "loading",
    retry: synchronize,
    setTasks,
    status,
    tasks,
  };
}
