import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from cachetools import TTLCache, cached
from dotenv import load_dotenv

load_dotenv()

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

cache = TTLCache(maxsize=200, ttl=600)

def get_fallback_tracks():
    return [{
        "id": "2OznO10m4D5O0IibIq1j6I", 
        "name": "Weightless", 
        "artist": "Marconi Union",
        "uri": "spotify:track:2OznO10m4D5O0IibIq1j6I"
    }]

@cached(cache)
def get_spotify_recommendations(valence: float, energy: float, genres: tuple) -> list:
    """
    Queries Spotify via Search to bypass the restricted /recommendations endpoint,
    then filters by audio features to match the exact VADER sentiment.
    """
    try:
        # 1. Bypass block: Search for 20 tracks in the target genre
        query = f"genre:{genres[0]}"
        search_results = sp.search(q=query, type='track', limit=20)
        tracks = search_results['tracks']['items']
        
        if not tracks:
            return get_fallback_tracks()

        # 2. Get the actual audio features for these 20 tracks
        track_ids = [t['id'] for t in tracks]
        features = sp.audio_features(track_ids)
        
        # 3. Score them: Find the tracks whose valence/energy are closest to our NLP math
        scored_tracks = []
        for track, feat in zip(tracks, features):
            if feat is None:
                continue
            # The lower the difference, the closer it matches the user's mood
            val_diff = abs(feat['valence'] - valence)
            eng_diff = abs(feat['energy'] - energy)
            score = val_diff + eng_diff
            scored_tracks.append((score, track))
        
        # 4. Sort by best match and grab the top 4
        scored_tracks.sort(key=lambda x: x[0])
        best_tracks = [t[1] for t in scored_tracks[:4]]

        return [
            {
                "id": track["id"],
                "name": track["name"],
                "artist": track["artists"][0]["name"],
                "uri": track["uri"]
            }
            for track in best_tracks
        ]
        
    except Exception as e:
        print(f"Spotify API Error: {e}")
        return get_fallback_tracks()