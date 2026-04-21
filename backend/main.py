from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nlp_service import analyze_emotion
from spotify_service import get_spotify_recommendations

app = FastAPI(title="Expressify API")

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodRequest(BaseModel):
    text: str

@app.post("/api/recommend")
async def recommend_music(req: MoodRequest):
    # 1. Analyze Sentiment
    features = analyze_emotion(req.text)
    
    # 2. Convert genres to a tuple for cache hashing, then query Spotify
    tracks = get_spotify_recommendations(
        valence=features["valence"],
        energy=features["energy"],
        genres=tuple(features["genres"])
    )
    
    return {
        "status": "success",
        "features": features,
        "tracks": tracks
    }