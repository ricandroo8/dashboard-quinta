import { useEffect, useState } from "react";

function useF1Data() {
    const [nextRace, setNextRace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadNextRace() {
            setLoading(true);
            setError(null);

            const url = "https://api.jolpi.ca/ergast/f1/current/next.json"

            try {
                const response = await fetch(url);    

                if(!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }

                const json = await response.json();

                const apiRace = json.MRData?.RaceTable?.Races?.[0];

                if(!apiRace){
                    throw new Error(`Nessun Gran Premio futuro disponibile`);
                }

                const normalizedRace = {
                    id: `${apiRace.season}-${apiRace.round}`,
                    name: apiRace.raceName,
                    circuit: apiRace.Circuit.circuitName,
                    country: apiRace.Circuit.Location.country,
                    round: Number(apiRace.round),
                    startDate: `${apiRace.date}T${apiRace.time ?? "00:00:00Z"}`,
                }
                
                setNextRace(normalizedRace);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        }

        loadNextRace();
    }, []);

    return {
        nextRace,
        loading,
        error,
    };
}

export default useF1Data;