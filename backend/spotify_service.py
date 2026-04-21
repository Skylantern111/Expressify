import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from cachetools import TTLCache, cached
from dotenv import load_dotenv

load_dotenv()

# Initialize Spotify Client Credentials Flow (No user auth required)
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

# CACHING: Store up to 200 API responses for 10 minutes (600 seconds)
# Greatly reduces API calls for similar emotional inputs
cache = TTLCache(maxsize=200, ttl=600)

@cached(cache)
def get_spotify_recommendations(valence: float, energy: float, genres: tuple) -> list:
    """
    Queries Spotify's recommendation endpoint.
    genres must be a tuple to be hashable for the cachetools decorator.
    """
    try:
        results = sp.recommendations(
            seed_genres=list(genres),
            target_valence=valence,
            target_energy=energy,
            limit=4 # Return 4 tracks as requested (3-5)
        )
        
        return [
            {
                "id": track["id"],
                "name": track["name"],
                "artist": track["artists"][0]["name"],
                "uri": track["uri"]
            }
            for track in results.get("tracks", [])
        ]
        
    except Exception as e:
        print(f"Spotify API Error: {e}")
        # FALLBACK LOGIC: API Failure
        # Return a safe, hardcoded list of ambient/lofi tracks if Spotify drops the connection
        return [
            {
                "id": "2OznO10m4D5O0IibIq1j6I", 
                "name": "Weightless", 
                "artist": "Marconi Union",
                "uri": "spotify:track:2OznO10m4D5O0IibIq1j6I"
            }
        ]