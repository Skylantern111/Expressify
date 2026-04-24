import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import './App.css';

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
  "Happy & Energetic": { id: "37i9dQZF1EVJSvZp5AOML2", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 85, eng: 80, color1: "#FFD700", singles: [{ title: "Levitating", artist: "Dua Lipa" }, { title: "Walking On Sunshine", artist: "Katrina" }, { title: "Good Days", artist: "SZA" }, { title: "As It Was", artist: "Harry Styles" }, { title: "Blinding Lights", artist: "The Weeknd" }, { title: "Uptown Funk", artist: "Bruno Mars" }, { title: "Happy", artist: "Pharrell Williams" }, { title: "Shake It Off", artist: "Taylor Swift" }, { title: "Can't Stop the Feeling!", artist: "Justin Timberlake" }, { title: "Dance The Night", artist: "Dua Lipa" }] },
  "Happy & Calm": { id: "37i9dQZF1DWSf2RDTDayIx", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 75, eng: 30, color1: "#87CEFA", singles: [{ title: "Put Your Records On", artist: "Corinne Bailey Rae" }, { title: "Sunday Morning", artist: "Maroon 5" }, { title: "Banana Pancakes", artist: "Jack Johnson" }, { title: "Here Comes The Sun", artist: "The Beatles" }, { title: "Bubbly", artist: "Colbie Caillat" }, { title: "Sunrise", artist: "Norah Jones" }, { title: "Better Together", artist: "Jack Johnson" }, { title: "Lovely Day", artist: "Bill Withers" }, { title: "Easy", artist: "Commodores" }, { title: "Just the Two of Us", artist: "Grover Washington" }] },
  "Sad & Melancholy": { id: "37i9dQZF1DWVV27DiNWxkR", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 20, eng: 25, color1: "#4682B4", singles: [{ title: "Sparks", artist: "Coldplay" }, { title: "The Night We Met", artist: "Lord Huron" }, { title: "Liability", artist: "Lorde" }, { title: "Skinny Love", artist: "Bon Iver" }, { title: "Someone Like You", artist: "Adele" }, { title: "Fix You", artist: "Coldplay" }, { title: "Breathe Me", artist: "Sia" }, { title: "All I Want", artist: "Kodaline" }, { title: "Say Something", artist: "A Great Big World" }, { title: "Let Her Go", artist: "Passenger" }] },
  "Angry & Energetic": { id: "37i9dQZF1DX1tyCD9QhIWF", youtubeId: "PLW0aKkE9mINJ00sJ25K_eQhD7T3IuE9G0", val: 15, eng: 90, color1: "#DC143C", singles: [{ title: "Misery Business", artist: "Paramore" }, { title: "Break Stuff", artist: "Limp Bizkit" }, { title: "good 4 u", artist: "Olivia Rodrigo" }, { title: "Killing In The Name", artist: "Rage Against The Machine" }, { title: "Smells Like Teen Spirit", artist: "Nirvana" }, { title: "Given Up", artist: "Linkin Park" }, { title: "Duality", artist: "Slipknot" }, { title: "Riot", artist: "Three Days Grace" }, { title: "Bodies", artist: "Drowning Pool" }, { title: "Bulls on Parade", artist: "Rage Against The Machine" }] },
  "Neutral & Focused": { id: "37i9dQZF1DWZeKCadgRdKQ", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 50, eng: 50, color1: "#9370DB", singles: [{ title: "Clair de Lune", artist: "Claude Debussy" }, { title: "Experience", artist: "Ludovico Einaudi" }, { title: "Weightless", artist: "Marconi Union" }, { title: "Cornfield Chase", artist: "Hans Zimmer" }, { title: "Gymnopédie No.1", artist: "Erik Satie" }, { title: "Nuvole Bianche", artist: "Ludovico Einaudi" }, { title: "Time", artist: "Hans Zimmer" }, { title: "River Flows in You", artist: "Yiruma" }, { title: "Interstellar", artist: "Hans Zimmer" }, { title: "Day One", artist: "Hans Zimmer" }] },
  "Confident & Empowered": { id: "37i9dQZF1DX4eRPd9frC1m", youtubeId: "PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph", val: 95, eng: 85, color1: "#FF4500", singles: [{ title: "Boss Bitch", artist: "Doja Cat" }, { title: "Stronger", artist: "Kelly Clarkson" }, { title: "Confident", artist: "Demi Lovato" }, { title: "Truth Hurts", artist: "Lizzo" }, { title: "Survivor", artist: "Destiny's Child" }, { title: "Roar", artist: "Katy Perry" }, { title: "Run the World", artist: "Beyoncé" }, { title: "Fighter", artist: "Christina Aguilera" }, { title: "Slay", artist: "Everglow" }, { title: "Juice", artist: "Lizzo" }] },
  "Romantic & Passionate": { id: "37i9dQZF1DX50QitC6Oqtw", youtubeId: "PLofht4PTcKYnaH8w5olJCG-FxJphDVMk", val: 80, eng: 55, color1: "#FF1493", singles: [{ title: "Perfect", artist: "Ed Sheeran" }, { title: "All of Me", artist: "John Legend" }, { title: "Lover", artist: "Taylor Swift" }, { title: "Just the Way You Are", artist: "Bruno Mars" }, { title: "Say You Won't Let Go", artist: "James Arthur" }, { title: "Thinking Out Loud", artist: "Ed Sheeran" }, { title: "A Thousand Years", artist: "Christina Perri" }, { title: "Make You Feel My Love", artist: "Adele" }, { title: "At Last", artist: "Etta James" }, { title: "Unchained Melody", artist: "The Righteous Brothers" }] },
  "Anxious & Stressed": { id: "37i9dQZF1DWZqd5JICZI0u", youtubeId: "PLMIbmfPk1y4XZQsMEHk6Zq0Z2mP2I5Tq1", val: 35, eng: 75, color1: "#808080", singles: [{ title: "Breathin", artist: "Ariana Grande" }, { title: "Help!", artist: "The Beatles" }, { title: "In My Blood", artist: "Shawn Mendes" }, { title: "Heavy", artist: "Linkin Park" }, { title: "Stressed Out", artist: "Twenty One Pilots" }, { title: "Crawling", artist: "Linkin Park" }, { title: "Fake Love", artist: "BTS" }, { title: "Basket Case", artist: "Green Day" }, { title: "Unwell", artist: "Matchbox Twenty" }, { title: "Numb", artist: "Linkin Park" }] },
  "Nostalgic & Reflective": { id: "37i9dQZF1DXc8kgYqQL52I", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 45, eng: 40, color1: "#DAA520", singles: [{ title: "Ribs", artist: "Lorde" }, { title: "Night Changes", artist: "One Direction" }, { title: "7 Years", artist: "Lukas Graham" }, { title: "Castle on the Hill", artist: "Ed Sheeran" }, { title: "Summer of '69", artist: "Bryan Adams" }, { title: "1979", artist: "The Smashing Pumpkins" }, { title: "Kids", artist: "MGMT" }, { title: "Yellow", artist: "Coldplay" }, { title: "100 Years", artist: "Five for Fighting" }, { title: "Photograph", artist: "Ed Sheeran" }] },
  "Tired & Burned Out": { id: "37i9dQZF1DWYcDQ1hSjOpY", youtubeId: "PLPE24i8B5jT_l62g2QZz-1HhYF4Y3_N1-", val: 15, eng: 10, color1: "#708090", singles: [{ title: "Breathe Me", artist: "Sia" }, { title: "Liability", artist: "Lorde" }, { title: "Fix You", artist: "Coldplay" }, { title: "Slow Burn", artist: "Kacey Musgraves" }, { title: "Chasing Pavements", artist: "Adele" }, { title: "The Scientist", artist: "Coldplay" }, { title: "Gravity", artist: "John Mayer" }, { title: "Fade Into You", artist: "Mazzy Star" }, { title: "Landslide", artist: "Fleetwood Mac" }, { title: "Mad World", artist: "Gary Jules" }] }
};

const quotesDatabase = {
  "Happy & Energetic": [{ text: "Happiness is a choice, not a condition.", author: "Nora Roberts" }],
  "Happy & Calm": [{ text: "I have nothing to do today but smile.", author: "Paul Simon" }],
  "Sad & Melancholy": [{ text: "The wound is the place where the Light enters you.", author: "Rumi" }],
  "Angry & Energetic": [{ text: "Anger is like a storm rising up.", author: "Thich Nhat Hanh" }],
  "Neutral & Focused": [{ text: "Words are our most inexhaustible source of magic.", author: "J.K. Rowling" }],
  "Confident & Empowered": [{ text: "No one can make you feel inferior.", author: "Eleanor Roosevelt" }],
  "Romantic & Passionate": [{ text: "Reality is finally better than your dreams.", author: "Dr. Seuss" }],
  "Anxious & Stressed": [{ text: "Nothing diminishes anxiety faster than action.", author: "Walter Anderson" }],
  "Nostalgic & Reflective": [{ text: "The value of a moment, until it becomes a memory.", author: "Dr. Seuss" }],
  "Tired & Burned Out": [{ text: "Almost everything will work again if you unplug it.", author: "Anne Lamott" }]
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
  const [filterMood, setFilterMood] = useState(null);
  const [isReleaseMode, setIsReleaseMode] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [releasedState, setReleasedState] = useState(false);

  const polaroidRef = useRef(null);

  useEffect(() => {
    try {
      const savedH = JSON.parse(localStorage.getItem('vibe_history')) || [];
      setHistory(savedH);
      const savedF = JSON.parse(localStorage.getItem('vibe_favorites')) || [];
      setFavorites(savedF);
    } catch (e) { setHistory([]); setFavorites([]); }
  }, []);

  const toggleFavorite = (track) => {
    const exists = favorites.find(t => t.title === track.title && t.artist === track.artist);
    let newFavs = exists
      ? favorites.filter(t => !(t.title === track.title && t.artist === track.artist))
      : [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('vibe_favorites', JSON.stringify(newFavs));
  };

  const handleSpeechToText = (e) => {
    e.preventDefault();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setDiaryEntry(prev => prev + ' ' + event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const extractKeywords = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    const negators = ['not', 'never', 'dont', "don't", 'cant', "can't", 'hardly', 'barely', 'no', 'isnt', "isn't", 'wasnt', "wasn't", 'arent', "aren't", 'didnt', "didn't"];
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
    const negators = ['not', 'never', 'dont', "don't", 'cant', "can't", 'hardly', 'barely', 'no', 'isnt', "isn't", 'wasnt', "wasn't", 'arent', "aren't", 'didnt', "didn't"];

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
    if (!diaryEntry.trim()) return;

    if (isReleaseMode) {
      setIsBurning(true);
      setTimeout(() => {
        setIsBurning(false);
        setReleasedState(true);
      }, 2000);
    } else {
      performAnalysis(true);
    }
  };

  const performAnalysis = async (shouldSave) => {
    setLoading(true);
    try {
      const result = analyzeTextEmotion(diaryEntry);
      const moodQuotes = quotesDatabase[result.mood];
      const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];

      const finalSessionData = {
        session_id: "sess_" + Date.now(),
        timestamp: new Date().toLocaleString(),
        original_text: diaryEntry,
        token_count: diaryEntry.trim().split(/\s+/).length,
        extracted_keywords: extractKeywords(diaryEntry),
        affective_computing_data: {
          detected_mood: result.mood,
          valence: result.profile.val,
          energy: result.profile.eng,
          color1: result.profile.color1
        },
        recommendation_data: {
          playlist_id: result.profile.id,
          youtube_playlist_id: result.profile.youtubeId,
          singles: result.profile.singles,
          quote: randomQuote
        }
      };

      if (shouldSave) {
        try { await addDoc(collection(db, "sessions"), finalSessionData); } catch (e) { }
        const newHistory = [finalSessionData, ...history].slice(0, 100);
        setHistory(newHistory);
        localStorage.setItem('vibe_history', JSON.stringify(newHistory));
      }
      setSessionData(finalSessionData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
  const moodCounts = {};

  if (totalEntries > 0) {
    avgValence = Math.round(history.reduce((acc, curr) => acc + (curr?.affective_computing_data?.valence || 0), 0) / totalEntries);
    avgEnergy = Math.round(history.reduce((acc, curr) => acc + (curr?.affective_computing_data?.energy || 0), 0) / totalEntries);

    history.forEach(entry => {
      const mood = entry?.affective_computing_data?.detected_mood;
      if (mood) moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    if (Object.keys(moodCounts).length > 0) {
      frequentMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    }
  }

  let currentStreak = 0;
  if (history.length > 0) {
    const uniqueDates = [...new Set(history.map(entry => {
      return new Date(entry.timestamp.split(',')[0]).toDateString();
    }))].filter(d => d !== "Invalid Date").sort((a, b) => new Date(b) - new Date(a));

    if (uniqueDates.length > 0) {
      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        let checkDate = new Date(uniqueDates[0]);
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
  }

  const heatmapDays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString();

    const dayEntries = history.filter(entry => entry.timestamp.split(',')[0] === dateStr);
    let dominantMood = null;
    let color = 'transparent';

    if (dayEntries.length > 0) {
      const counts = {};
      dayEntries.forEach(e => {
        const m = e?.affective_computing_data?.detected_mood;
        if (m) counts[m] = (counts[m] || 0) + 1;
      });
      if (Object.keys(counts).length > 0) {
        dominantMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        color = vibeProfiles[dominantMood]?.color1 || '#ff4500';
      }
    }

    const isMuted = filterMood && dominantMood !== filterMood;
    heatmapDays.push({ date: dateStr, mood: dominantMood, color, count: dayEntries.length, isMuted });
  }

  const uniqueMoods = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a]);
  const filteredHistory = filterMood ? history.filter(e => e?.affective_computing_data?.detected_mood === filterMood) : history;

  const blob1Color = sessionData?.affective_computing_data?.color1 || '#89a37e';

  return (
    <div id="root">
      <div className="music-wave-container">
        <div className="music-note note-1">♪</div><div className="music-note note-2">♫</div><div className="music-note note-3">♩</div><div className="music-note note-4">♬</div><div className="music-note note-5">♪</div><div className="music-note note-6">♫</div><div className="music-note note-7">♭</div>
      </div>

      <div className="app-wrapper">
        <div className="main-card">

          <div className="ai-badge" style={{ cursor: (showHistory || showFavorites || sessionData) ? 'pointer' : 'default' }} onClick={() => { setShowHistory(false); setShowFavorites(false); setSessionData(null); setFilterMood(null); }}>
            <div className="badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            {(showHistory || showFavorites || sessionData) ? "← Back to Generator" : "Affective Computing"}
          </div>

          <div className="hero">
            <div>
              <h1 style={{ cursor: 'pointer' }} onClick={() => { setShowHistory(false); setShowFavorites(false); setSessionData(null); setFilterMood(null); }}>Expressify</h1>
              <p className="description">Transform your words into emotional insights.</p>

              {currentStreak > 0 && !sessionData && !showHistory && !showFavorites && (
                <div className="streak-badge">
                  <span style={{ fontSize: '1.2rem' }}>🌱</span> {currentStreak} Day Reflection Streak
                </div>
              )}
            </div>

            {!sessionData && !showHistory && !showFavorites && (
              <div className="nav-group">
                <button onClick={() => { setShowHistory(true); setShowFavorites(false); setFilterMood(null); }} className="history-toggle-btn">
                  📖 My Archive
                </button>
                <button onClick={() => { setShowFavorites(true); setShowHistory(false); setFilterMood(null); }} className="history-toggle-btn">
                  ❤️ Favorites
                </button>
              </div>
            )}
          </div>

          {showFavorites ? (
            <div className="history-container fade-in">
              <div className="archive-title-container">
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
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b3a2b', marginBottom: '5px' }}>{track.title}</div>
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
            <div className="history-container fade-in">

              <div className="archive-header-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                <div className="heatmap-wrapper" style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #89a37e', flexShrink: 0 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#8b3a2b', textTransform: 'uppercase', letterSpacing: '1px' }}>Last 28 Days</h3>
                  <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {heatmapDays.map((day, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '12px', height: '12px', borderRadius: '3px',
                          background: day.color,
                          opacity: day.isMuted ? 0.2 : 1,
                          border: day.color === 'transparent' ? '1px solid #e0dcd3' : 'none'
                        }}
                        title={`${day.date}: ${day.count > 0 ? day.mood : "No entries"}`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="archive-title-container" style={{ textAlign: 'left', marginBottom: '0' }}>
                  <h2 style={{ margin: '0 0 5px 0', color: '#8b3a2b', fontSize: '2.2rem' }}>My Diary Archive</h2>
                  <p style={{ margin: '0', color: '#4a4a4a', fontSize: '1rem' }}>Your past entries and emotional insights.</p>
                </div>
              </div>

              {totalEntries > 0 && (
                <div className="history-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div className="glass-card stat-box" style={{ gridColumn: 'span 2', padding: '25px', textAlign: 'center', borderLeft: '4px solid #8b3a2b' }}>
                    <h3 style={{ margin: 0, color: '#2d3b25', fontSize: '1.8rem' }}>{frequentMood} {moodEmojis[frequentMood]}</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Your Most Frequent Mood</p>
                  </div>
                  <div className="glass-card stat-box" style={{ padding: '25px', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#8b3a2b', fontSize: '2rem' }}>{avgValence}%</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Avg Positivity</p>
                  </div>
                  <div className="glass-card stat-box" style={{ padding: '25px', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#8b3a2b', fontSize: '2rem' }}>{avgEnergy}%</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Avg Energy</p>
                  </div>
                </div>
              )}

              {uniqueMoods.length > 0 && (
                <div className="emotion-explorer fade-in">
                  <h4 className="explorer-title">Your Emotion Breakdown</h4>
                  <div className="explorer-grid">
                    {uniqueMoods.map(mood => {
                      const count = moodCounts[mood];
                      const isActive = filterMood === mood;
                      const profileColor = vibeProfiles[mood]?.color1 || '#8b3a2b';
                      return (
                        <div
                          key={mood}
                          className={`explorer-card ${isActive ? 'active' : ''}`}
                          onClick={() => setFilterMood(isActive ? null : mood)}
                          style={{
                            borderColor: isActive ? profileColor : 'transparent',
                            boxShadow: isActive ? `0 4px 12px ${profileColor}40` : '0 2px 8px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div className="explorer-header">
                            <span className="explorer-emoji">{moodEmojis[mood]}</span>
                            <span className="explorer-mood-name" style={{ color: profileColor }}>{mood}</span>
                          </div>
                          <div className="explorer-footer">
                            <span className="explorer-count">{count} {count === 1 ? 'entry' : 'entries'}</span>
                            <div className="explorer-bar-bg">
                              <div className="explorer-bar-fill" style={{ width: `${(count / totalEntries) * 100}%`, backgroundColor: profileColor }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {history.length === 0 ? (
                <div className="history-card" style={{ textAlign: 'center', color: '#4a4a4a' }}>
                  No diary entries found. Start reflecting!
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="history-card fade-in" style={{ textAlign: 'center', color: '#4a4a4a' }}>
                  No entries found for {filterMood}.
                </div>
              ) : (
                <div className="history-list custom-scrollbar">
                  {filteredHistory.map((entry, idx) => (
                    <div key={idx} className="history-card fade-in" style={{ textAlign: 'left', marginBottom: '15px' }}>
                      <div className="history-header">
                        <span className="history-date" style={{ color: '#7a7a7a' }}>{entry.timestamp}</span>
                        <span className="history-mood" style={{ color: entry?.affective_computing_data?.color1 || '#8b3a2b', fontWeight: 'bold' }}>
                          {entry?.affective_computing_data?.detected_mood}
                        </span>
                      </div>
                      <p className="history-text" style={{ margin: '10px 0', fontSize: '1.1rem' }}>"{entry.original_text || "No text recorded"}"</p>
                      {entry?.recommendation_data?.singles && entry.recommendation_data.singles.length > 0 && (
                        <div className="history-song" style={{ fontSize: '0.85rem', color: '#4a4a4a' }}>
                          🎵 <strong>Soundtrack:</strong> {entry.recommendation_data.singles[0].title} by {entry.recommendation_data.singles[0].artist}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !sessionData ? (
            <form onSubmit={handleAnalyze} className={`input-card fade-in ${isBurning ? 'release-animation' : ''}`}>
              <div className="release-toggle">
                <input type="checkbox" id="rel" checked={isReleaseMode} onChange={() => setIsReleaseMode(!isReleaseMode)} />
                <label htmlFor="rel">Release Mode </label>
              </div>
              <div className="diary-input-wrapper">
                <textarea
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  placeholder={isReleaseMode ? "Vent here... this will burn away." : "Share your thoughts..."}
                  className="diary-input"
                />
              </div>
              <div className="input-footer">
                <span className="char-count">{diaryEntry.length} / 1000</span>
                <div className="action-buttons">
                  <button
                    type="button"
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={handleSpeechToText}
                    title="Click to dictate"
                  >
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
          ) : releasedState ? (
            <div className="glass-card fade-in zen-container">
              <h2 style={{ color: '#89a37e', fontSize: '2rem', marginBottom: '10px' }}>Let it go.</h2>
              <p style={{ color: '#4a4a4a', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                Your thoughts have been released into the ether. They are no longer weighing you down. Take a deep breath.
              </p>

              <div className="breathing-circle"></div>

              <button
                onClick={() => {
                  setReleasedState(false);
                  setDiaryEntry('');
                  setIsReleaseMode(false);
                  setSessionData(null);
                }}
                className="history-toggle-btn"
                style={{ marginTop: '20px' }}
              >
                Return Home
              </button>
            </div>

          ) : (
            <div className="results-container fade-in">
              <div ref={polaroidRef} className="polaroid-capture-area" style={{ padding: '35px', background: '#fdfbf7', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>

                <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <p style={{ fontStyle: 'italic', color: '#4a4a4a', fontSize: '1.2rem', fontFamily: "'Caveat', cursive", margin: 0 }}>"{sessionData.original_text}"</p>
                </div>

                <div className="mood-header">
                  <div className="mood-icon">{moodEmojis[sessionData?.affective_computing_data?.detected_mood]}</div>
                  <h2 style={{ color: blob1Color }}>{sessionData.affective_computing_data.detected_mood}</h2>
                  <p>Based on {sessionData.token_count} tokens analyzed</p>
                </div>

                <div className="top-metrics">
                  <div className="stat-item">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${sessionData?.affective_computing_data?.valence}, 100`} stroke={blob1Color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{sessionData?.affective_computing_data?.valence}%</text>
                    </svg>
                    <span className="stat-label">VALENCE</span>
                  </div>
                  <div className="stat-item">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${sessionData?.affective_computing_data?.energy}, 100`} stroke={'#8b3a2b'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{sessionData?.affective_computing_data?.energy}%</text>
                    </svg>
                    <span className="stat-label">ENERGY</span>
                  </div>
                </div>

                <div className="quote-box" style={{ background: 'transparent', border: 'none', borderLeft: `4px solid ${blob1Color}`, padding: '10px 20px' }}>
                  <p className="quote-text" style={{ color: '#2d2d2d', fontSize: '1.1rem' }}>"{sessionData.recommendation_data.quote?.text}"</p>
                  <p className="quote-author" style={{ color: '#7a7a7a' }}>— {sessionData.recommendation_data.quote?.author}</p>
                </div>

                {sessionData.extracted_keywords.length > 0 && (
                  <div className="keywords-section">
                    <h3 className="section-title" style={{ fontSize: '0.8rem', color: '#8b3a2b', letterSpacing: '1px' }}>DETECTED KEYWORDS</h3>
                    <div className="keyword-list">
                      {sessionData.extracted_keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag" style={{ border: '1px solid #d1c8b8', background: 'transparent', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', display: 'inline-block', margin: '4px' }}>
                          <span className="tag-label" style={{ color: '#8b3a2b', fontWeight: 'bold', marginRight: '6px' }}>{kw.label}</span> {kw.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={handleSavePolaroid} className="export-btn" style={{ background: '#55df85', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save as Polaroid
                </button>
              </div>

              <div className="platform-toggles" style={{ display: 'flex', gap: '10px', marginBottom: '15px', justifyContent: 'center' }}>
                <button
                  style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none', background: activePlayer === 'spotify' ? '#8b3a2b' : '#d1c8b8', color: activePlayer === 'spotify' ? 'white' : '#4a4a4a' }}
                  onClick={() => setActivePlayer('spotify')}
                >
                  Spotify Playlist
                </button>
                <button
                  style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none', background: activePlayer === 'youtube' ? '#89a37e' : '#d1c8b8', color: activePlayer === 'youtube' ? 'white' : '#4a4a4a' }}
                  onClick={() => setActivePlayer('youtube')}
                >
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
                    <h3 className="section-title" style={{ color: '#8b3a2b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>MOOD PLAYLIST</h3>
                    <div className="song-list">
                      {sessionData.recommendation_data.singles.map((track, idx) => {
                        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;
                        const isFav = favorites.some(t => t.title === track.title && t.artist === track.artist);

                        return (
                          <div className="song-item" key={idx} style={{ background: '#fdfbf7', padding: '15px', borderRadius: '12px', border: '1px solid #d1c8b8', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <div className="song-icon" style={{ color: blob1Color }}>
                              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                            </div>
                            <div className="song-info" style={{ flexGrow: 1, textAlign: 'left' }}>
                              <span className="song-title" style={{ display: 'block', color: '#2d2d2d', fontWeight: 'bold' }}>{track.title}</span>
                              <span className="song-artist" style={{ display: 'block', color: '#7a7a7a', fontSize: '0.85rem' }}>{track.artist}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <a href={youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="listen-btn" style={{ padding: '6px 14px', background: '#2d2d2d', color: '#fff', borderRadius: '20px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                Listen
                              </a>
                              <button
                                onClick={() => toggleFavorite(track)}
                                className={`fav-btn ${isFav ? 'active' : ''}`}
                                title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: isFav ? '#ff4747' : '#d1c8b8' }}
                              >
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

              <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="counter reset-btn fade-in" style={{ marginTop: '25px', display: 'block', margin: '25px auto 0', color: '#8b3a2b', fontWeight: 'bold', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Analyze New Thought
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;