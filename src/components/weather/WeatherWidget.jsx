import useWeather from "../../hooks/useWeather";

function WeatherWidget() {
  const { weather, loading, error, locationSource } = useWeather();

  return (
    <section
      aria-label="Meteo"
      aria-busy={loading}
      className="min-h-56 rounded-3xl border border-white/10 bg-slate-900/60 p-5"
    >
      <h2 className="font-semibold">Meteo</h2>
      {loading ? (
        <p role="status">Rilevamento posizione e caricamento meteo...</p>
      ) : error ? (
        <p role="alert">Errore: {error}</p>
      ) : !weather ? (
        <p>Dati meteo non disponibili</p>
      ) : (
        <>
          <p>{weather.location}</p>
          <p className="text-xs text-slate-400">
            {locationSource === "geolocation"
              ? "Posizione rilevata"
              : "Città configurata · posizione non disponibile o imprecisa"}
          </p>
          <p className="mt-2 text-4xl font-semibold">{weather.temperature} °C</p>
          <p className="capitalize text-slate-400">{weather.condition}</p>
        </>
      )}
    </section>
  );
}

export default WeatherWidget;
