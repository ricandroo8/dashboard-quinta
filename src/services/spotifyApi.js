import { InspectionPanel } from "lucide-react";
import { getValidSpotifyAccessToken } from "./spotifyAuth";

export async function getCurrentlyPlayingTrack() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) {
        return null;
    }

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    console.log("Spotify currently playing response:", response.status);

    if (response === 204) {
        return null;
    }

    if(!response.ok) {
        throw new Error("Errore nella richiesta API a Spotify");
    }

    const data = await response.json();

    console.log("Spotify raw data:", data)

    return {
        title: data.item.name,
        artist: data.item.artists.map((artist) => artist.name).join(", "),
        album: data.item.album.name,
        imageUrl: data.item.album.images[0]?.url ?? null,
        durationMs: data.item.duration_ms,
        progressMs: data.progress_ms,
        isPlaying: data.is_playing,
    };
}