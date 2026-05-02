import { Link, useLocation } from 'react-router-dom';

export default function Navigation({ currentStreak, sessionData }) {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <>
            {(!isHome || sessionData) && (
                <Link to="/" className="ai-badge" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                    <div className="badge-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                        </svg>
                    </div>
                    ← Back to Generator
                </Link>
            )}

            <div className="hero">
                <div>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{ cursor: 'pointer', color: '#8b3a2b' }}>Expressify</h1>
                    </Link>
                    <p className="description">Transform your words into emotional insights.</p>

                    {currentStreak > 0 && isHome && !sessionData && (
                        <div className="streak-badge">
                            <span style={{ fontSize: '1.2rem' }}>🌱</span> {currentStreak} Day Reflection Streak
                        </div>
                    )}
                </div>

                {isHome && !sessionData && (
                    <div className="nav-group">
                        <Link to="/archive" className="history-toggle-btn" style={{ textDecoration: 'none' }}>
                            📖 My Archive
                        </Link>
                        <Link to="/archive?view=favorites" className="history-toggle-btn" style={{ textDecoration: 'none' }}>
                            ❤️ Favorites
                        </Link>
                        <Link to="/stave" className="history-toggle-btn" style={{ background: '#89a37e', color: 'white', borderColor: '#89a37e', textDecoration: 'none' }}>
                            🎼 The Global Stave
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}