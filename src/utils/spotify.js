function toSafeMilliseconds(value) {
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function getFirstImageUrl(images) {
    return images?.find((image) => image?.url)?.url ?? null;
}

export function normalizeSpotifyPlayback(data) {
    const item = data?.item;

    if (!item) {
        return null;
    }

    const contentType = data.currently_playing_type ?? item.type;
    const durationMs = toSafeMilliseconds(item.duration_ms);
    const rawProgressMs = toSafeMilliseconds(data.progress_ms);
    const progressMs = durationMs
        ? Math.min(rawProgressMs, durationMs)
        : rawProgressMs;

    if (contentType === "track") {
        return {
            title: item.name || "Titolo non disponibile",
            artist:
                item.artists
                    ?.map((artist) => artist?.name)
                    .filter(Boolean)
                    .join(", ") || "Artista sconosciuto",
            album: item.album?.name || "Album non disponibile",
            imageUrl: getFirstImageUrl(item.album?.images),
            durationMs,
            progressMs,
            isPlaying: Boolean(data.is_playing),
            contentType,
        };
    }

    if (contentType === "episode") {
        return {
            title: item.name || "Episodio non disponibile",
            artist:
                item.show?.publisher ||
                item.show?.name ||
                "Autore sconosciuto",
            album: item.show?.name || "Podcast",
            imageUrl:
                getFirstImageUrl(item.images) ??
                getFirstImageUrl(item.show?.images),
            durationMs,
            progressMs,
            isPlaying: Boolean(data.is_playing),
            contentType,
        };
    }

    return null;
}
