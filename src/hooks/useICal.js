import { useEffect, useState } from "react";
import { parseICal } from "../utils/ical";

function useICal(feedUrl) {
  // stati
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    // Fetch
    async function loadCalendar() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(feedUrl);
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            
            const text = await response.text();
            const parsedEvents = parseICal(text);

            setEvents(parsedEvents);

        } catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    }
    
    loadCalendar();
  }, [feedUrl]);

  return {
    events,
    loading,
    error,
  };
}

export default useICal;