import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Fetch recommendations from FastAPI backend
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setResult(data);

      // 2. Fire-and-forget logging to Firebase Firestore
      try {
        await addDoc(collection(db, "sessions"), {
          user_input: text,
          detected_features: data.features,
          recommended_tracks: data.tracks,
          timestamp: serverTimestamp()
        });
      } catch (fbError) {
        console.error("Firebase logging failed (non-critical):", fbError);
      }

    } catch (err) {
      console.error(err);
      setError("Unable to generate your soundtrack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Expressify</h1>
      <p>Tell us how you feel, and we'll curate the perfect tracks.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          rows="4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I'm feeling really energetic and excited about today!"
          style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '1rem', background: '#1db954', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Analyzing Vibe...' : 'Generate Soundtrack'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Your Curated Tracks</h3>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
            Logic: Valence {result.features.valence} | Energy {result.features.energy}
          </div>

          {/* Display Spotify Iframes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.tracks.map((track) => (
              <iframe
                key={track.id}
                src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator`}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px' }}
              ></iframe>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;