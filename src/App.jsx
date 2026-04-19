import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vibe_history')) || [];
    setHistory(saved);
  }, []);

  const emotionDictionary = {
    highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good', 'excited', 'wonderful', 'blessed'],
    lowValence: ['sad', 'depressed', 'angry', 'grey', 'fade', 'rain', 'melancholy', 'tension', 'lonely', 'tired'],
    highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervousness', 'rage', 'energetic', 'power'],
    lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'tired', 'peaceful', 'quiet']
  };

  // Expanded Data: Added Single Tracks to each profile
  const vibeProfiles = {
    "Happy & Energetic": {
      id: "37i9dQZF1EVJSvZp5AOML2", name: "Happy Hits", color1: "#FFD700", color2: "#FF8C00", val: 85, eng: 80,
      singles: [
        { title: "Levitating", artist: "Dua Lipa" },
        { title: "Walking On Sunshine", artist: "Katrina & The Waves" },
        { title: "Good Days", artist: "SZA" }
      ]
    },
    "Happy & Calm": {
      id: "37i9dQZF1DWSf2RDTDayIx", name: "Happy Chill", color1: "#87CEFA", color2: "#98FB98", val: 75, eng: 30,
      singles: [
        { title: "Put Your Records On", artist: "Corinne Bailey Rae" },
        { title: "Banana Pancakes", artist: "Jack Johnson" },
        { title: "Sunday Morning", artist: "Maroon 5" }
      ]
    },
    "Sad & Melancholy": {
      id: "37i9dQZF1DWVV27DiNWxkR", name: "Melancholia", color1: "#4682B4", color2: "#191970", val: 20, eng: 25,
      singles: [
        { title: "Sparks", artist: "Coldplay" },
        { title: "Liability", artist: "Lorde" },
        { title: "The Night We Met", artist: "Lord Huron" }
      ]
    },
    "Angry & Energetic": {
      id: "37i9dQZF1DX1tyCD9QhIWF", name: "Rage Beats", color1: "#DC143C", color2: "#8B0000", val: 15, eng: 90,
      singles: [
        { title: "Misery Business", artist: "Paramore" },
        { title: "Break Stuff", artist: "Limp Bizkit" },
        { title: "good 4 u", artist: "Olivia Rodrigo" }
      ]
    },
    "Neutral & Focused": {
      id: "37i9dQZF1DWZeKCadgRdKQ", name: "Deep Focus", color1: "#9370DB", color2: "#4B0082", val: 50, eng: 50,
      singles: [
        { title: "Clair de Lune", artist: "Claude Debussy" },
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Cornfield Chase", artist: "Hans Zimmer" }
      ]
    }
  };

  // NEW FEATURE: Literary Database
  const quotesDatabase = {
    "Happy & Energetic": [
      { text: "Happiness is a choice, not a condition.", author: "Nora Roberts" },
      { text: "It does not do to dwell on dreams and forget to live.", author: "J.K. Rowling" },
      { text: "The world is indeed full of peril, and in it there are many dark places; but still there is much that is fair.", author: "J.R.R. Tolkien" }
    ],
    "Happy & Calm": [
      { text: "I have nothing to do today but smile.", author: "Paul Simon" },
      { text: "You can find magic wherever you look. Sit back and relax, all you need is a book.", author: "Dr. Seuss" },
      { text: "There is a kind of magicness about going far away and then coming back all changed.", author: "Kate Douglas Wiggin" }
    ],
    "Sad & Melancholy": [
      { text: "The emotion that can break your heart is sometimes the very one that heals it.", author: "Nicholas Sparks" },
      { text: "Numbing the pain for a while will make it worse when you finally feel it.", author: "J.K. Rowling" },
      { text: "Some things are just meant to be, and some things are not.", author: "Nora Roberts" }
    ],
    "Angry & Energetic": [
      { text: "Anger is like a storm rising up from the bottom of your consciousness.", author: "Thich Nhat Hanh" },
      { text: "I will not be triumphed over.", author: "Cleopatra" },
      { text: "We've all got both light and dark inside us. What matters is the part we choose to act on.", author: "J.K. Rowling" }
    ],
    "Neutral & Focused": [
      { text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", author: "J.K. Rowling" },
      { text: "To learn to read is to light a fire; every syllable that is spelled out is a spark.", author: "Victor Hugo" },
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

      // Select a random quote from the matching mood category
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
      alert("System Error: Check Firebase Connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSessionData(null);
    setDiaryEntry('');
  };

  const blob1Color = sessionData ? sessionData.affective_computing_data.colors.c1 : '#8A2BE2';
  const blob2Color = sessionData ? sessionData.affective_computing_data.colors.c2 : '#4169E1';

  return (
    <div id="root">
      <div className="blob blob-1" style={{ background: blob1Color, transition: 'background 1.5s ease' }}></div>
      <div className="blob blob-2" style={{ background: blob2Color, transition: 'background 1.5s ease' }}></div>

      <div className="music-wave-container">
        <div className="music-note note-1">♫</div>
        <div className="music-note note-2">♪</div>
        <div className="music-note note-3">♩</div>
        <div className="music-note note-4">♬</div>
      </div>

      <main id="center" style={{ overflowY: 'auto', maxHeight: '100vh', paddingBottom: '80px' }}>
        <div className="hero">
          <h1 className="framework">Expressify</h1>
          <p className="description">The Emotional Soundtrack Generator</p>
        </div>

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
            <div className="result-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div className="result-card" style={{ width: '100%', maxWidth: '650px', padding: '30px' }}>
                <div className="mood-badge" style={{ backgroundColor: blob1Color }}>
                  {sessionData.affective_computing_data.detected_mood}
                </div>

                {/* NEW FEATURE: Literary Resonance (Quotes) */}
                <div className="quote-container">
                  <p className="quote-text">&quot;{sessionData.recommendation_data.quote?.text || "Finding the perfect words..."}&quot;</p>
                  <p className="quote-author">— {sessionData.recommendation_data.quote?.author || "System"}</p>
                </div>

                <div className="analytics-container" style={{ margin: '20px 0', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Valence (Positivity)</span>
                      <span>{sessionData.affective_computing_data.valence}%</span>
                    </div>
                    <div style={{ width: '100%', background: '#333', borderRadius: '4px', height: '6px' }}>
                      <div style={{ width: `${sessionData.affective_computing_data.valence}%`, background: blob1Color, height: '100%', borderRadius: '4px', transition: 'width 1s' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Energy Level</span>
                      <span>{sessionData.affective_computing_data.energy}%</span>
                    </div>
                    <div style={{ width: '100%', background: '#333', borderRadius: '4px', height: '6px' }}>
                      <div style={{ width: `${sessionData.affective_computing_data.energy}%`, background: blob2Color, height: '100%', borderRadius: '4px', transition: 'width 1s' }}></div>
                    </div>
                  </div>
                </div>

                {/* NEW FEATURE: Single Tracks Suggestion */}
                <div className="singles-container" style={{ textAlign: 'left', marginBottom: '25px' }}>
                  <h4 style={{ color: '#b3b3b3', margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Standout Tracks for this Vibe</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {sessionData.recommendation_data.singles.map((track, idx) => (
                      <li key={idx} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: blob1Color, marginRight: '10px', fontSize: '1.2rem' }}>▸</span>
                        <strong>{track.title}</strong> <span style={{ color: '#b3b3b3', marginLeft: '8px' }}>by {track.artist}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="track-info">
                  <h4 style={{ color: '#b3b3b3', margin: '0 0 10px 0', textAlign: 'left' }}>Full Playlist Recommendation</h4>
                  <div style={{ width: '100%' }}>
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator`}
                      width="100%"
                      height="400"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                    ></iframe>
                  </div>
                </div>
              </div>

              <button onClick={handleReset} className="counter reset-btn" style={{ marginTop: '30px' }}>
                Analyze New Thought
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;