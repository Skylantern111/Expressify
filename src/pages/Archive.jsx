import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moodEmojis, vibeProfiles } from '../constants/appData';
import TrackCard from '../components/TrackCard';

export default function Archive({ history, favorites, toggleFavorite }) {
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'history';
    const [filterMood, setFilterMood] = useState(null);

    if (view === 'favorites') {
        return (
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
                        {favorites.map((track, idx) => (
                            <TrackCard key={idx} track={track} blob1Color="#8b3a2b" isFav={true} toggleFavorite={toggleFavorite} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Analytics Calculation for History View
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

    return (
        <div className="history-container fade-in">
            <div className="archive-header-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                <div className="heatmap-wrapper" style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #89a37e', flexShrink: 0 }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#8b3a2b', textTransform: 'uppercase', letterSpacing: '1px' }}>Last 28 Days</h3>
                    <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {heatmapDays.map((day, idx) => (
                            <div key={idx} style={{ width: '12px', height: '12px', borderRadius: '3px', background: day.color, opacity: day.isMuted ? 0.2 : 1, border: day.color === 'transparent' ? '1px solid #e0dcd3' : 'none', cursor: 'pointer' }} title={`${day.date}: ${day.count > 0 ? day.mood : "No entries"}`}></div>
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
                                <div key={mood} className={`explorer-card ${isActive ? 'active' : ''}`} onClick={() => setFilterMood(isActive ? null : mood)} style={{ borderColor: isActive ? profileColor : 'transparent', boxShadow: isActive ? `0 4px 12px ${profileColor}40` : '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <div className="explorer-header"><span className="explorer-emoji">{moodEmojis[mood]}</span><span className="explorer-mood-name" style={{ color: profileColor }}>{mood}</span></div>
                                    <div className="explorer-footer">
                                        <span className="explorer-count">{count} {count === 1 ? 'entry' : 'entries'}</span>
                                        <div className="explorer-bar-bg"><div className="explorer-bar-fill" style={{ width: `${(count / totalEntries) * 100}%`, backgroundColor: profileColor }}></div></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {history.length === 0 ? (
                <div className="history-card" style={{ textAlign: 'center', color: '#4a4a4a' }}>No diary entries found. Start reflecting!</div>
            ) : filteredHistory.length === 0 ? (
                <div className="history-card fade-in" style={{ textAlign: 'center', color: '#4a4a4a' }}>No entries found for {filterMood}.</div>
            ) : (
                <div className="history-list custom-scrollbar">
                    {filteredHistory.map((entry, idx) => (
                        <div key={idx} className="history-card fade-in" style={{ textAlign: 'left', marginBottom: '15px' }}>
                            <div className="history-header"><span className="history-date" style={{ color: '#7a7a7a' }}>{entry.timestamp}</span><span className="history-mood" style={{ color: entry?.affective_computing_data?.color1 || '#8b3a2b', fontWeight: 'bold' }}>{entry?.affective_computing_data?.detected_mood}</span></div>
                            <p className="history-text" style={{ margin: '10px 0', fontSize: '1.1rem' }}>"{entry.original_text || "No text recorded"}"</p>
                            {entry?.recommendation_data?.singles && entry.recommendation_data.singles.length > 0 && (
                                <div className="history-song" style={{ fontSize: '0.85rem', color: '#4a4a4a' }}>🎵 <strong>Soundtrack:</strong> {entry.recommendation_data.singles[0].title} by {entry.recommendation_data.singles[0].artist}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}