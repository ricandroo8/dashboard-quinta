import { useEffect, useState } from "react";
import { parseICal } from "../utils/ical";

function useICal(feedUrl) {
  // stati
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const controller = new AbortController();

    async function loadCalendar() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(feedUrl, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const text = await response.text();
        const parsedEvents = parseICal(text);

        setEvents(parsedEvents);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCalendar();

    return () => controller.abort();
  }, [feedUrl]);

  return {
    events,
    loading,
    error,
  };
}

export default useICal;
