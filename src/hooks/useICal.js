import { useCallback, useEffect, useState } from "react";
import { parseICal } from "../utils/ical";

function useICal(feedUrl) {
  // stati
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authRequired, setAuthRequired] = useState(false);

  const loadCalendar = useCallback(
    async (signal) => {
      await Promise.resolve();

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(feedUrl, {
          signal,
        });

        if (response.status === 401) {
          setEvents([]);
          setAuthRequired(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const text = await response.text();
        const parsedEvents = parseICal(text);

        setEvents(parsedEvents);
        setAuthRequired(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [feedUrl],
  );

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      loadCalendar(controller.signal);
    });

    return () => controller.abort();
  }, [loadCalendar]);

  async function unlockCalendar(password) {
    const response = await fetch("/api/calendar-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error ?? "Impossibile sbloccare il calendario",
      );
    }

    await loadCalendar();
  }

  async function lockCalendar() {
    await fetch("/api/calendar-session", {
      method: "DELETE",
    });

    setEvents([]);
    setError(null);
    setAuthRequired(true);
  }

  return {
    events,
    loading,
    error,
    authRequired,
    unlockCalendar,
    lockCalendar,
  };
}

export default useICal;
