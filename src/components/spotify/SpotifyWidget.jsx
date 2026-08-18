import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

import {
  exchangeSpotifyCode,
  redirectToSpotifyLogin,
} from "../../services/spotifyAuth";

function SpotifyWidget() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const [isConnected, setIsConnected] = useState(
        () => Boolean(localStorage.getItem("spotify_access_token")),
    );

    return (
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3">
                <Music2 size={20} className="text-green-300" aria-hidden="true" />

                <h2 className="text-base font-semibold text-slate-100">
                    Spotify
                </h2>
            </div>

            <p className="text-sm text-slate-400">Collega il tuo account per controllare la riproduzione.</p>

            <button 
                type="button" 
                onClick={redirectToSpotifyLogin}
                className="mt-4 rounded-xl bg-green-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                Collega Spotify
            </button>
        </section>
    );
}

export default SpotifyWidget;