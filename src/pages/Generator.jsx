import { useState, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { extractKeywords, analyzeTextEmotion } from '../utils/sentiment';
import { quotesDatabase, moodEmojis } from '../constants/appData';
import FloatingNote from '../components/FloatingNote';
import TrackCard from '../components/TrackCard';

export default function Generator({ history, setHistory, favorites, setFavorites, toggleFavorite }) {
    const [diaryEntry, setDiaryEntry] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [activePlayer, setActivePlayer] = useState('youtube');
    const [isListening, setIsListening] = useState(false);
    const [isReleaseMode, setIsReleaseMode] = useState(false);
    const [isReleasingNote, setIsReleasingNote] = useState(false);

    const polaroidRef = useRef(null);

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

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!diaryEntry.trim()) return;

        if (isReleaseMode) {
            setIsReleasingNote(true);
            const result = analyzeTextEmotion(diaryEntry);

            setTimeout(async () => {
                try {
                    await addDoc(collection(db, "global_symphony"), {
                        text: diaryEntry,
                        mood: result.mood,
                        color: result.profile.color1,
                        timestamp: Date.now(),
                        resonanceCount: 0
                    });
                } catch (err) {
                    console.warn("Could not save to global symphony", err);
                }
                setIsReleasingNote(false);
                setDiaryEntry('');
                setIsReleaseMode(false);
            }, 3000);
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
            const canvas = await html2canvas(polaroidRef.current, { backgroundColor: '#fdfbf7', scale: 2, borderRadius: 16 });
            const link = document.createElement('a');
            link.download = `Expressify-Mood-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to capture polaroid", err);
        }
    };

    if (!sessionData) {
        return (
            <div className="input-card-wrapper fade-in">
                <form onSubmit={handleAnalyze} className={`input-card ${isReleasingNote ? 'note-release-animation' : ''}`}>
                    <div className="release-toggle">
                        <input type="checkbox" id="rel" checked={isReleaseMode} onChange={() => setIsReleaseMode(!isReleaseMode)} />
                        <label htmlFor="rel">🎼 Release into the Melody (Analyze but don't save)</label>
                    </div>
                    <div className="diary-input-wrapper">
                        <textarea
                            value={diaryEntry}
                            onChange={(e) => setDiaryEntry(e.target.value)}
                            placeholder={isReleaseMode ? "Write it out. Then let it drift into the global symphony..." : "Share your thoughts..."}
                            className="diary-input"
                        />
                    </div>
                    <div className="input-footer">
                        <span className="char-count">{diaryEntry.length} / 1000</span>
                        <div className="action-buttons">
                            <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleSpeechToText} title="Click to dictate">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                {isListening ? 'Listening...' : 'Voice'}
                            </button>
                            <button type="submit" className="analyze-btn" disabled={loading || !diaryEntry.trim()}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                {loading ? 'Scanning...' : (isReleaseMode ? 'Cast Note' : 'Analyze')}
                            </button>
                        </div>
                    </div>
                </form>
                {isReleasingNote && <FloatingNote />}
            </div>
        );
    }

    const blob1Color = sessionData.affective_computing_data.color1 || '#89a37e';

    return (
        <div className="results-container fade-in">
            <div ref={polaroidRef} className="polaroid-capture-area" style={{ padding: '35px', background: '#fdfbf7', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <p style={{ fontStyle: 'italic', color: '#4a4a4a', fontSize: '1.2rem', fontFamily: "'Caveat', cursive", margin: 0 }}>"{sessionData.original_text}"</p>
                </div>
                <div className="mood-header">
                    <div className="mood-icon">{moodEmojis[sessionData.affective_computing_data.detected_mood]}</div>
                    <h2 style={{ color: blob1Color }}>{sessionData.affective_computing_data.detected_mood}</h2>
                    <p>Based on {sessionData.token_count} tokens analyzed</p>
                </div>
                <div className="top-metrics">
                    <div className="stat-item">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${sessionData.affective_computing_data.valence}, 100`} stroke={blob1Color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" className="percentage">{sessionData.affective_computing_data.valence}%</text>
                        </svg>
                        <span className="stat-label">VALENCE</span>
                    </div>
                    <div className="stat-item">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${sessionData.affective_computing_data.energy}, 100`} stroke={'#8b3a2b'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" className="percentage">{sessionData.affective_computing_data.energy}%</text>
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
                <button onClick={handleSavePolaroid} className="export-btn" style={{ background: '#1db954', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    📸 Save as Polaroid
                </button>
            </div>

            <div className="platform-toggles" style={{ display: 'flex', gap: '10px', marginBottom: '15px', justifyContent: 'center' }}>
                <button style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none', background: activePlayer === 'spotify' ? '#8b3a2b' : '#d1c8b8', color: activePlayer === 'spotify' ? 'white' : '#4a4a4a' }} onClick={() => setActivePlayer('spotify')}>Spotify Playlist</button>
                <button style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none', background: activePlayer === 'youtube' ? '#89a37e' : '#d1c8b8', color: activePlayer === 'youtube' ? 'white' : '#4a4a4a' }} onClick={() => setActivePlayer('youtube')}>YouTube Playlist</button>
            </div>

            <div className="player-container">
                {activePlayer === 'spotify' ? (
                    <iframe key={sessionData.recommendation_data.playlist_id} src={`https://open.spotify.com/embed/playlist/${sessionData.recommendation_data.playlist_id}?utm_source=generator`} width="100%" height="352" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ borderRadius: '12px' }}></iframe>
                ) : (
                    <div className="playlist-column">
                        <h3 className="section-title" style={{ color: '#8b3a2b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>MOOD PLAYLIST</h3>
                        <div className="song-list">
                            {sessionData.recommendation_data.singles.map((track, idx) => {
                                const isFav = favorites.some(t => t.title === track.title && t.artist === track.artist);
                                return <TrackCard key={idx} track={track} blob1Color={blob1Color} isFav={isFav} toggleFavorite={toggleFavorite} />;
                            })}
                        </div>
                    </div>
                )}
            </div>

            <button onClick={() => { setSessionData(null); setDiaryEntry(''); }} className="counter reset-btn fade-in" style={{ marginTop: '25px', display: 'block', margin: '25px auto 0', color: '#8b3a2b', fontWeight: 'bold', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Analyze New Thought
            </button>
        </div>
    );
}