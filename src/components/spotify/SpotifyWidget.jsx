import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

import {
  exchangeSpotifyCode,
  getValidSpotifyAccessToken,
  redirectToSpotifyLogin,
} from "../../services/spotifyAuth";

function SpotifyWidget() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const [isConnected, setIsConnected] = useState(
        () => Boolean(localStorage.getItem("spotify_access_token")),
    );

    useEffect(() => {
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