import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import './App.css';

// VERSION CONTROL: Change this string if you ever modify the sessionData structure
const STORAGE_VERSION = 'expressify_v2';

const quotesDatabase = {
  "Happy & Energetic": [
    { text: "Happiness is a choice, not a condition.", author: "Nora Roberts" },
    { text: "It does not do to dwell on dreams and forget to live.", author: "J.K. Rowling" }
  ],
  "Happy & Calm": [
    { text: "I have nothing to do today but smile.", author: "Paul Simon" },
    { text: "You can find magic wherever you look. Sit back and relax, all you need is a book.", author: "Dr. Seuss" }
  ],
  "Sad & Melancholy": [
    { text: "The emotion that can break your heart is sometimes the very one that heals it.", author: "Nicholas Sparks" },
    { text: "Some things are just meant to be, and some things are not.", author: "Nora Roberts" }
  ],
  "Angry & Energetic": [
    { text: "Anger is like a storm rising up from the bottom of your consciousness.", author: "Thich Nhat Hanh" },
    { text: "We've all got both light and dark inside us. What matters is the part we choose to act on.", author: "J.K. Rowling" }
  ],
  "Neutral & Focused": [
    { text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", author: "J.K. Rowling" },
    { text: "There’s no such thing as a free lunch, but there is always a good book.", author: "Nora Roberts" }
  ]
};

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [activePlayer, setActivePlayer] = useState('youtube');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_VERSION)) || [];
      setHistory(saved);
    } catch (e) {
      localStorage.removeItem(STORAGE_VERSION);
      setHistory([]);
    }
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const cleanText = diaryEntry.trim();
    if (!cleanText || cleanText.length > 1000) return;

    setLoading(true);
    setFeedbackGiven(false);

    try {
      // 1. Call the Python BFF API
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });

      if (!response.ok) throw new Error("API Failed");
      const data = await response.json();

      // 2. Select a random quote based on the backend's detected mood
      const moodQuotes = quotesDatabase[data.affective_data.mood] || quotesDatabase["Neutral & Focused"];
      const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];

      // 3. Format the response
      const newSession = {
        session_id: "sess_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        original_text: cleanText,
        quote: randomQuote,
        ...data
      };

      // 4. Log to Firebase and capture Document ID for later feedback
      try {
        const docRef = await addDoc(collection(db, "sessions"), newSession);
        newSession.firebase_id = docRef.id;
      } catch (fbError) {
        console.warn("Firebase logging skipped:", fbError);
      }

      // 5. Update UI States
      setSessionData(newSession);
      setActivePlayer('youtube');

      const newHistory = [newSession, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem(STORAGE_VERSION, JSON.stringify(newHistory));

    } catch (error) {
      console.error("System Error:", error);
      alert("Unable to reach the Expressify Engine. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isAccurate) => {
    if (!sessionData?.firebase_id || feedbackGiven) return;
    try {
      await updateDoc(doc(db, "sessions", sessionData.firebase_id), {
        user_feedback: isAccurate ? "accurate" : "inaccurate"
      });
      setFeedbackGiven(true);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    }
  };

  const blob1Color = sessionData ? sessionData.affective_data.colors[0] : '#8A2BE2';
  const blob2Color = sessionData ? sessionData.affective_data.colors[1] : '#4169E1';

  return (
    <div id="root">
      {/* BACKGROUND LAYER 1: Aurora Blobs */}
      <div className="blob blob-1" style={{ background: blob1Color }}></div>
      <div className="blob blob-2" style={{ background: blob2Color }}></div>
      <div className="blob blob-3" style={{ background: blob1Color }}></div>

      {/* BACKGROUND LAYER 2: Floating Music Notes */}
      <div className="music-wave-container">
        <div className="music-note note-1">♪</div>
        <div className="music-note note-2">♫</div>
        <div className="music-note note-3">♩</div>
        <div className="music-note note-4">♬</div>
        <div className="music-note note-5">♪</div>
        <div className="music-note note-6">♫</div>
        <div className="music-note note-7">♭</div>
      </div>

      {/* FOREGROUND: Main Application Content */}
      <main id="center" className={focusMode ? "focus-active" : ""}>
        {!focusMode && (
          <div className="hero fade-in">
            <h1 className="framework">Expressify</h1>
            <p className="description">Powered by VADER Sentiment Analysis</p>
          </div>
        )}

        <div className="app-content">
          {!sessionData ? (
            <form onSubmit={handleAnalyze} className="diary-form glass-card fade-in">
              <label htmlFor="diary" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                <strong>How are you feeling today?</strong>
              </label>

              <textarea
                id="diary"
                rows="4"
                maxLength="1000"
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Share your thoughts... (Max 1000 characters)"
                className="diary-input"
                disabled={loading}
              />

              <div style={{ width: '100%', textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '-10px' }}>
                {diaryEntry.length}/1000
              </div>

              <button type="submit" className="counter action-btn" disabled={loading || !diaryEntry.trim()}>
                {loading ? 'Curating Atmosphere...' : 'Generate Soundtrack'}
              </button>
            </form>
          ) : (
            <div className="result-container fade-in">
              <div className="focus-toggle-container">
                <button onClick={() => setFocusMode(!focusMode)} className="focus-btn">
                  {focusMode ? "⤢ Exit Focus Mode" : "⤡ Enter Focus Mode"}
                </button>
              </div>

              <div className="result-card glass-card">
                <div className="mood-badge" style={{ backgroundColor: blob1Color }}>
                  {sessionData.affective_data.mood}
                </div>

                {/* Literary Quote Widget */}
                <div className="quote-container">
                  <p className="quote-text">"{sessionData.quote?.text || "Creating harmony..."}"</p>
                  <p className="quote-author">— {sessionData.quote?.author || "Expressify"}</p>
                </div>

                {!focusMode && (
                  <div className="analytics-container fade-in" style={{ marginTop: '20px' }}>
                    <div className="bar-row">
                      <span>Valence (Positivity)</span>
                      <span>{sessionData.affective_data.valence}%</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${sessionData.affective_data.valence}%`, background: blob1Color }}></div>
                    </div>
                    <div className="bar-row" style={{ marginTop: '10px' }}>
                      <span>Energy Level</span>
                      <span>{sessionData.affective_data.energy}%</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${sessionData.affective_data.energy}%`, background: blob2Color }}></div>
                    </div>
                  </div>
                )}

                <div className="track-info" style={{ marginTop: '25px' }}>
                  <div className="platform-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '15px', justifyContent: 'center' }}>
                    <button
                      className={`toggle-btn ${activePlayer === 'spotify' ? 'active-spotify' : ''}`}
                      onClick={() => setActivePlayer('spotify')}
                    >
                      Spotify Tracks
                    </button>
                    <button
                      className={`toggle-btn ${activePlayer === 'youtube' ? 'active-youtube' : ''}`}
                      onClick={() => setActivePlayer('youtube')}
                    >
                      YouTube Mix
                    </button>
                  </div>

                  {activePlayer === 'spotify' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {sessionData.recommendation_data.spotify_tracks.map((track) => (
                        <iframe
                          key={track.id}
                          src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen=""
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="media-embed fade-in"
                        ></iframe>
                      ))}
                    </div>
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/videoseries?list=${sessionData.recommendation_data.youtube_playlist_id}`}
                      width="100%"
                      height={focusMode ? "500" : "352"}
                      frameBorder="0"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="media-embed fade-in"
                    ></iframe>
                  )}
                </div>

                {/* Feedback Loop Feature */}
                {!focusMode && sessionData.firebase_id && (
                  <div style={{ marginTop: '25px', textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#b3b3b3', margin: '0 0 10px 0' }}>Did we get your vibe right?</p>
                    {feedbackGiven ? (
                      <span style={{ color: '#1db954', fontSize: '0.9rem', fontWeight: 'bold' }}>✓ Thank you for improving the algorithm!</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => handleFeedback(true)} style={{ background: 'transparent', border: '1px solid #1db954', color: '#1db954', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease' }}>👍 Yes</button>
                        <button onClick={() => handleFeedback(false)} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease' }}>👎 No</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!focusMode && (
                <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="counter reset-btn fade-in" style={{ marginTop: '25px' }}>
                  Analyze New Thought
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;