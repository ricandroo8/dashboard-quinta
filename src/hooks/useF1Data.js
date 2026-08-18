import { useEffect, useState } from "react";

function useF1Data() {
    const [nextRace, setNextRace] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadF1Data() {
            setLoading(true);
            setError(null);

            const nextRaceUrl = "https://api.jolpi.ca/ergast/f1/current/next.json"
            const driversUrl = "https://api.jolpi.ca/ergast/f1/current/driverStandings.json";

            try {
                const [raceResponse, driversResponse] = await Promise.all([
                    fetch(nextRaceUrl),
                    fetch(driversUrl),
                ]);    

                if(!raceResponse.ok) {
                    throw new Error(`Errore HTTP - Race: ${raceResponse.status}`);
                }
                if(!driversResponse.ok) {
                    throw new Error(`Errore HTTP - Drivers: ${driversResponse.status}`);
                }

                const [raceJson, driversJson] = await Promise.all([
                    raceResponse.json(),
                    driversResponse.json(),
                ]);

                const apiRace = raceJson.MRData?.RaceTable?.Races?.[0];
                const apiDrivers = driversJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

                if(!apiRace){
                    throw new Error(`Nessun Gran Premio futuro disponibile`);
                }
                if(!apiDrivers){
                    throw new Error(`Nessuna classifica piloti disponibile`);
                }

                const normalizedRace = {
                    id: `${apiRace.season}-${apiRace.round}`,
                    name: apiRace.raceName,
                    circuit: apiRace.Circuit.circuitName,
                    country: apiRace.Circuit.Location.country,
                    round: Number(apiRace.round),
                    startDate: `${apiRace.date}T${apiRace.time ?? "00:00:00Z"}`,
                }
                
                const normalizedDrivers = apiDrivers.map((standing) => ({
                    id: standing.Driver.driverId,
                    position: Number(standing.position),
                    name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
                    team: standing.Constructors?.[0]?.name ?? "Team non disponibile",
                    points: Number(standing.points),
                }));

                setNextRace(normalizedRace);
                setDrivers(normalizedDrivers);

                console.log("Piloti normalizzati:", normalizedDrivers);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        }

        loadF1Data();
    }, []);

    return {
        nextRace,
        drivers,
        loading,
        error,
    };
}

export default useF1Data;