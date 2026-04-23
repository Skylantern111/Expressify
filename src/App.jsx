import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [activePlayer, setActivePlayer] = useState('youtube');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vibe_history')) || [];
      setHistory(saved);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  const emotionDictionary = {
    highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good', 'excited', 'wonderful', 'blessed'],
    lowValence: ['sad', 'depressed', 'angry', 'grey', 'fade', 'rain', 'melancholy', 'tension', 'lonely', 'tired'],
    highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervousness', 'rage', 'energetic', 'power'],
    lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'tired', 'peaceful', 'quiet']
  };

  const vibeProfiles = {
    "Happy & Energetic": {
      id: "37i9dQZF1EVJSvZp5AOML2",
      name: "Happy Hits", color1: "#FFD700", color2: "#FF8C00", val: 85, eng: 80,
      singles: [
        { title: "Levitating", artist: "Dua Lipa" },
        { title: "Walking On Sunshine", artist: "Katrina & The Waves" },
        { title: "Good Days", artist: "SZA" },
        { title: "As It Was", artist: "Harry Styles" },
        { title: "Blinding Lights", artist: "The Weeknd" }
      ]
    },
    "Happy & Calm": {
      id: "37i9dQZF1DWSf2RDTDayIx",
      name: "Happy Chill", color1: "#87CEFA", color2: "#98FB98", val: 75, eng: 30,
      singles: [
        { title: "Put Your Records On", artist: "Corinne Bailey Rae" },
        { title: "Banana Pancakes", artist: "Jack Johnson" },
        { title: "Sunday Morning", artist: "Maroon 5" },
        { title: "Here Comes The Sun", artist: "The Beatles" },
        { title: "Bubbly", artist: "Colbie Caillat" }
      ]
    },
    "Sad & Melancholy": {
      id: "37i9dQZF1DWVV27DiNWxkR",
      name: "Melancholia", color1: "#4682B4", color2: "#191970", val: 20, eng: 25,
      singles: [
        { title: "Sparks", artist: "Coldplay" },
        { title: "Liability", artist: "Lorde" },
        { title: "The Night We Met", artist: "Lord Huron" },
        { title: "Skinny Love", artist: "Bon Iver" },
        { title: "Someone Like You", artist: "Adele" }
      ]
    },
    "Angry & Energetic": {
      id: "37i9dQZF1DX1tyCD9QhIWF",
      name: "Rage Beats", color1: "#DC143C", color2: "#8B0000", val: 15, eng: 90,
      singles: [
        { title: "Misery Business", artist: "Paramore" },
        { title: "Break Stuff", artist: "Limp Bizkit" },
        { title: "good 4 u", artist: "Olivia Rodrigo" },
        { title: "Killing In The Name", artist: "Rage Against The Machine" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana" }
      ]
    },
    "Neutral & Focused": {
      id: "37i9dQZF1DWZeKCadgRdKQ",
      name: "Deep Focus", color1: "#9370DB", color2: "#4B0082", val: 50, eng: 50,
      singles: [
        { title: "Clair de Lune", artist: "Claude Debussy" },
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Cornfield Chase", artist: "Hans Zimmer" },
        { title: "Experience", artist: "Ludovico Einaudi" },
        { title: "Gymnopédie No.1", artist: "Erik Satie" }
      ]
    }
  };

  const quotesDatabase = {
    "Happy & Energetic": [
      { text: "Happiness is a choice, not a condition.", author: "Nora Roberts" }
    ],
    "Happy & Calm": [
      { text: "I have nothing to do today but smile.", author: "Paul Simon" }
    ],
    "Sad & Melancholy": [
      { text: "The emotion that can break your heart is sometimes the very one that heals it.", author: "Nicholas Sparks" }
    ],
    "Angry & Energetic": [
      { text: "Anger is like a storm rising up from the bottom of your consciousness.", author: "Thich Nhat Hanh" }
    ],
    "Neutral & Focused": [
      { text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", author: "J.K. Rowling" }
    ]
  };

  const analyzeTextEmotion = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    let isHappy = false, isSad = false, isHighEnergy = false, isLowEnergy = false;

    if (tokens.some(t => emotionDictionary.highValence.includes(t))) isHappy = true;
    if (tokens.some(t => emotionDictionary.lowValence.includes(t))) isSad = true;
    if (tokens.some(t => emotionDictionary.highEnergy.includes(t))) isHighEnergy = true;
    if (tokens.some(t => emotionDictionary.lowEnergy.includes(t))) isLowEnergy = true;

    if (isHappy && !isLowEnergy) return { mood: "Happy & Energetic", profile: vibeProfiles["Happy & Energetic"] };
    if (isHappy && isLowEnergy) return { mood: "Happy & Calm", profile: vibeProfiles["Happy & Calm"] };
    if (isSad && !isHighEnergy) return { mood: "Sad & Melancholy", profile: vibeProfiles["Sad & Melancholy"] };
    if (isSad && isHighEnergy) return { mood: "Angry & Energetic", profile: vibeProfiles["Angry & Energetic"] };

    return { mood: "Neutral & Focused", profile: vibeProfiles["Neutral & Focused"] };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!diaryEntry || diaryEntry.trim().length === 0) return;

    setLoading(true);
    try {
      const result = analyzeTextEmotion(diaryEntry);
      const moodQuotes = quotesDatabase[result.mood];
      const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];

      const finalSessionData = {
        session_id: "sess_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        affective_computing_data: {
          detected_mood: result.mood,
          valence: result.profile.val,
          energy: result.profile.eng,
          colors: { c1: result.profile.color1, c2: result.profile.color2 }
        },
        recommendation_data: {
          playlist_id: result.profile.id,
          playlist_name: result.profile.name,
          singles: result.profile.singles,
          quote: randomQuote
        }
      };

      try {
        await addDoc(collection(db, "sessions"), finalSessionData);
      } catch (fbError) {
        console.warn("Firebase logging skipped:", fbError);
      }

      setSessionData(finalSessionData);
      setActivePlayer('youtube'); // Default to YouTube single track list
      const newHistory = [finalSessionData, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('vibe_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error executing system:", error);
    } finally {
      setLoading(false);
    }
  };

  const blob1Color = sessionData ? sessionData.affective_computing_data.colors.c1 : '#8A2BE2';
  const blob2Color = sessionData ? sessionData.affective_computing_data.colors.c2 : '#4169E1';

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
            <p className="description">The Emotional Soundtrack Generator</p>
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
                placeholder="Share your thoughts..."
                className="diary-input"
              />
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
                  {sessionData.affective_computing_data.detected_mood}
                </div>

                <div className="quote-container">
                  <p className="quote-text">"{sessionData.recommendation_data.quote?.text || "Creating harmony..."}"</p>
                  <p className="quote-author">— {sessionData.recommendation_data.quote?.author || "Expressify"}</p>
                </div>

                {!focusMode && (
                  <div className="analytics-container fade-in" style={{ marginTop: '20px' }}>
                    <div className="bar-row">
                      <span>Valence (Positivity)</span>
                      <span>{sessionData.affective_computing_data.valence}%</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${sessionData.affective_computing_data.valence}%`, background: blob1Color }}></div>
                    </div>
                    <div className="bar-row" style={{ marginTop: '10px' }}>
                      <span>Energy Level</span>
                      <span>{sessionData.affective_computing_data.energy}%</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${sessionData.affective_computing_data.energy}%`, background: blob2Color }}></div>
                    </div>
                  </div>
                )}

                <div className="track-info" style={{ marginTop: '25px' }}>
                  <div className="platform-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '15px', justifyContent: 'center' }}>
                    <button
                      className={`toggle-btn ${activePlayer === 'spotify' ? 'active-spotify' : ''}`}
                      onClick={() => setActivePlayer('spotify')}
                    >
                      Spotify
                    </button>
                    <button
                      className={`toggle-btn ${activePlayer === 'youtube' ? 'active-youtube' : ''}`}
                      onClick={() => setActivePlayer('youtube')}
                    >
                      YouTube
                    </button>
                  </div>

                  {activePlayer === 'spotify' ? (
                    <iframe
                      key={sessionData.recommendation_data.playlist_id}
                      src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator&theme=0`}
                      width="100%"
                      height={focusMode ? "500" : "352"}
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="media-embed fade-in"
                      style={{ borderRadius: '12px' }}
                    ></iframe>
                  ) : (
                    <div className="singles-container fade-in" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', minHeight: focusMode ? "500px" : "352px" }}>
                      <h4 style={{ color: '#b3b3b3', margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '1.1rem' }}>
                        Recommended Tracks for this Vibe
                      </h4>

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: focusMode ? '430px' : '280px', overflowY: 'auto' }} className="custom-scrollbar">
                        {sessionData.recommendation_data.singles.map((track, idx) => {
                          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;

                          return (
                            <li key={idx} style={{ padding: '12px 0', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: blob1Color, marginRight: '15px', fontSize: '1.5rem' }}>▸</span>
                              <div style={{ flexGrow: 1 }}>
                                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{track.title}</strong>
                                <div style={{ color: '#b3b3b3', fontSize: '0.9rem', marginTop: '4px' }}>by {track.artist}</div>
                              </div>
                              <a href={searchUrl} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '0.85rem', color: '#fff', background: '#ff0000', padding: '6px 14px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
                                Search YouTube
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {!focusMode && (
                <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="counter reset-btn fade-in" style={{ marginTop: '20px' }}>
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