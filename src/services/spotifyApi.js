import { getValidSpotifyAccessToken } from "./spotifyAuth";
import { normalizeSpotifyPlayback } from "../utils/spotify";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

function getSpotifyErrorMessage(status) {
    switch (status) {
        case 401:
            return "La sessione Spotify è scaduta. Ricollega l'account.";
        case 403:
            return "Spotify non consente questo comando. Verifica account e permessi.";
        case 404:
            return "Nessun dispositivo Spotify attivo.";
        case 429:
            return "Troppe richieste a Spotify. Riprova tra poco.";
        default:
            return `Spotify non è disponibile (HTTP ${status}).`;
    }
}

async function spotifyRequest(path, options = {}) {
    const accessToken = await getValidSpotifyAccessToken();

    if (!accessToken) {
        throw new Error("Collega Spotify per usare il player.");
    }

    const response = await fetch(
        `${SPOTIFY_API_URL}${path}`,
        {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        throw new Error(getSpotifyErrorMessage(response.status));
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        return null;
    }

    return response.json();
}

export async function getCurrentlyPlayingTrack(options = {}) {
    const data = await spotifyRequest(
        "/me/player/currently-playing?additional_types=track,episode",
        { signal: options.signal },
    );

    return normalizeSpotifyPlayback(data);
}

export function skipToNextTrack() {
    return spotifyRequest("/me/player/next", { method: "POST" });
}

export function skipToPreviousTrack() {
    return spotifyRequest("/me/player/previous", { method: "POST" });
}

export function resumePlayback() {
    return spotifyRequest("/me/player/play", { method: "PUT" });
}

export function pausePlayback() {
    return spotifyRequest("/me/player/pause", { method: "PUT" });
}
