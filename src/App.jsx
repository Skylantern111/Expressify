import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import Generator from './pages/Generator';
import Archive from './pages/Archive';
import Stave from './pages/Stave';
import './App.css';

function App() {
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const savedH = JSON.parse(localStorage.getItem('vibe_history')) || [];
      setHistory(savedH);
      const savedF = JSON.parse(localStorage.getItem('vibe_favorites')) || [];
      setFavorites(savedF);
    } catch (e) {
      setHistory([]); setFavorites([]);
    }
  }, []);

  const toggleFavorite = (track) => {
    const exists = favorites.find(t => t.title === track.title && t.artist === track.artist);
    let newFavs = exists
      ? favorites.filter(t => !(t.title === track.title && t.artist === track.artist))
      : [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('vibe_favorites', JSON.stringify(newFavs));
  };

  let currentStreak = 0;
  if (history.length > 0) {
    const uniqueDates = [...new Set(history.map(entry => new Date(entry.timestamp.split(',')[0]).toDateString()))].filter(d => d !== "Invalid Date").sort((a, b) => new Date(b) - new Date(a));
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toDateString();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        let checkDate = new Date(uniqueDates[0]);
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else { break; }
        }
      }
    }
  }

  return (
    <Router>
      <div id="root">
        <Navigation currentStreak={currentStreak} />

        <div className="music-wave-container">
          <div className="music-note note-1">♪</div><div className="music-note note-2">♫</div><div className="music-note note-3">♩</div><div className="music-note note-4">♬</div><div className="music-note note-5">♪</div><div className="music-note note-6">♫</div><div className="music-note note-7">♭</div>
        </div>

        {/* Added margin-top here so it isn't hidden behind the fixed header */}
        <div className="app-wrapper" style={{ marginTop: '100px' }}>
          
          {/* Back to Generator Button - Appears only when not on Home */}
          <Routes>
            <Route path="/" element={null} />
            <Route path="*" element={
              <div style={{ display: 'flex', zIndex: 100, justifyContent: 'flex-start', marginBottom: '1rem', width: '100%', maxWidth: '800px', margin: '0 auto 1rem auto' }}>
                <Link to="/" className="ai-badge" style={{ textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="badge-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                    </svg>
                  </div>
                  ← Back to Generator
                </Link>
              </div>
            } />
          </Routes>

          <div className="main-card">
            <div className="hero" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p className="description" style={{ margin: 0 }}>Transform your words into emotional insights.</p>
            </div>

            <Routes>
              <Route path="/" element={<Generator history={history} setHistory={setHistory} favorites={favorites} setFavorites={setFavorites} toggleFavorite={toggleFavorite} />} />
              <Route path="/archive" element={<Archive history={history} favorites={favorites} toggleFavorite={toggleFavorite} />} />
              <Route path="/stave" element={<Stave />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
