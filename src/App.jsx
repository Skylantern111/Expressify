import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { redirectToSpotifyAuth, getTokenFromUrl, fetchSpotifyRecommendations } from './spotify';
import './App.css';

function App() {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getTokenFromUrl();
      if (token) {
        setSpotifyToken(token);
      }
    };
    fetchToken();
  }, []);

  const emotionDictionary = {
    highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good', 'excited', 'wonderful', 'blessed'],
    lowValence: ['sad', 'depressed', 'angry', 'grey', 'fade', 'rain', 'melancholy', 'tension', 'lonely', 'tired'],
    highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervousness', 'rage', 'energetic', 'power'],
    lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'tired', 'peaceful', 'quiet']
  };

  const analyzeTextEmotion = (text) => {
    const normalizedText = text.toLowerCase().replace(/[.,!?;]/g, '');
    const tokens = normalizedText.split(/\s+/);
    let valenceScore = 0.5;
    let energyScore = 0.5;
    let detectedMood = "Neutral / Mixed";
    let seedGenre = "ambient,acoustic";

    const hasHighValence = tokens.some(word => emotionDictionary.highValence.includes(word));
    const hasLowValence = tokens.some(word => emotionDictionary.lowValence.includes(word));
    const hasHighEnergy = tokens.some(word => emotionDictionary.highEnergy.includes(word));
    const hasLowEnergy = tokens.some(word => emotionDictionary.lowEnergy.includes(word));

    if (hasHighValence && !hasLowValence) {
      valenceScore = 0.85; detectedMood = "Happy/Optimistic"; seedGenre = "pop,dance";
    } else if (hasLowValence && !hasHighValence) {
      valenceScore = 0.2; detectedMood = "Melancholic/Sad"; seedGenre = "chill,sad";
    }

    if (hasHighEnergy && !hasLowEnergy) {
      energyScore = 0.8;
    } else if (hasLowEnergy && !hasHighEnergy) {
      energyScore = 0.3;
    }

    return { valence: valenceScore, energy: energyScore, mood: detectedMood, genre: seedGenre };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!diaryEntry || !spotifyToken) return;

    setLoading(true);
    try {
      const emotionData = analyzeTextEmotion(diaryEntry);
      const track = await fetchSpotifyRecommendations(spotifyToken, emotionData.valence, emotionData.energy, emotionData.genre);

      const finalSessionData = {
        session_id: "sess_" + Date.now(),
        timestamp: new Date().toISOString(),
        affective_computing_data: {
          input_modality: "textual",
          detected_mood: emotionData.mood,
          raw_text: diaryEntry
        },
        recommendation_data: {
          target_audio_features: {
            target_valence: emotionData.valence,
            target_energy: emotionData.energy
          },
          spotify_track_uri: track.uri,
          track_name: track.name,
          artist_name: track.artists[0].name,
          external_url: track.external_urls.spotify
        }
      };

      await addDoc(collection(db, "sessions"), finalSessionData);
      setSessionData(finalSessionData);
    } catch (error) {
      console.error("Error executing system:", error);
      alert("System Error: Check Spotify Connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSessionData(null);
    setDiaryEntry('');
  };

  return (
    <div id="root">
      {/* Background blobs for depth */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      {/* Landscape Flowing Music Notes Wave */}
      <div className="music-wave-container">
        <div className="music-note note-1">&#9835;</div>
        <div className="music-note note-2">&#9834;</div>
        <div className="music-note note-3">&#9833;</div>
        <div className="music-note note-4">&#9836;</div>
        <div className="music-note note-5">&#9835;</div>
        <div className="music-note note-6">&#9834;</div>
        <div className="music-note note-7">&#9839;</div>
      </div>
      
      <main id="center">
        <div className="hero">
          <h1 className="framework">Expressify</h1>
          <h2 className="vite">Heuristic Engine</h2>
          <p className="description">LyricalLoFi: The Emotional Soundtrack Generator</p>
        </div>

        {!spotifyToken ? (
          <div className="auth-section">
            <p className="description">Authenticate with Spotify to begin the analysis.</p>
            <button className="counter" onClick={redirectToSpotifyAuth}>
              Login to Spotify
            </button>
          </div>
        ) : (
          <div className="app-content">
            {!sessionData ? (
              <form onSubmit={handleAnalyze} className="diary-form">
                <label htmlFor="diary"><strong>How are you feeling today?</strong></label>
                <textarea
                  id="diary"
                  rows="4"
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="diary-input"
                />
                <button type="submit" className="counter" disabled={loading}>
                  {loading ? 'Analyzing Vibe...' : 'Generate Soundtrack'}
                </button>
              </form>
            ) : (
              <div className="result-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="result-card">
                  <div className="mood-badge">{sessionData.affective_computing_data.detected_mood}</div>
                  <h3>Your Emotional Soundtrack</h3>
                  <div className="track-info">
                    <p style={{ fontSize: '1.2rem' }}>🎵 <strong>{sessionData.recommendation_data.track_name}</strong></p>
                    <p style={{ color: '#b3b3b3' }}>{sessionData.recommendation_data.artist_name}</p>
                    <div style={{ marginTop: '20px' }}>
                      <a href={sessionData.recommendation_data.external_url} target="_blank" rel="noreferrer" className="spotify-link">
                        Listen on Spotify
                      </a>
                    </div>
                  </div>
                </div>
                <button onClick={handleReset} className="counter reset-btn">
                  Analyze New Thought
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;