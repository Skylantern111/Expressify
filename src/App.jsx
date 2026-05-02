import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <div className="music-wave-container">
          <div className="music-note note-1">♪</div><div className="music-note note-2">♫</div><div className="music-note note-3">♩</div><div className="music-note note-4">♬</div><div className="music-note note-5">♪</div><div className="music-note note-6">♫</div><div className="music-note note-7">♭</div>
        </div>

        <div className="app-wrapper">
          <div className="main-card">

            <Navigation currentStreak={currentStreak} />

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