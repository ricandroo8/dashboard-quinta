import { useEffect, useState } from "react";
import {
  CalendarDays,
  Flag,
  MapPin,
  Trophy,
} from "lucide-react";
import {
  calculateCountdown,
  formatRaceDate,
} from "../../utils/formula1";

const podiumStyles = {
  1: "border-amber-300/20 bg-amber-300/[0.08]",
  2: "border-slate-300/15 bg-slate-300/[0.06]",
  3: "border-orange-300/15 bg-orange-300/[0.06]",
};

function StandingRow({ position, name, detail, points }) {
  const accentClass =
    podiumStyles[position] ??
    "border-white/[0.06] bg-white/[0.025]";

  return (
    <div
      className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-2.5 py-2 ${accentClass}`}
    >
      <span className="text-center text-xs font-bold tabular-nums text-slate-400">
        {position}
      </span>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-200">
          {name}
        </p>
        {detail && (
          <p className="mt-0.5 truncate text-[10px] text-slate-500">
            {detail}
          </p>
        )}
      </div>

      <p className="text-right text-xs font-bold tabular-nums text-slate-200">
        {points}
        <span className="ml-0.5 text-[9px] font-medium text-slate-500">
          pt
        </span>
      </p>
    </div>
  );
}

function CountdownUnit({ value, label }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/15 px-2 py-2.5 text-center">
      <p className="text-base font-bold tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

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

    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-sky-500/[0.06] blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
                <Trophy size={17} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">Formula 1</h2>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Prossimo Gran Premio
                </p>
              </div>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
              Round {nextRace.round}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_72px] gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-bold leading-tight text-white">
                {nextRace.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <p className="flex min-w-0 items-center gap-2">
                  <MapPin size={13} className="shrink-0 text-red-300" aria-hidden="true" />
                  <span className="truncate">
                    {nextRace.circuit}, {nextRace.country}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={13} className="shrink-0 text-red-300" aria-hidden="true" />
                  {formatRaceDate(nextRace.startDate)}
                </p>
              </div>
            </div>

            <div className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-slate-400">
              <Flag size={22} className="text-red-300" aria-hidden="true" />
              <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider">
                Circuito
              </span>
            </div>
          </div>

          {countdown ? (
            <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Countdown al Gran Premio">
              <CountdownUnit value={countdown.days} label="Giorni" />
              <CountdownUnit value={countdown.hours} label="Ore" />
              <CountdownUnit value={countdown.minutes} label="Min" />
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-3 py-2 text-center text-xs font-medium text-red-200">
              Gara iniziata o conclusa
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-slate-200">Piloti</h3>
                <span className="text-[9px] uppercase tracking-wider text-slate-600">
                  Punti
                </span>
              </div>

              <div className="dashboard-scrollbar max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {drivers.map((driver) => (
                  <StandingRow
                    key={driver.id}
                    position={driver.position}
                    name={driver.name}
                    detail={driver.team}
                    points={driver.points}
                  />
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-slate-200">Costruttori</h3>
                <span className="text-[9px] uppercase tracking-wider text-slate-600">
                  Punti
                </span>
              </div>

              <div className="dashboard-scrollbar max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {constructors.map((constructor) => (
                  <StandingRow
                    key={constructor.id}
                    position={constructor.position}
                    name={constructor.name}
                    points={constructor.points}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default F1Widget;
