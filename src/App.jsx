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

  // Check for the PKCE code on load and fetch the token
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
    highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good'],
    lowValence: ['sad', 'depressed', 'angry', 'grey', 'fade', 'rain', 'melancholy', 'tension'],
    highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervousness', 'rage'],
    lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'tired']
  };

  const analyzeTextEmotion = (text) => {
    const normalizedText = text.toLowerCase().replace(/[.,!?;]/g, '');
    const tokens = normalizedText.split(/\s+/);

    let valenceScore = null;
    let energyScore = null;
    let detectedMood = "Ambiguous";
    let seedGenre = "pop,indie";

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

    if (valenceScore === null || energyScore === null || (hasHighValence && hasLowValence)) {
      valenceScore = valenceScore || 0.5;
      energyScore = energyScore || 0.5;
      detectedMood = "Neutral / Mixed (Fallback)";
      seedGenre = "ambient,acoustic";
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
      alert("Something went wrong. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Expressify: Heuristic Engine 🎧</h1>

      {!spotifyToken ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>You must authenticate with Spotify to begin.</p>
          {/* Button changed to trigger the PKCE redirect function */}
          <button onClick={redirectToSpotifyAuth} style={{ padding: '1rem 2rem', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            Login to Spotify
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <label htmlFor="diary"><strong>How are you feeling?</strong></label>
            <textarea
              id="diary"
              rows="4"
              value={diaryEntry}
              onChange={(e) => setDiaryEntry(e.target.value)}
              placeholder="e.g., The rain hasn't stopped for days. I feel a quiet hope, but mostly I just want to fade into the grey background."
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '1rem', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Analyzing & Fetching...' : 'Generate Playlist & Save to DB'}
            </button>
          </form>

          {sessionData && !loading && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f4f4f4', borderRadius: '8px', borderLeft: '5px solid #1DB954' }}>
              <h3>System Output (Saved to Firebase):</h3>
              <p><strong>Detected Mood:</strong> {sessionData.affective_computing_data.detected_mood}</p>
              <p><strong>Target Valence:</strong> {sessionData.recommendation_data.target_audio_features.target_valence}</p>
              <p><strong>Target Energy:</strong> {sessionData.recommendation_data.target_audio_features.target_energy}</p>
              <hr style={{ margin: '1rem 0' }} />
              <h4>Recommended Track:</h4>
              <p>🎵 {sessionData.recommendation_data.track_name} by {sessionData.recommendation_data.artist_name}</p>
              <a href={sessionData.recommendation_data.external_url} target="_blank" rel="noreferrer" style={{ color: '#1DB954', fontWeight: 'bold' }}>
                Listen on Spotify
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;