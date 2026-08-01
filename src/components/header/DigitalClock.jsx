import { useEffect, useState } from 'react';

function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const formattedTime = new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime);

  return (
    <time
      dateTime={currentTime.toISOString()}
      className="font-mono text-2xl font-semibold tabular-nums text-slate-100"
    >
      {formattedTime}
    </time>
  );
}

export default DigitalClock;