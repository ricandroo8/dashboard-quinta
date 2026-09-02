import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSpotifyPlayback } from "./spotify.js";

test("normalizza una traccia e limita l'avanzamento alla durata", () => {
    const playback = normalizeSpotifyPlayback({
        currently_playing_type: "track",
        is_playing: true,
        progress_ms: 250000,
        item: {
            type: "track",
            name: "Test track",
            duration_ms: 180000,
            artists: [{ name: "Artist one" }, { name: "Artist two" }],
            album: {
                name: "Test album",
                images: [{ url: "https://example.com/cover.jpg" }],
            },
        },
    });

    assert.deepEqual(playback, {
        title: "Test track",
        artist: "Artist one, Artist two",
        album: "Test album",
        imageUrl: "https://example.com/cover.jpg",
        durationMs: 180000,
        progressMs: 180000,
        isPlaying: true,
        contentType: "track",
    });
});

test("normalizza un episodio usando i fallback del podcast", () => {
    const playback = normalizeSpotifyPlayback({
        currently_playing_type: "episode",
        is_playing: false,
        progress_ms: -10,
        item: {
            type: "episode",
            name: "Test episode",
            duration_ms: 90000,
            images: [],
            show: {
                name: "Test podcast",
                publisher: "Test publisher",
                images: [{ url: "https://example.com/podcast.jpg" }],
            },
        },
    });

    assert.equal(playback.artist, "Test publisher");
    assert.equal(playback.album, "Test podcast");
    assert.equal(playback.imageUrl, "https://example.com/podcast.jpg");
    assert.equal(playback.progressMs, 0);
});

test("gestisce campi mancanti senza generare errori", () => {
    const playback = normalizeSpotifyPlayback({
        is_playing: false,
        item: { type: "track" },
    });

    assert.equal(playback.title, "Titolo non disponibile");
    assert.equal(playback.artist, "Artista sconosciuto");
    assert.equal(playback.album, "Album non disponibile");
    assert.equal(playback.imageUrl, null);
    assert.equal(playback.durationMs, 0);
});

test("restituisce null senza contenuto o per tipi non supportati", () => {
    assert.equal(normalizeSpotifyPlayback(null), null);
    assert.equal(
        normalizeSpotifyPlayback({ item: { type: "advertisement" } }),
        null,
    );
});
