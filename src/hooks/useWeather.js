import { useEffect, useState } from "react";
import { fetchWeatherByCity } from "../services/weatherApi";

function useWeather() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect (() => {
        async function loadWeather() {
            try {
                const weatherData = await fetchWeatherByCity();

                setWeather(weatherData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadWeather();
    }, []);

    return {
        weather,
        loading,
        error,
    };
}

export default useWeather;