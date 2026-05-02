export default function TrackCard({ track, blob1Color, isFav, toggleFavorite }) {
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;

    return (
        <div className="song-item" style={{ background: '#fdfbf7', padding: '15px', borderRadius: '12px', border: '1px solid #d1c8b8', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <div className="song-icon" style={{ color: blob1Color || '#89a37e' }}>
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
}