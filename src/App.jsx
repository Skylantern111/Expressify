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

  useEffect(() => {
    // BUG FIX: Try-catch prevents crashes if localStorage data is malformed
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
      id: "37i9dQZF1EVJSvZp5AOML2", name: "Happy Hits", color1: "#FFD700", color2: "#FF8C00", val: 85, eng: 80,
      singles: [{ title: "Levitating", artist: "Dua Lipa" }, { title: "Walking On Sunshine", artist: "Katrina & The Waves" }, { title: "Good Days", artist: "SZA" }]
    },
    "Happy & Calm": {
      id: "37i9dQZF1DWSf2RDTDayIx", name: "Happy Chill", color1: "#87CEFA", color2: "#98FB98", val: 75, eng: 30,
      singles: [{ title: "Put Your Records On", artist: "Corinne Bailey Rae" }, { title: "Banana Pancakes", artist: "Jack Johnson" }, { title: "Sunday Morning", artist: "Maroon 5" }]
    },
    "Sad & Melancholy": {
      id: "37i9dQZF1DWVV27DiNWxkR", name: "Melancholia", color1: "#4682B4", color2: "#191970", val: 20, eng: 25,
      singles: [{ title: "Sparks", artist: "Coldplay" }, { title: "Liability", artist: "Lorde" }, { title: "The Night We Met", artist: "Lord Huron" }]
    },
    "Angry & Energetic": {
      id: "37i9dQZF1DX1tyCD9QhIWF", name: "Rage Beats", color1: "#DC143C", color2: "#8B0000", val: 15, eng: 90,
      singles: [{ title: "Misery Business", artist: "Paramore" }, { title: "Break Stuff", artist: "Limp Bizkit" }, { title: "good 4 u", artist: "Olivia Rodrigo" }]
    },
    "Neutral & Focused": {
      id: "37i9dQZF1DWZeKCadgRdKQ", name: "Deep Focus", color1: "#9370DB", color2: "#4B0082", val: 50, eng: 50,
      singles: [{ title: "Clair de Lune", artist: "Claude Debussy" }, { title: "Weightless", artist: "Marconi Union" }, { title: "Cornfield Chase", artist: "Hans Zimmer" }]
    }
  };

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
    if (!diaryEntry) return;

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

      await addDoc(collection(db, "sessions"), finalSessionData);

      setSessionData(finalSessionData);
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
      <div className="blob blob-1" style={{ background: blob1Color }}></div>
      <div className="blob blob-2" style={{ background: blob2Color }}></div>
      <div className="blob blob-3" style={{ background: blob1Color }}></div>

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
              <label htmlFor="diary"><strong>How are you feeling today?</strong></label>
              <textarea
                id="diary"
                rows="4"
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Share your thoughts..."
                className="diary-input"
              />
              <button type="submit" className="counter action-btn" disabled={loading}>
                {loading ? 'Curating Atmosphere...' : 'Generate Soundtrack'}
              </button>
            </form>
          ) : (
            <div className="result-container fade-in">
              {/* Focus Mode Toggle */}
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
                  {/* BUG FIX: Safely rendering quotes using optional chaining */}
                  <p className="quote-text">&quot;{sessionData.recommendation_data.quote?.text || "Creating harmony..."}&quot;</p>
                  <p className="quote-author">— {sessionData.recommendation_data.quote?.author || "Expressify"}</p>
                </div>

                {!focusMode && (
                  <div className="analytics-container fade-in">
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

                <div className="track-info">
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator&theme=0`}
                    width="100%"
                    height={focusMode ? "500" : "352"}
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="spotify-embed"
                  ></iframe>
                </div>
              </div>

              {!focusMode && (
                <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="counter reset-btn fade-in">
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