import { useEffect, useState } from "react";
import {
  calculateCountdown,
  formatRaceDate,
} from "../../utils/formula1";

function F1Widget({ data }) {
    const { nextRace, drivers, constructors } = data;
    const [countdown, setCountdown] = useState(() =>
        calculateCountdown(nextRace.startDate)
    );

    useEffect(() => {
    function updateCountdown() {
        setCountdown(
            calculateCountdown(nextRace.startDate)
        );
    }

    updateCountdown();

    const intervalId = setInterval(
        updateCountdown,
        1000
    );

    return () => {
        clearInterval(
            intervalId
        );
    };
    }, [nextRace.startDate]);

    return(
        <section className="
            bg-slate-800/60
            border
            border-slate-700/50
            rounded-2xl
            p-6
            shadow-2xl"
        >
            <h2>Formula 1</h2>

            <h3>{nextRace.name}</h3>
            <p>{nextRace.circuit}</p>
            <p>{nextRace.country}</p>
            <p>{formatRaceDate(nextRace.startDate)}</p>

            {countdown ? (
                <p>
                    {countdown.days}g{" "}
                    {countdown.hours}h{" "}
                    {countdown.minutes}m{" "}
                    {countdown.seconds}s
                </p>
                ) : (
                <p>Gara iniziata o conclusa</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <h3>Classifica piloti</h3>
                    {drivers.map((driver) => (
                        <p key={driver.id}>
                            {driver.position}. {driver.name}: {driver.team} · {driver.points} punti
                        </p>
                    ))}
                </div>

                <div>
                    <h3>Classifica costruttori</h3>
                    {constructors.map((constructor) => (
                        <p key={constructor.id}>
                            {constructor.position}. {constructor.name}: {constructor.points} punti
                        </p>
                    ))}
                </div>
            </div>
            
        </section>
    );
}

export default F1Widget;