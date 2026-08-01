import { useEffect, useState } from 'react';

function calculateTimeRemaining(targetDate) {
  const targetTime = new Date(targetDate).getTime();
  const currentTime = Date.now();
  const difference = targetTime - currentTime;

  if (Number.isNaN(targetTime)) {
    return null;
  }

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
    isExpired: false,
  };
}

function Countdown({ targetDate }) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateTimeRemaining(targetDate)
  );

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining(targetDate));

    const intervalId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [targetDate]);

  if (!timeRemaining) {
    return (
      <p className="text-sm text-red-400">
        Data non valida
      </p>
    );
  }

  if (timeRemaining.isExpired) {
    return (
      <p className="text-sm font-semibold text-emerald-400">
        Il giorno è arrivato
      </p>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
        All'inizio della scuola
      </p>

      <div className="flex items-baseline justify-end gap-2 font-mono tabular-nums">
        <span className="text-lg font-semibold text-slate-100">
          {timeRemaining.days}g
        </span>

        <span className="text-sm text-slate-400">
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

export default Countdown;