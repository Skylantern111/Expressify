import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [activePlayer, setActivePlayer] = useState('spotify');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vibe_history')) || [];
      setHistory(saved);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  const moodEmojis = {
    "Happy & Energetic": "☀️", "Happy & Calm": "⛅", "Sad & Melancholy": "🌧️",
    "Angry & Energetic": "🌩️", "Neutral & Focused": "☁️", "Confident & Empowered": "🔥",
    "Romantic & Passionate": "💖", "Anxious & Stressed": "🌪️", "Nostalgic & Reflective": "🕰️",
    "Tired & Burned Out": "🌙"
  };

  const emotionDictionary = {
    highValence: ['happy', 'cheerful', 'joy', 'hope', 'optimism', 'good', 'excited', 'wonderful', 'blessed', 'great', 'amazing', 'lucky'],
    lowValence: ['sad', 'depressed', 'grey', 'fade', 'rain', 'melancholy', 'lonely', 'upset', 'terrible', 'cry', 'tears', 'hurts'],
    highEnergy: ['fast', 'loud', 'noisy', 'panic', 'nervous', 'rage', 'energetic', 'power', 'wild', 'mad', 'furious', 'angry'],
    lowEnergy: ['calm', 'fatigue', 'passive', 'slow', 'peaceful', 'quiet', 'relax', 'chill', 'soft'],
    nostalgic: ['miss', 'memories', 'past', 'remember', 'childhood', 'old', 'yesterday', 'back then', 'nostalgia'],
    anxious: ['stress', 'stressed', 'overwhelmed', 'worry', 'worried', 'nervous', 'panic', 'fear', 'scared', 'pressure'],
    romantic: ['love', 'romantic', 'crush', 'heart', 'passion', 'adore', 'date', 'kiss', 'together', 'sweet'],
    confident: ['strong', 'unstoppable', 'boss', 'proud', 'achieved', 'slay', 'win', 'won', 'success', 'confident', 'ready'],
    tired: ['exhausted', 'drained', 'dead', 'done', 'sleep', 'bed', 'rest', 'burned out', 'tired', 'sleepy']
  };

  const vibeProfiles = {
    "Happy & Energetic": { id: "37i9dQZF1EVJSvZp5AOML2", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 85, eng: 80, singles: [{ title: "Levitating", artist: "Dua Lipa" }, { title: "Walking On Sunshine", artist: "Katrina" }, { title: "Good Days", artist: "SZA" }, { title: "As It Was", artist: "Harry Styles" }, { title: "Blinding Lights", artist: "The Weeknd" }] },
    "Happy & Calm": { id: "37i9dQZF1DWSf2RDTDayIx", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 75, eng: 30, singles: [{ title: "Put Your Records On", artist: "Corinne Bailey Rae" }, { title: "Banana Pancakes", artist: "Jack Johnson" }, { title: "Sunday Morning", artist: "Maroon 5" }, { title: "Here Comes The Sun", artist: "The Beatles" }, { title: "Bubbly", artist: "Colbie Caillat" }] },
    "Sad & Melancholy": { id: "37i9dQZF1DWVV27DiNWxkR", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 20, eng: 25, singles: [{ title: "Sparks", artist: "Coldplay" }, { title: "Liability", artist: "Lorde" }, { title: "The Night We Met", artist: "Lord Huron" }, { title: "Skinny Love", artist: "Bon Iver" }, { title: "Someone Like You", artist: "Adele" }] },
    "Angry & Energetic": { id: "37i9dQZF1DX1tyCD9QhIWF", youtubeId: "PLW0aKkE9mINJ00sJ25K_eQhD7T3IuE9G0", val: 15, eng: 90, singles: [{ title: "Misery Business", artist: "Paramore" }, { title: "Break Stuff", artist: "Limp Bizkit" }, { title: "good 4 u", artist: "Olivia Rodrigo" }, { title: "Killing In The Name", artist: "Rage Against The Machine" }, { title: "Smells Like Teen Spirit", artist: "Nirvana" }] },
    "Neutral & Focused": { id: "37i9dQZF1DWZeKCadgRdKQ", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 50, eng: 50, singles: [{ title: "Clair de Lune", artist: "Claude Debussy" }, { title: "Weightless", artist: "Marconi Union" }, { title: "Cornfield Chase", artist: "Hans Zimmer" }, { title: "Experience", artist: "Ludovico Einaudi" }, { title: "Gymnopédie No.1", artist: "Erik Satie" }] },
    "Confident & Empowered": { id: "37i9dQZF1DX4eRPd9frC1m", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 95, eng: 85, singles: [{ title: "Boss Bitch", artist: "Doja Cat" }, { title: "Confident", artist: "Demi Lovato" }, { title: "Truth Hurts", artist: "Lizzo" }, { title: "Stronger", artist: "Kelly Clarkson" }, { title: "Survivor", artist: "Destiny's Child" }] },
    "Romantic & Passionate": { id: "37i9dQZF1DX50QitC6Oqtw", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 80, eng: 55, singles: [{ title: "Perfect", artist: "Ed Sheeran" }, { title: "All of Me", artist: "John Legend" }, { title: "Lover", artist: "Taylor Swift" }, { title: "Just the Way You Are", artist: "Bruno Mars" }, { title: "Say You Won't Let Go", artist: "James Arthur" }] },
    "Anxious & Stressed": { id: "37i9dQZF1DWZqd5JICZI0u", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 35, eng: 75, singles: [{ title: "Breathin", artist: "Ariana Grande" }, { title: "In My Blood", artist: "Shawn Mendes" }, { title: "Heavy", artist: "Linkin Park" }, { title: "Help!", artist: "The Beatles" }, { title: "Stressed Out", artist: "Twenty One Pilots" }] },
    "Nostalgic & Reflective": { id: "37i9dQZF1DXc8kgYqQL52I", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 45, eng: 40, singles: [{ title: "Ribs", artist: "Lorde" }, { title: "Night Changes", artist: "One Direction" }, { title: "7 Years", artist: "Lukas Graham" }, { title: "Castle on the Hill", artist: "Ed Sheeran" }, { title: "Summer of '69", artist: "Bryan Adams" }] },
    "Tired & Burned Out": { id: "37i9dQZF1DWYcDQ1hSjOpY", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 15, eng: 10, singles: [{ title: "Breathe Me", artist: "Sia" }, { title: "Fix You", artist: "Coldplay" }, { title: "Chasing Pavements", artist: "Adele" }, { title: "Liability", artist: "Lorde" }, { title: "Slow Burn", artist: "Kacey Musgraves" }] }
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

  const extractKeywords = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    let matched = [];
    tokens.forEach(t => {
      if (emotionDictionary.lowValence.includes(t)) matched.push({ word: t, label: 'Negative' });
      if (emotionDictionary.highValence.includes(t)) matched.push({ word: t, label: 'Positive' });
      if (emotionDictionary.lowEnergy.includes(t)) matched.push({ word: t, label: 'Low Energy' });
      if (emotionDictionary.highEnergy.includes(t)) matched.push({ word: t, label: 'High Energy' });
    });
    return matched.slice(0, 4);
  };

  const analyzeTextEmotion = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    if (tokens.some(t => emotionDictionary.confident.includes(t))) return { mood: "Confident & Empowered", profile: vibeProfiles["Confident & Empowered"] };
    if (tokens.some(t => emotionDictionary.romantic.includes(t))) return { mood: "Romantic & Passionate", profile: vibeProfiles["Romantic & Passionate"] };
    if (tokens.some(t => emotionDictionary.anxious.includes(t))) return { mood: "Anxious & Stressed", profile: vibeProfiles["Anxious & Stressed"] };
    if (tokens.some(t => emotionDictionary.nostalgic.includes(t))) return { mood: "Nostalgic & Reflective", profile: vibeProfiles["Nostalgic & Reflective"] };
    if (tokens.some(t => emotionDictionary.tired.includes(t))) return { mood: "Tired & Burned Out", profile: vibeProfiles["Tired & Burned Out"] };

    let isHappy = tokens.some(t => emotionDictionary.highValence.includes(t));
    let isSad = tokens.some(t => emotionDictionary.lowValence.includes(t));
    let isHighEnergy = tokens.some(t => emotionDictionary.highEnergy.includes(t));
    let isLowEnergy = tokens.some(t => emotionDictionary.lowEnergy.includes(t));

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
        timestamp: new Date().toLocaleTimeString(),
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

      try { await addDoc(collection(db, "sessions"), finalSessionData); } catch (fbError) { console.warn("FB Error:", fbError); }

      setSessionData(finalSessionData);
      setActivePlayer('spotify');
      const newHistory = [finalSessionData, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('vibe_history', JSON.stringify(newHistory));
    } catch (error) { console.error("System Error:", error); } finally { setLoading(false); }
  };

  return (
    <div id="root">
      {/* Background Watercolor Blobs */}
      <div className="watercolor-blob blob-1"></div>
      <div className="watercolor-blob blob-2"></div>
      <div className="watercolor-blob blob-3"></div>
      <div className="splatter-1"></div>

      <div className="music-wave-container">
        <div className="music-note note-1">♪</div><div className="music-note note-2">♫</div><div className="music-note note-3">♩</div><div className="music-note note-4">♬</div><div className="music-note note-5">♪</div><div className="music-note note-6">♫</div><div className="music-note note-7">♭</div>
      </div>

      <div className="app-wrapper">
        <div className="main-card">

          <div className="ai-badge">
            <div className="badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            Affective Computing
          </div>

          <div className="hero">
            <h1>Expressify</h1>
            <p className="description">Transform your words into emotional insights. Discover your mood, get curated playlists, and find quotes that resonate.</p>
          </div>

          {!sessionData ? (
            <form onSubmit={handleAnalyze} className="input-card">
              <div className="diary-input-wrapper">
                <textarea value={diaryEntry} onChange={(e) => setDiaryEntry(e.target.value)} placeholder="The rain has been pouring all day, and the sky looks so grey..." className="diary-input" />
              </div>
              <div className="input-footer">
                <span className="char-count">{diaryEntry.length} / 1000</span>
                <button type="submit" className="analyze-btn" disabled={loading || !diaryEntry.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </form>
          ) : (
            <div className="results-container">

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

              {/* QUOTE AND KEYWORDS NOW STACKED ABOVE TOGGLES */}
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
                    src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator&theme=0`}
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
                        return (
                          <div className="song-item" key={idx}>
                            <div className="song-icon youtube-icon">
                              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                            </div>
                            <div className="song-info">
                              <span className="song-title">{track.title}</span>
                              <span className="song-artist">{track.artist}</span>
                            </div>
                            <a href={youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="listen-btn youtube-btn">
                              Listen on YouTube
                            </a>
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