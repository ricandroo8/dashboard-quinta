import { useEffect, useState } from "react";
import {
    Music2,
    Pause,
    Play,
    SkipBack,
    SkipForward,
} from "lucide-react";

import {
    exchangeSpotifyCode,
    getValidSpotifyAccessToken,
    redirectToSpotifyLogin,
} from "../../services/spotifyAuth";

import {
    getCurrentlyPlayingTrack,
    pausePlayback,
    resumePlayback,
    skipToNextTrack,
    skipToPreviousTrack,
} from "../../services/spotifyApi";

function formatTime(ms) {
    const safeMilliseconds = Number.isFinite(ms)
        ? Math.max(ms, 0)
        : 0;
    const totalSeconds = Math.floor(safeMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function TrackArtwork({ imageUrl }) {
    const [hasImageError, setHasImageError] = useState(false);

    if (imageUrl && !hasImageError) {
        return (
            <img
                src={imageUrl}
                alt=""
                onError={() => setHasImageError(true)}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/20"
            />
        );
    }

    return (
        <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400/20 to-cyan-400/10 text-green-200 ring-1 ring-inset ring-white/10"
            aria-hidden="true"
        >
            <Music2 size={26} />
        </div>
    );
}

function SpotifyWidget() {
    const [spotifyCallback] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return {
            code: params.get("code"),
            error: params.get("error"),
        };
    });

    const [isConnecting, setIsConnecting] = useState(false);
    const [isControlling, setIsControlling] = useState(false);
    const [error, setError] = useState(() =>
        spotifyCallback.error
            ? `Autorizzazione Spotify non riuscita: ${spotifyCallback.error}`
            : null,
    );
    const [pollingError, setPollingError] = useState(null);
    const [isLoadingPlayback, setIsLoadingPlayback] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [displayProgressMs, setDisplayProgressMs] = useState(0);

    const [isConnected, setIsConnected] = useState(
        () => Boolean(localStorage.getItem("spotify_access_token")),
    );

    useEffect(() => {
        const { code, error: spotifyError } = spotifyCallback;

        if (spotifyError) {
            window.history.replaceState({}, document.title, "/");
            return;
        }

        if (!code) {
            async function validateSpotifySession() {
                try {
                    setIsConnecting(true);
                    setError(null);

                    const token = await getValidSpotifyAccessToken();

                    setIsConnected(Boolean(token));
                } catch (err) {
                    setIsConnected(false);
                    setError(err.message);
                } finally {
                    setIsConnecting(false);
                }
            }

            validateSpotifySession();
            return;
        }

        window.history.replaceState({}, document.title, "/");

        async function completeSpotifyConnection() {
            try {
                setIsConnecting(true);
                setError(null);

                await exchangeSpotifyCode(code);

                setIsConnected(true);
            } catch (err) {
                setError(err.message);
                setIsConnected(false);
            } finally {
                setIsConnecting(false);
            }
        }

        completeSpotifyConnection();
    }, [spotifyCallback]);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        let isActive = true;
        let timeoutId;
        let controller;

        async function refreshCurrentTrack() {
            controller = new AbortController();

            try {
                const track = await getCurrentlyPlayingTrack({
                    signal: controller.signal,
                });

                if (!isActive) {
                    return;
                }

                setCurrentTrack(track);
                setDisplayProgressMs(track?.progressMs ?? 0);
                setPollingError(null);
            } catch (err) {
                if (!isActive || err.name === "AbortError") {
                    return;
                }

                setPollingError(
                    err.message ||
                        "Impossibile aggiornare la riproduzione.",
                );
            } finally {
                if (isActive) {
                    setIsLoadingPlayback(false);
                    timeoutId = window.setTimeout(
                        refreshCurrentTrack,
                        5000,
                    );
                }
            }
        }

        refreshCurrentTrack();

        return () => {
            isActive = false;
            controller?.abort();
            window.clearTimeout(timeoutId);
        };
    }, [isConnected]);

    useEffect(() => {
        if (!currentTrack || !currentTrack.isPlaying) {
            return;
        }

        const intervalId = setInterval(() => {
            setDisplayProgressMs((previousProgress) =>
                Math.min(
                    previousProgress + 1000,
                    currentTrack.durationMs,
                ),
            );
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [currentTrack]);

    async function handlePlaybackCommand(command) {
        if (isControlling) {
            return;
        }

        try {
            setIsControlling(true);
            setError(null);

            await command();

            const updatedTrack =
                await getCurrentlyPlayingTrack();

            setCurrentTrack(updatedTrack);
            setDisplayProgressMs(
                updatedTrack?.progressMs ?? 0,
            );
            setPollingError(null);
        } catch (err) {
            setError(
                err.message ||
                    "Impossibile controllare la riproduzione.",
            );
        } finally {
            setIsControlling(false);
        }
    }

    const progressPercentage =
        currentTrack?.durationMs > 0
            ? Math.min(
                (displayProgressMs /
                    currentTrack.durationMs) *
                    100,
                100,
            )
            : 0;

    const secondaryControlClasses = [
        "rounded-full p-2 text-slate-300 transition",
        "hover:bg-white/10 hover:text-white",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-green-300",
        "disabled:cursor-wait disabled:opacity-50",
    ].join(" ");

    return (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-400/10 text-green-300 ring-1 ring-inset ring-green-300/10">
                        <Music2
                            size={19}
                            aria-hidden="true"
                        />
                    </span>

                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-slate-100">
                            Spotify
                        </h2>
                        <p className="truncate text-xs text-slate-500">
                            {isConnected
                                ? "Account collegato"
                                : "Player personale"}
                        </p>
                    </div>
                </div>

                {isConnected && (
                    <span className="shrink-0 rounded-full border border-green-300/15 bg-green-300/10 px-2.5 py-1 text-[11px] font-medium text-green-200">
                        Connesso
                    </span>
                )}
            </div>

            {!isConnected && (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                    Collega il tuo account per controllare la riproduzione.
                </p>
            )}

            {isConnected && currentTrack && (
                <div className="mt-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                        <TrackArtwork
                            key={currentTrack.imageUrl ?? "fallback"}
                            imageUrl={currentTrack.imageUrl}
                        />

                        <div className="min-w-0">
                            <p
                                className="truncate font-semibold text-slate-100"
                                title={currentTrack.title}
                            >
                                {currentTrack.title}
                            </p>

                            <p
                                className="mt-0.5 truncate text-sm text-slate-400"
                                title={currentTrack.artist}
                            >
                                {currentTrack.artist}
                            </p>

                            <p
                                className="mt-1 truncate text-xs text-slate-500"
                                title={currentTrack.album}
                            >
                                {currentTrack.contentType === "episode"
                                    ? "Podcast"
                                    : currentTrack.album}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            disabled={isControlling}
                            onClick={() =>
                                handlePlaybackCommand(
                                    skipToPreviousTrack,
                                )
                            }
                            aria-label="Brano precedente"
                            className={secondaryControlClasses}
                        >
                            <SkipBack
                                size={19}
                                aria-hidden="true"
                            />
                        </button>

                        <button
                            type="button"
                            disabled={isControlling}
                            onClick={() =>
                                handlePlaybackCommand(
                                    currentTrack.isPlaying
                                        ? pausePlayback
                                        : resumePlayback,
                                )
                            }
                            aria-label={
                                currentTrack.isPlaying
                                    ? "Metti in pausa"
                                    : "Riprendi la riproduzione"
                            }
                            className={[
                                "rounded-full bg-green-400 p-2.5",
                                "text-slate-950 transition",
                                "hover:bg-green-300",
                                "focus-visible:outline-none",
                                "focus-visible:ring-2",
                                "focus-visible:ring-green-200",
                                "focus-visible:ring-offset-2",
                                "focus-visible:ring-offset-slate-900",
                                "disabled:cursor-wait",
                                "disabled:opacity-50",
                            ].join(" ")}
                        >
                            {currentTrack.isPlaying ? (
                                <Pause
                                    size={20}
                                    aria-hidden="true"
                                />
                            ) : (
                                <Play
                                    size={20}
                                    aria-hidden="true"
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            disabled={isControlling}
                            onClick={() =>
                                handlePlaybackCommand(
                                    skipToNextTrack,
                                )
                            }
                            aria-label="Brano successivo"
                            className={secondaryControlClasses}
                        >
                            <SkipForward
                                size={19}
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    <div className="mt-3">
                        <div
                            className="h-1.5 overflow-hidden rounded-full bg-white/10"
                            role="progressbar"
                            aria-label="Avanzamento riproduzione"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={Math.round(progressPercentage)}
                        >
                            <div
                                className="h-full rounded-full bg-green-400 transition-[width] duration-300"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>

                        <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                            <span>
                                {formatTime(displayProgressMs)}
                            </span>

                            <span>
                                {formatTime(
                                    currentTrack.durationMs,
                                )}
                            </span>
                        </div>
                    </div>

                    <p className="mt-1 text-center text-xs text-slate-500">
                        {currentTrack.isPlaying
                            ? "In riproduzione"
                            : "In pausa"}
                    </p>
                </div>
            )}

            {isConnected &&
                !currentTrack &&
                !isConnecting &&
                isLoadingPlayback && (
                    <p
                        role="status"
                        className="mt-4 text-sm text-slate-400"
                    >
                        Aggiornamento della riproduzione...
                    </p>
                )}

            {isConnected &&
                !currentTrack &&
                !isConnecting &&
                !isLoadingPlayback &&
                !pollingError && (
                    <p className="mt-4 text-sm text-slate-400">
                        Nessuna traccia in riproduzione.
                    </p>
                )}

            {pollingError && (
                <p
                    role="status"
                    className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-200"
                >
                    Aggiornamento temporaneamente non disponibile. {pollingError}
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-200"
                >
                    {error}
                </p>
            )}

            {!isConnected && (
                <button
                    type="button"
                    disabled={isConnecting}
                    onClick={redirectToSpotifyLogin}
                    className="mt-4 rounded-xl bg-green-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60"
                >
                    {isConnecting
                        ? "Collegamento..."
                        : "Collega Spotify"}
                </button>
            )}
        </section>
    );
}

export default SpotifyWidget;
