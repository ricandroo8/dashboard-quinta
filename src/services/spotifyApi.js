import { getValidSpotifyAccessToken } from "./spotifyAuth";

export async function getCurrentlyPlayingTrack() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) {
        return null;
    }

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    if (response.status === 204) {
        return null;
    }

    if(!response.ok) {
        throw new Error("Errore nella richiesta API a Spotify");
    }

    const data = await response.json();
    const contentType =
        data.currently_playing_type ?? data.item?.type;

    if(!data.item) return null;

    const isTrack = contentType === "track";
    const isEpisode = contentType === "episode";

    let title;
    let artist;
    let album;
    let imageUrl;

    if (isTrack) {
        title = data.item.name ?? "Titolo non disponibile";
        artist = data.item.artists
            ?.map((artistItem) => artistItem.name)
            .filter(Boolean)
            .join(", ") || "Artista sconosciuto";
        album = data.item.album?.name ?? "Album non disponibile";
        imageUrl = data.item.album?.images?.[0]?.url ?? null;
    } else if (isEpisode) {
        title = data.item.name ?? "Episodio non disponibile";
        artist =
            data.item.show?.publisher ??
            data.item.show?.name ??
            "Autore sconosciuto";
        album = data.item.show?.name ?? "Podcast";
        imageUrl =
            data.item.images?.[0]?.url ??
            data.item.show?.images?.[0]?.url ??
            null;
    } else {
        return null;
    }

    return {
        title,
        artist,
        album,
        imageUrl,
        durationMs: data.item.duration_ms ?? 0,
        progressMs: data.progress_ms ?? 0,
        isPlaying: Boolean(data.is_playing),
        contentType,
    };
}

export async function skipToNextTrack() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) throw new Error ("Token mancante");

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Comando Spotify fallito: HTTP ${response.status}`,
        );
    }
}

export async function skipToPreviousTrack() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) throw new Error ("Token mancante");

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/previous",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Comando Spotify fallito: HTTP ${response.status}`,
        );
    }
}

export async function resumePlayback() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) throw new Error ("Token mancante");

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "PUT",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Comando Spotify fallito: HTTP ${response.status}`,
        );
    }
}

export async function pausePlayback() {
    const accessToken = await getValidSpotifyAccessToken();

    if(!accessToken) throw new Error ("Token mancante");

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/pause",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: "PUT",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Comando Spotify fallito: HTTP ${response.status}`,
        );
    }
}
