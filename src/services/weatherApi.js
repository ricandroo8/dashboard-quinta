const WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const DEFAULT_CITY =
  import.meta.env.VITE_DEFAULT_WEATHER_CITY || "Frossasco";

async function fetchWeather (params, signal, locationLabel) {
    if (!API_KEY) {
        throw new Error("Chiave OpenWeatherMap non configurata");
    }

    const url = new URL(WEATHER_API_URL);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    url.searchParams.set("appid", API_KEY);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "it");

    const response = await fetch(url, { signal });

    if (!response.ok) {
    if (response.status === 404) {
        throw new Error(`Meteo non trovato per "${locationLabel}"`);
    }

    if (response.status === 401) {
        throw new Error("Chiave OpenWeatherMap non valida");
    }

    throw new Error(
        `Servizio meteo non disponibile (${response.status})`
    );
    }

    const data = await response.json();

    const currentCondition = data.weather?.[0];
    const main = data.main;

    if(!main || !currentCondition) {
        throw new Error("Errore meteo: risposta incompleta")
    }

    const hasValidTemperatures = [
        main.temp,
        main.temp_min,
        main.temp_max,
    ].every(Number.isFinite);

    if (!hasValidTemperatures) {
        throw new Error("Temperature meteo non valide");
    }

    const normalizedWeather = {
        location: data.name || locationLabel,
        temperature: Math.round(main.temp),
        minTemperature: Math.round(main.temp_min),
        maxTemperature: Math.round(main.temp_max),
        condition: currentCondition.description ?? "Condizione non disponibile",
        icon: currentCondition.icon ?? null,
        humidity: main.humidity ?? null,
    };

    return normalizedWeather;
}

export function fetchWeatherByCity(city = DEFAULT_CITY, signal) {
  const normalizedCity =
    typeof city === "string" && city.trim()
      ? city.trim()
      : DEFAULT_CITY;

  return fetchWeather(
    { q: normalizedCity },
    signal,
    normalizedCity
  );
}

export async function fetchWeatherByCoords(latitude, longitude, signal) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Coordinate geografiche non valide");
  }

  return fetchWeather(
    { lat: latitude, lon: longitude },
    signal,
    "Posizione attuale"
  );
}

