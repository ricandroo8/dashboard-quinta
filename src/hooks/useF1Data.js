import { useEffect, useState } from "react";

function useF1Data() {
    const [nextRace, setNextRace] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [constructors, setConstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadF1Data() {
            setLoading(true);
            setError(null);

            const nextRaceUrl = "https://api.jolpi.ca/ergast/f1/current/next.json"
            const driversUrl = "https://api.jolpi.ca/ergast/f1/current/driverStandings.json";
            const constructorsUrl = "https://api.jolpi.ca/ergast/f1/current/constructorStandings.json";

            try {
                const [raceResponse, driversResponse, constructorsResponse] = await Promise.all([
                    fetch(nextRaceUrl),
                    fetch(driversUrl),
                    fetch(constructorsUrl),
                ]);    

                if(!raceResponse.ok) {
                    throw new Error(`Errore HTTP - Race: ${raceResponse.status}`);
                }
                if(!driversResponse.ok) {
                    throw new Error(`Errore HTTP - Drivers: ${driversResponse.status}`);
                }
                if(!constructorsResponse.ok) {
                    throw new Error(`Errore HTTP - Constructors: ${constructorsResponse.status}`);
                }

                const [raceJson, driversJson, constructorsJson] = await Promise.all([
                    raceResponse.json(),
                    driversResponse.json(),
                    constructorsResponse.json(),
                ]);

                const apiRace = raceJson.MRData?.RaceTable?.Races?.[0];
                const apiDrivers = driversJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
                const apiConstructors = constructorsJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];


                if (!apiRace){
                    throw new Error(`Nessun Gran Premio futuro disponibile`);
                }
                if (apiDrivers.length === 0){
                    throw new Error(`Nessuna classifica piloti disponibile`);
                }
                if (apiConstructors.length === 0){
                    throw new Error(`Nessuna classifica costruttori disponibile`);
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

                const normalizedConstructors = apiConstructors.map((standing) => ({
                    id: standing.Constructor.constructorId,
                    position: Number(standing.position),
                    name: standing.Constructor.name,
                    points: Number(standing.points),
                }));

                setNextRace(normalizedRace);
                setDrivers(normalizedDrivers);
                setConstructors(normalizedConstructors);

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
        constructors,
        loading,
        error,
    };
}

export default useF1Data;