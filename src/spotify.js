// REPLACE with your Spotify Client ID
const CLIENT_ID = "a65cafd94dd64b9e972cf8a08a59fe22";
const REDIRECT_URI = "http://127.0.0.1:5173/";

// 1. PKCE Security Helpers (Keep these as they are)
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

// 2. Login Redirect (Using the REAL Spotify Authorize URL)
export const redirectToSpotifyAuth = async () => {
    // Clear old data to prevent the 400 error
    window.localStorage.removeItem('code_verifier');

    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('code_verifier', codeVerifier);

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    const params = {
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: 'user-read-private',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: REDIRECT_URI,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
};

// 3. Exchange Code for Token (Using the REAL Spotify Token URL)
export const getTokenFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return null;

    const codeVerifier = window.localStorage.getItem('code_verifier');

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
        }),
    };

    const response = await fetch("https://accounts.spotify.com/api/token", payload);
    const data = await response.json();

    if (data.access_token) {
        window.history.replaceState({}, document.title, "/");
        return data.access_token;
    }
    return null;
};

// 4. Fetch Recommendations (Using the REAL Spotify API URL)
export const fetchSpotifyRecommendations = async (token, valence, energy, genre) => {
    // FIXED: Correct base URL and query parameters
    const endpoint = `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&target_valence=${valence}&target_energy=${energy}`;

    const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Spotify API Error details:", errorData);
        throw new Error("Failed to fetch from Spotify API");
    }

    const data = await response.json();

    if (data.tracks && data.tracks.length > 0) {
        return data.tracks[0];
    } else {
        throw new Error("No tracks found for this mood.");
    }
};