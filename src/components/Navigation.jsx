import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation({ currentStreak, sessionData }) {
    const location = useLocation();
    const isHome = location.pathname === '/';
    
    // State for mobile responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMenuOpen(false); // Close menu if screen gets large
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '1rem' : '1rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            zIndex: 1000,
            boxSizing: 'border-box'
        }}>
            {/* Left Side: Brand and Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.8rem' : '2rem' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1 style={{ cursor: 'pointer', color: '#8b3a2b', margin: 0, fontSize: isMobile ? '1.3rem' : '1.5rem' }}>
                        Expressify
                    </h1>
                </Link>

                {currentStreak > 0 && isHome && !sessionData && (
                    <div className="streak-badge" style={{ margin: 0, padding: '0.3rem 0.6rem', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                        <span style={{ fontSize: '1rem' }}>🌱</span> {currentStreak} {isMobile ? '' : 'Day Streak'}
                    </div>
                )}
            </div>

            {/* Right Side: Navigation & Hamburger Menu */}
            {isHome && !sessionData && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    
                    {/* Hamburger Icon for Mobile */}
                    {isMobile && (
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#8b3a2b',
                                padding: '0.2rem 0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    )}

                    {/* Navigation Links */}
                    <nav style={{ 
    display: isMobile ? (isMenuOpen ? 'flex' : 'none') : 'flex', 
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '0.8rem' : '1.5rem', // Adjusted gap for cleaner spacing
    alignItems: isMobile ? 'flex-end' : 'center',
    
    // Right-aligned dropdown styling for mobile
    ...(isMobile && {
        position: 'absolute',
        top: 'calc(100% + 15px)', 
        right: 0, 
        backgroundColor: '#ffffff',
        padding: '1.2rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderRadius: '12px',
        minWidth: '200px',
        border: '1px solid #f0f0f0',
        boxSizing: 'border-box'
    })
}}>
    <Link to="/archive" className="history-toggle-btn" style={{ 
        textDecoration: 'none', 
        margin: 0, 
        fontWeight: '500', 
        textAlign: isMobile ? 'center' : 'center', 
        width: isMobile ? '100%' : 'auto', // Fixes desktop stretching
        whiteSpace: 'nowrap', // Prevents 2-liner wrapping
        padding: isMobile ? '0.2rem' : '0.5rem 1rem'
    }}>
        📖 My Archive
    </Link>
    
    <Link to="/archive?view=favorites" className="history-toggle-btn" style={{ 
        textDecoration: 'none', 
        margin: 0, 
        fontWeight: '500', 
        textAlign: isMobile ? 'center' : 'center', 
        width: isMobile ? '100%' : 'auto', 
        whiteSpace: 'nowrap', 
        padding: isMobile ? '0.2rem' : '0.5rem 1rem'
    }}>
        ❤️ Favorites
    </Link>
    
    <Link to="/stave" className="history-toggle-btn" style={{ 
        
         
        borderColor: '#89a37e', 
        textDecoration: 'none', 
        margin: 0, 
        fontWeight: '500', 
        textAlign: isMobile ? 'center' : 'center', 
        width: isMobile ? '100%' : 'auto', // Fixes desktop stretching
        whiteSpace: 'nowrap', // Prevents 2-liner wrapping
        padding: isMobile ? '0.2rem' : '0.5rem 1rem',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap' // Prevents "The Global Stave" from splitting into two lines
    }}>
        🎼 The Global Stave
    </Link>
</nav>
                </div>
            )}
        </header>
    );
}