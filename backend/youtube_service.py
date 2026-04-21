import os
from googleapiclient.discovery import build
from cachetools import TTLCache, cached
from dotenv import load_dotenv

load_dotenv()

# Initialize the YouTube API client
youtube = build('youtube', 'v3', developerKey=os.getenv("AIzaSyCuegJkVJbDcImQZKIr3GYlv8hzQKU9TrI"))

# Cache results to save your 10,000 daily quota!
cache = TTLCache(maxsize=100, ttl=3600)

@cached(cache)
def get_youtube_recommendations(mood_keyword: str) -> str:
    """
    Searches YouTube for a playlist matching the detected mood.
    Returns the Playlist ID.
    """
    try:
        # Search for playlists that match the specific vibe
        request = youtube.search().list(
            part="snippet",
            maxResults=1,
            q=f"{mood_keyword} music mix",
            type="playlist" # We only want playlists, not single videos
        )
        response = request.execute()

        if response['items']:
            # Return the dynamically found YouTube Playlist ID
            return response['items'][0]['id']['playlistId']
        
        return "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo" # Fallback to Lofi Girl

    except Exception as e:
        print(f"YouTube API Error: {e}")
        return "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo" # Fallback on error