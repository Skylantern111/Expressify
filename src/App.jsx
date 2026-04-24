import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import './App.css';

// --- STATIC DATA MOVED OUTSIDE COMPONENT TO PREVENT RE-RENDERS ---
const negators = ['not', 'never', 'dont', "don't", 'cant', "can't", 'hardly', 'barely', 'no', 'isnt', "isn't", 'wasnt', "wasn't", 'arent', "aren't", 'didnt', "didn't"];

const moodEmojis = {
  "Happy & Energetic": "☀️", "Happy & Calm": "⛅", "Sad & Melancholy": "🌧️",
  "Angry & Energetic": "🌩️", "Neutral & Focused": "☁️", "Confident & Empowered": "🔥",
  "Romantic & Passionate": "💖", "Anxious & Stressed": "🌪️", "Nostalgic & Reflective": "🕰️",
  "Tired & Burned Out": "🌙"
};

const emotionDictionary = {
  highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good', 'excited', 'wonderful', 'blessed', 'great', 'amazing', 'lucky', 'glad', 'thrilled'],
  lowValence: ['sad', 'depressed', 'grey', 'fade', 'rain', 'melancholy', 'lonely', 'upset', 'terrible', 'cry', 'tears', 'hurts', 'awful', 'bad', 'miserable'],
  highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervous', 'rage', 'energetic', 'power', 'wild', 'mad', 'furious', 'angry', 'pumped'],
  lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'peaceful', 'quiet', 'relax', 'chill', 'soft', 'bored', 'lazy'],
  nostalgic: ['miss', 'memories', 'past', 'remember', 'childhood', 'old', 'yesterday', 'back then', 'nostalgia', 'longing'],
  anxious: ['stress', 'stressed', 'overwhelmed', 'worry', 'worried', 'nervous', 'panic', 'fear', 'scared', 'pressure', 'anxious'],
  romantic: ['love', 'romantic', 'crush', 'heart', 'passion', 'adore', 'date', 'kiss', 'together', 'sweet', 'affection'],
  confident: ['strong', 'unstoppable', 'boss', 'proud', 'achieved', 'slay', 'win', 'won', 'success', 'confident', 'ready'],
  tired: ['exhausted', 'drained', 'dead', 'done', 'sleep', 'bed', 'rest', 'burned out', 'tired', 'sleepy']
};

const vibeProfiles = {
  "Happy & Energetic": { id: "37i9dQZF1EVJSvZp5AOML2", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 85, eng: 80, color1: "#FFD700", color2: "#FF8C00", singles: [{ title: "Levitating", artist: "Dua Lipa" }, { title: "Walking On Sunshine", artist: "Katrina" }, { title: "Good Days", artist: "SZA" }, { title: "As It Was", artist: "Harry Styles" }, { title: "Blinding Lights", artist: "The Weeknd" }] },
  "Happy & Calm": { id: "37i9dQZF1DWSf2RDTDayIx", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 75, eng: 30, color1: "#87CEFA", color2: "#98FB98", singles: [{ title: "Put Your Records On", artist: "Corinne Bailey Rae" }, { title: "Banana Pancakes", artist: "Jack Johnson" }, { title: "Sunday Morning", artist: "Maroon 5" }, { title: "Here Comes The Sun", artist: "The Beatles" }, { title: "Bubbly", artist: "Colbie Caillat" }] },
  "Sad & Melancholy": { id: "37i9dQZF1DWVV27DiNWxkR", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 20, eng: 25, color1: "#4682B4", color2: "#191970", singles: [{ title: "Sparks", artist: "Coldplay" }, { title: "Liability", artist: "Lorde" }, { title: "The Night We Met", artist: "Lord Huron" }, { title: "Skinny Love", artist: "Bon Iver" }, { title: "Someone Like You", artist: "Adele" }] },
  "Angry & Energetic": { id: "37i9dQZF1DX1tyCD9QhIWF", youtubeId: "PLW0aKkE9mINJ00sJ25K_eQhD7T3IuE9G0", val: 15, eng: 90, color1: "#DC143C", color2: "#8B0000", singles: [{ title: "Misery Business", artist: "Paramore" }, { title: "Break Stuff", artist: "Limp Bizkit" }, { title: "good 4 u", artist: "Olivia Rodrigo" }, { title: "Killing In The Name", artist: "Rage Against The Machine" }, { title: "Smells Like Teen Spirit", artist: "Nirvana" }] },
  "Neutral & Focused": { id: "37i9dQZF1DWZeKCadgRdKQ", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 50, eng: 50, color1: "#9370DB", color2: "#4B0082", singles: [{ title: "Clair de Lune", artist: "Claude Debussy" }, { title: "Weightless", artist: "Marconi Union" }, { title: "Cornfield Chase", artist: "Hans Zimmer" }, { title: "Experience", artist: "Ludovico Einaudi" }, { title: "Gymnopédie No.1", artist: "Erik Satie" }] },
  "Confident & Empowered": { id: "37i9dQZF1DX4eRPd9frC1m", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 95, eng: 85, color1: "#FF4500", color2: "#FF8C00", singles: [{ title: "Boss Bitch", artist: "Doja Cat" }, { title: "Confident", artist: "Demi Lovato" }, { title: "Truth Hurts", artist: "Lizzo" }, { title: "Stronger", artist: "Kelly Clarkson" }, { title: "Survivor", artist: "Destiny's Child" }] },
  "Romantic & Passionate": { id: "37i9dQZF1DX50QitC6Oqtw", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 80, eng: 55, color1: "#FF1493", color2: "#C71585", singles: [{ title: "Perfect", artist: "Ed Sheeran" }, { title: "All of Me", artist: "John Legend" }, { title: "Lover", artist: "Taylor Swift" }, { title: "Just the Way You Are", artist: "Bruno Mars" }, { title: "Say You Won't Let Go", artist: "James Arthur" }] },
  "Anxious & Stressed": { id: "37i9dQZF1DWZqd5JICZI0u", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 35, eng: 75, color1: "#808080", color2: "#2F4F4F", singles: [{ title: "Breathin", artist: "Ariana Grande" }, { title: "In My Blood", artist: "Shawn Mendes" }, { title: "Heavy", artist: "Linkin Park" }, { title: "Help!", artist: "The Beatles" }, { title: "Stressed Out", artist: "Twenty One Pilots" }] },
  "Nostalgic & Reflective": { id: "37i9dQZF1DXc8kgYqQL52I", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 45, eng: 40, color1: "#DAA520", color2: "#8B4513", singles: [{ title: "Ribs", artist: "Lorde" }, { title: "Night Changes", artist: "One Direction" }, { title: "7 Years", artist: "Lukas Graham" }, { title: "Castle on the Hill", artist: "Ed Sheeran" }, { title: "Summer of '69", artist: "Bryan Adams" }] },
  "Tired & Burned Out": { id: "37i9dQZF1DWYcDQ1hSjOpY", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 15, eng: 10, color1: "#708090", color2: "#000000", singles: [{ title: "Breathe Me", artist: "Sia" }, { title: "Fix You", artist: "Coldplay" }, { title: "Chasing Pavements", artist: "Adele" }, { title: "Liability", artist: "Lorde" }, { title: "Slow Burn", artist: "Kacey Musgraves" }] }
};

const quotesDatabase = {
  "Happy & Energetic": [{ text: "Happiness is a choice, not a condition.", author: "Nora Roberts" }],
  "Happy & Calm": [{ text: "I have nothing to do today but smile.", author: "Paul Simon" }],
  "Sad & Melancholy": [{ text: "The wound is the place where the Light enters you.", author: "Rumi" }],
  "Angry & Energetic": [{ text: "Anger is like a storm rising up from the bottom of your consciousness.", author: "Thich Nhat Hanh" }],
  "Neutral & Focused": [{ text: "Words are our most inexhaustible source of magic.", author: "J.K. Rowling" }],
  "Confident & Empowered": [{ text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" }],
  "Romantic & Passionate": [{ text: "Reality is finally better than your dreams.", author: "Dr. Seuss" }],
  "Anxious & Stressed": [{ text: "Nothing diminishes anxiety faster than action.", author: "Walter Anderson" }],
  "Nostalgic & Reflective": [{ text: "Sometimes you will never know the value of a moment, until it becomes a memory.", author: "Dr. Seuss" }],
  "Tired & Burned Out": [{ text: "Almost everything will work again if you unplug it for a few minutes.", author: "Anne Lamott" }]
};

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const [activePlayer, setActivePlayer] = useState('youtube');
  const [isListening, setIsListening] = useState(false);

  const polaroidRef = useRef(null);

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('vibe_history')) || [];
      setHistory(savedHistory);
      const savedFavorites = JSON.parse(localStorage.getItem('vibe_favorites')) || [];
      setFavorites(savedFavorites);
    } catch (e) {
      setHistory([]);
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (track) => {
    const isFav = favorites.some(t => t.title === track.title && t.artist === track.artist);
    const newFavorites = isFav
      ? favorites.filter(t => !(t.title === track.title && t.artist === track.artist))
      : [...favorites, track];

    setFavorites(newFavorites);
    localStorage.setItem('vibe_favorites', JSON.stringify(newFavorites));
  };

  const handleSpeechToText = (e) => {
    e.preventDefault();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDiaryEntry(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const extractKeywords = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    let matched = [];

    tokens.forEach((t, i) => {
      const prev1 = i > 0 ? tokens[i - 1] : '';
      const prev2 = i > 1 ? tokens[i - 2] : '';
      const isNegated = negators.includes(prev1) || negators.includes(prev2);

      let baseLabel = '';
      if (emotionDictionary.lowValence.includes(t)) baseLabel = 'Negative';
      if (emotionDictionary.highValence.includes(t)) baseLabel = 'Positive';
      if (emotionDictionary.lowEnergy.includes(t)) baseLabel = 'Low Energy';
      if (emotionDictionary.highEnergy.includes(t)) baseLabel = 'High Energy';

      if (baseLabel) {
        if (isNegated) {
          if (baseLabel === 'Positive') baseLabel = 'Negative (Negated)';
          else if (baseLabel === 'Negative') baseLabel = 'Positive (Negated)';
          else if (baseLabel === 'High Energy') baseLabel = 'Low Energy (Negated)';
          else if (baseLabel === 'Low Energy') baseLabel = 'High Energy (Negated)';
        }

        const wordToStore = isNegated ? `${prev1 ? prev1 : prev2} ${t}` : t;
        if (!matched.find(m => m.word === wordToStore)) {
          matched.push({ word: wordToStore, label: baseLabel });
        }
      }
    });
    return matched.slice(0, 5);
  };

  const analyzeTextEmotion = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);

    let isHappy = false, isSad = false, isHighEnergy = false, isLowEnergy = false;
    let isConfident = false, isRomantic = false, isAnxious = false, isNostalgic = false, isTired = false;

    tokens.forEach((t, i) => {
      const prev1 = i > 0 ? tokens[i - 1] : '';
      const prev2 = i > 1 ? tokens[i - 2] : '';
      const isNegated = negators.includes(prev1) || negators.includes(prev2);

      if (emotionDictionary.highValence.includes(t)) { isNegated ? isSad = true : isHappy = true; }
      if (emotionDictionary.lowValence.includes(t)) { isNegated ? isHappy = true : isSad = true; }
      if (emotionDictionary.highEnergy.includes(t)) { isNegated ? isLowEnergy = true : isHighEnergy = true; }
      if (emotionDictionary.lowEnergy.includes(t)) { isNegated ? isHighEnergy = true : isLowEnergy = true; }

      if (emotionDictionary.confident.includes(t)) { isNegated ? isAnxious = true : isConfident = true; }
      if (emotionDictionary.romantic.includes(t)) { isNegated ? isSad = true : isRomantic = true; }
      if (emotionDictionary.anxious.includes(t)) { isNegated ? isHappy = true : isAnxious = true; }
      if (emotionDictionary.nostalgic.includes(t)) { isNostalgic = true; }
      if (emotionDictionary.tired.includes(t)) { isNegated ? isHighEnergy = true : isTired = true; }
    });

    if (isConfident) return { mood: "Confident & Empowered", profile: vibeProfiles["Confident & Empowered"] };
    if (isRomantic) return { mood: "Romantic & Passionate", profile: vibeProfiles["Romantic & Passionate"] };
    if (isAnxious) return { mood: "Anxious & Stressed", profile: vibeProfiles["Anxious & Stressed"] };
    if (isNostalgic) return { mood: "Nostalgic & Reflective", profile: vibeProfiles["Nostalgic & Reflective"] };
    if (isTired) return { mood: "Tired & Burned Out", profile: vibeProfiles["Tired & Burned Out"] };

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
      const tokenCount = diaryEntry.trim().split(/\s+/).length;

      const finalSessionData = {
        session_id: "sess_" + Date.now(),
        timestamp: new Date().toLocaleString(),
        original_text: diaryEntry,
        token_count: tokenCount,
        extracted_keywords: extractKeywords(diaryEntry),
        affective_computing_data: {
          detected_mood: result.mood,
          valence: result.profile.val,
          energy: result.profile.eng,
        },
        recommendation_data: {
          playlist_id: result.profile.id,
          youtube_playlist_id: result.profile.youtubeId,
          singles: result.profile.singles,
          quote: randomQuote
        }
      };

      try { await addDoc(collection(db, "sessions"), finalSessionData); }
      catch (fbError) { console.warn("Firebase Error:", fbError); }

      setSessionData(finalSessionData);
      setActivePlayer('spotify');
      setShowHistory(false);
      setShowFavorites(false);
      const newHistory = [finalSessionData, ...history].slice(0, 100);
      setHistory(newHistory);
      localStorage.setItem('vibe_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolaroid = async () => {
    if (!polaroidRef.current) return;
    try {
      const canvas = await html2canvas(polaroidRef.current, {
        backgroundColor: '#fdfbf7',
        scale: 2,
        borderRadius: 16
      });
      const link = document.createElement('a');
      link.download = `Expressify-Mood-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to capture polaroid", err);
    }
  };

  const totalEntries = history.length;
  let avgValence = 0;
  let avgEnergy = 0;
  let frequentMood = "No Data";

  if (totalEntries > 0) {
    avgValence = Math.round(history.reduce((acc, curr) => acc + curr.affective_computing_data.valence, 0) / totalEntries);
    avgEnergy = Math.round(history.reduce((acc, curr) => acc + curr.affective_computing_data.energy, 0) / totalEntries);

    const moodCounts = {};
    history.forEach(entry => {
      const mood = entry.affective_computing_data.detected_mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    frequentMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
  }

  const heatmapDays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString();

    const dayEntries = history.filter(entry => entry.timestamp.split(',')[0] === dateStr);
    let dominantMood = null;
    let color = 'rgba(255, 255, 255, 0.05)';

    if (dayEntries.length > 0) {
      const counts = {};
      dayEntries.forEach(e => {
        const m = e.affective_computing_data.detected_mood;
        counts[m] = (counts[m] || 0) + 1;
      });
      dominantMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      color = vibeProfiles[dominantMood]?.color1 || '#1DB954';
    }
    heatmapDays.push({ date: dateStr, mood: dominantMood, color, count: dayEntries.length });
  }

  return (
    <div id="root">
      <div className="music-wave-container">
        <div className="music-note note-1">♪</div><div className="music-note note-2">♫</div><div className="music-note note-3">♩</div><div className="music-note note-4">♬</div><div className="music-note note-5">♪</div><div className="music-note note-6">♫</div><div className="music-note note-7">♭</div>
      </div>

      <div className="app-wrapper">
        <div className="main-card">
          <div className="ai-badge">
            <div className="badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            Affective Computing
          </div>

          <div className="hero">
            <div>
              <h1>Expressify</h1>
              <p className="description">Transform your words into emotional insights.</p>
            </div>

            {!sessionData && (
              <div className="nav-group">
                <button onClick={() => { setShowHistory(!showHistory); setShowFavorites(false); }} className="history-toggle-btn">
                  {showHistory ? "Back to Generator" : "📖 My Archive"}
                </button>

                {!showHistory && (
                  <button onClick={() => { setShowFavorites(!showFavorites); setShowHistory(false); }} className="history-toggle-btn">
                    {showFavorites ? "Back to Generator" : "❤️ Favorites"}
                  </button>
                )}
              </div>
            )}
          </div>

          {showFavorites ? (
            <div className="history-container">
              <div className="mood-header">
                <h2>My Saved Tracks</h2>
                <p>Your personal collection of resonant songs.</p>
              </div>

              {favorites.length === 0 ? (
                <div className="history-card" style={{ textAlign: 'center', color: '#4a4a4a' }}>
                  No saved tracks yet. Generate a soundtrack and click the heart to save!
                </div>
              ) : (
                <div className="history-list">
                  {favorites.map((track, idx) => {
                    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;
                    return (
                      <div key={idx} className="history-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#000000', marginBottom: '5px' }}>{track.title}</div>
                          <div style={{ fontSize: '0.9rem', color: '#4a4a4a' }}>by {track.artist}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="listen-btn" style={{ padding: '6px 12px' }}>Listen</a>
                          <button onClick={() => toggleFavorite(track)} className="fav-btn active">❤️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : showHistory ? (
            <div className="history-container">
              <div className="mood-header">
                <h2>My Diary Archive</h2>
                <p>Your past entries and emotional insights.</p>
              </div>

              {totalEntries > 0 && (
                <>
                  <div className="history-stats-grid">
                    <div className="stat-box full-width">
                      <div className="stat-value">{frequentMood} {moodEmojis[frequentMood]}</div>
                      <div className="stat-label">Your Most Frequent Mood</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{avgValence}%</div>
                      <div className="stat-label">Avg Positivity</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{avgEnergy}%</div>
                      <div className="stat-label">Avg Energy</div>
                    </div>
                  </div>

                  <div className="heatmap-wrapper">
                    <h3 className="heatmap-header">Last 28 Days</h3>
                    <div className="heatmap-grid">
                      {heatmapDays.map((day, idx) => (
                        <div key={idx} className="heatmap-cell" style={{ background: day.color }}>
                          <span className="heatmap-tooltip">
                            {day.date}: {day.count > 0 ? day.mood : "No entries"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {history.length === 0 ? (
                <div className="history-card" style={{ textAlign: 'center', color: '#4a4a4a' }}>
                  No diary entries found. Start reflecting!
                </div>
              ) : (
                <div className="history-list">
                  {history.map((entry, idx) => (
                    <div key={idx} className="history-card">
                      <div className="history-header">
                        <span className="history-date">{entry.timestamp}</span>
                        <span className="history-mood">{entry.affective_computing_data.detected_mood}</span>
                      </div>
                      <p className="history-text">"{entry.original_text || "No text recorded"}"</p>
                      {entry.recommendation_data.singles && entry.recommendation_data.singles.length > 0 && (
                        <div className="history-song">
                          🎵 <strong>Soundtrack:</strong> {entry.recommendation_data.singles[0].title} by {entry.recommendation_data.singles[0].artist}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !sessionData ? (
            <form onSubmit={handleAnalyze} className="input-card">
              <div className="diary-input-wrapper">
                <textarea
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  placeholder="The rain has been pouring all day, and the sky looks so grey..."
                  className="diary-input"
                />
              </div>
              <div className="input-footer">
                <span className="char-count">{diaryEntry.length} / 1000</span>
                <div className="action-buttons">
                  <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleSpeechToText} title="Click to dictate">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    {isListening ? 'Listening...' : 'Voice'}
                  </button>

                  <button type="submit" className="analyze-btn" disabled={loading || !diaryEntry.trim()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    {loading ? 'Scanning...' : 'Analyze'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="results-container">
              <div ref={polaroidRef} className="polaroid-capture-area">
                <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <p style={{ fontStyle: 'italic', color: '#4a4a4a', fontSize: '1.2rem', lineHeight: '1.5', margin: 0 }}>
                    "{sessionData.original_text}"
                  </p>
                </div>

                <div className="mood-header">
                  <div className="mood-icon">{moodEmojis[sessionData.affective_computing_data.detected_mood]}</div>
                  <h2>{sessionData.affective_computing_data.detected_mood}</h2>
                  <p>Based on {sessionData.token_count} tokens analyzed</p>
                </div>

                <div className="top-metrics">
                  <div className="stat-item">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${sessionData.affective_computing_data.valence}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{sessionData.affective_computing_data.valence}%</text>
                    </svg>
                    <span className="stat-label">VALENCE</span>
                  </div>
                  <div className="stat-item">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${sessionData.affective_computing_data.energy}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{sessionData.affective_computing_data.energy}%</text>
                    </svg>
                    <span className="stat-label">ENERGY</span>
                  </div>
                </div>

                <div className="quote-box">
                  <p className="quote-text">"{sessionData.recommendation_data.quote?.text}"</p>
                  <p className="quote-author">— {sessionData.recommendation_data.quote?.author}</p>
                </div>

                {sessionData.extracted_keywords.length > 0 && (
                  <div className="keywords-section">
                    <h3 className="section-title">DETECTED KEYWORDS</h3>
                    <div className="keyword-list">
                      {sessionData.extracted_keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag">
                          <span className="tag-label">{kw.label}</span> {kw.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={handleSavePolaroid} className="export-btn">
                  Save as Polaroid
                </button>
              </div>

              <div className="platform-toggles">
                <button className={`toggle-pill spotify ${activePlayer === 'spotify' ? 'active' : ''}`} onClick={() => setActivePlayer('spotify')}>
                  Spotify Playlist
                </button>
                <button className={`toggle-pill youtube ${activePlayer === 'youtube' ? 'active' : ''}`} onClick={() => setActivePlayer('youtube')}>
                  YouTube Playlist
                </button>
              </div>

              <div className="player-container">
                {activePlayer === 'spotify' ? (
                  <iframe
                    key={sessionData.recommendation_data.playlist_id}
                    src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator`}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: '12px' }}
                  ></iframe>
                ) : (
                  <div className="playlist-column">
                    <h3 className="section-title">MOOD PLAYLIST</h3>
                    <div className="song-list">
                      {sessionData.recommendation_data.singles.map((track, idx) => {
                        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;
                        const isFav = favorites.some(t => t.title === track.title && t.artist === track.artist);

                        return (
                          <div className="song-item" key={idx}>
                            <div className="song-icon">
                              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                            </div>
                            <div className="song-info">
                              <span className="song-title">{track.title}</span>
                              <span className="song-artist">{track.artist}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <a href={youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="listen-btn">Listen</a>
                              <button onClick={() => toggleFavorite(track)} className={`fav-btn ${isFav ? 'active' : ''}`} title={isFav ? "Remove from Favorites" : "Save to Favorites"}>
                                {isFav ? '❤️' : '🤍'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="reset-btn">
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;