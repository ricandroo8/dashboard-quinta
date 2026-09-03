import {
  Cloud, CloudFog, CloudLightning, CloudMoon, CloudRain,
  CloudSun, CloudSunRain, CloudMoonRain, LoaderCircle,
  MapPin, Moon, Snowflake, Sun, Thermometer,
} from "lucide-react";
import useWeather from "../../hooks/useWeather";

const WEATHER_ICONS = {
  "01d": Sun, "01n": Moon,
  "02d": CloudSun, "02n": CloudMoon,
  "03d": Cloud, "03n": Cloud,
  "04d": Cloud, "04n": Cloud,
  "09d": CloudRain, "09n": CloudRain,
  "10d": CloudSunRain, "10n": CloudMoonRain,
  "11d": CloudLightning, "11n": CloudLightning,
  "13d": Snowflake, "13n": Snowflake,
  "50d": CloudFog, "50n": CloudFog,
};

function WeatherWidget() {
  const { weather, loading, error, locationSource } = useWeather();
  const WeatherIcon = WEATHER_ICONS[weather?.icon] || Thermometer;

  return (
    <section
      aria-label="Meteo"
      aria-busy={loading}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-md"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/[0.06] to-transparent" />
      <div className="relative">
        <header className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <Thermometer size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Meteo</h2>
            <p className="text-xs text-slate-400">Condizioni attuali</p>
          </div>
        </header>

        {loading ? (
          <p role="status" className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-slate-300">
            <LoaderCircle size={16} aria-hidden="true" className="mt-1 shrink-0 motion-safe:animate-spin" />
            Rilevamento posizione e caricamento meteo…
          </p>
        ) : error ? (
          <p role="alert" className="mt-5 break-words rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-relaxed text-rose-200">
            {error}
          </p>
        ) : !weather ? (
          <p className="mt-5 text-sm text-slate-300">Dati meteo non disponibili</p>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="break-words text-base font-medium text-slate-200">{weather.location}</p>
                <p className="mt-1 whitespace-nowrap text-4xl font-semibold tracking-tight text-slate-50">
                  {weather.temperature}<span className="ml-1 text-2xl font-normal text-slate-300">°C</span>
                </p>
                <p className="mt-1 break-words text-sm capitalize leading-relaxed text-slate-300">{weather.condition}</p>
              </div>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/5 text-cyan-200">
                <WeatherIcon size={38} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>
            <footer className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-400">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} aria-hidden="true" className="shrink-0" />
                {locationSource === "geolocation" ? "Posizione rilevata" : "Città configurata"}
              </p>
              {locationSource === "configured" && (
                <p className="mt-1">Posizione automatica non disponibile o imprecisa.</p>
              )}
            </footer>
          </>
        )}
      </div>
    </section>
  );
}

export default WeatherWidget;
