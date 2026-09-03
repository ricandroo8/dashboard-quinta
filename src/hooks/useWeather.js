import { useEffect, useState } from "react";
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
} from "../services/weatherApi";

const MAX_LOCATION_ACCURACY_METERS = 10000;

function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalizzazione non disponibile"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      reject,
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  });
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationSource, setLocationSource] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        let coordinates = null;

        try {
          coordinates = await getCurrentCoordinates();
          if (
            !Number.isFinite(coordinates.accuracy) ||
            coordinates.accuracy > MAX_LOCATION_ACCURACY_METERS
          ) {
            coordinates = null;
          }
        } catch {
          // Permesso negato, timeout o posizione assente: usa la città configurata.
          coordinates = null;
        }

        // La geolocalizzazione non è annullabile con AbortController.
        if (controller.signal.aborted) return;

        const weatherData = coordinates
          ? await fetchWeatherByCoords(
              coordinates.latitude,
              coordinates.longitude,
              controller.signal
            )
          : await fetchWeatherByCity(undefined, controller.signal);

        if (!controller.signal.aborted) {
          setWeather(weatherData);
          setLocationSource(coordinates ? "geolocation" : "configured");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWeather();
    return () => controller.abort();
  }, []);

  return { weather, loading, error, locationSource };
}

export default useWeather;
