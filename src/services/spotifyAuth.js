const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
];

function generateCodeVerifier(length = 64) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(
    randomValues,
    (value) => characters[value % characters.length],
  ).join("");
}

async function generateCodeChallenge(verifier) {
  const encodedVerifier = new TextEncoder().encode(verifier);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    encodedVerifier,
  );

  return btoa(
    String.fromCharCode(...new Uint8Array(digest)),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function redirectToSpotifyLogin() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("spotify_code_verifier", verifier);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: scopes.join(" "),
        code_challenge_method: "S256",
        code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;

}

export async function exchangeSpotifyCode(code) {
  // Recupero verifier
  const verifier = localStorage.getItem("spotify_code_verifier"); 

  if (!code) {
    throw new Error("Codice Spotify mancante");
  }

  if (!verifier) {
    throw new Error("Verifier PKCE mancante");
  }

  // Preparazione richiesta
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  // Chiamata a Spotify
  const endpoint = "https://accounts.spotify.com/api/token";

  const response = await fetch(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  // Gestione risposta
  const data = await response.json();

  if(!response.ok) {
    throw new Error(
      data.error_description ?? "Errore durante il collegamento a Spotify",
    );
  }

  localStorage.setItem("spotify_access_token", data.access_token);

  if(data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem(
    "spotify_token_expires_at",
    expiresAt.toString(),
  );

  localStorage.removeItem("spotify_code_verifier");

  return data;
}