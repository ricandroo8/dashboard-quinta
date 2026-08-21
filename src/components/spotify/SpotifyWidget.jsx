import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

import {
  exchangeSpotifyCode,
  getValidSpotifyAccessToken,
  redirectToSpotifyLogin,
} from "../../services/spotifyAuth";

import { getCurrentlyPlayingTrack } from "../../services/spotifyApi";

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SpotifyWidget() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);

    const [isConnected, setIsConnected] = useState(
        () => Boolean(localStorage.getItem("spotify_access_token")),
    );

    const [displayProgressMs, setDisplayProgressMs] = useState(0);

    useEffect(() => {
        console.log("USE EFFECT SPOTIFY PARTITO");
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const spotifyError = params.get("error");

        if (spotifyError) {
            setError(`Autorizzazione Spotify non riuscita: ${spotifyError}`);
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

                    if (token) {
                        const track = await getCurrentlyPlayingTrack();
                        console.log("TRACK TEST:", track);
                        setCurrentTrack(track);
                    }
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

    }, []);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        async function refreshCurrentTrack() {
            try {
                const track = await getCurrentlyPlayingTrack();
                setCurrentTrack(track);
            } catch (err) {
                console.log("Errore Spotify: ", err);
            }
        }

        refreshCurrentTrack();

        const intervalId = setInterval(refreshCurrentTrack, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isConnected]);

    useEffect(() => {
        if(!currentTrack) return;

        setDisplayProgressMs(currentTrack.progressMs);
    }, [currentTrack]);

    useEffect(() => {
        if (!currentTrack || !currentTrack.isPlaying) return;

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

    const progressPercentage = 
        currentTrack?.durationMs > 0
            ? Math.min(
                (displayProgressMs / currentTrack.durationMs) * 100,
                100,
              )
            : 0;

    return (
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3">
                <Music2 size={20} className="text-green-300" aria-hidden="true" />

                <h2 className="text-base font-semibold text-slate-100">
                    Spotify
                </h2>
            </div>

            <p className="text-sm text-slate-400">
                {isConnected
                    ? "Account Spotify collegato"
                    : "Collega il tuo account per controllare la riproduzione."}
            </p>
                {isConnected && currentTrack && (
                    <div className="mt-4">
                        <img
                            src={currentTrack.imageUrl}
                            alt=""
                            className="h-16 w-16 rounded-xl object-cover"
                        />

                        <p className="mt-2 font-semibold text-slate-100">
                            {currentTrack.title}
                        </p>

                        <p className="text-sm text-slate-400">
                            {currentTrack.artist}
                        </p>

                        <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-green-400 transition-[width] duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>

                            <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                                <span>{formatTime(displayProgressMs)}</span>
                                <span>{formatTime(currentTrack.durationMs)}</span>
                            </div>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            {currentTrack.isPlaying ? "In riproduzione" : "In pausa"}
                        </p>

                    </div>
                )}

                {isConnected && !currentTrack && !isConnecting && (
                    <p className="mt-4 text-sm text-slate-400">
                        Nessuna traccia in riproduzione.
                    </p>
                )}
            

            {error && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-red-300"
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
                    {isConnecting ? "Collegamento..." : "Collega Spotify"}
                </button>
            )}
        </section>
    );
}

export default SpotifyWidget;