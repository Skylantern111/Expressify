import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { moodEmojis } from '../constants/appData';

export default function Stave() {
    const [globalNotes, setGlobalNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [hasResonated, setHasResonated] = useState(false);

    useEffect(() => {
        const fetchGlobalNotes = async () => {
            try {
                const q = query(collection(db, "global_symphony"), orderBy("timestamp", "desc"), limit(10));
                const querySnapshot = await getDocs(q);
                const notes = [];
                querySnapshot.forEach((doc) => {
                    notes.push({
                        id: doc.id,
                        ...doc.data(),
                        top: Math.floor(Math.random() * 60) + 20 + '%',
                        left: Math.floor(Math.random() * 80) + 10 + '%',
                        animationDelay: (Math.random() * 2) + 's'
                    });
                });
                setGlobalNotes(notes);
            } catch (err) {
                console.warn("Could not fetch global notes. Ensure Firebase is configured.", err);
            }
        };
        fetchGlobalNotes();
    }, []);

    const handleResonate = async (noteId) => {
        if (hasResonated) return;
        try {
            const noteRef = doc(db, "global_symphony", noteId);
            await updateDoc(noteRef, { resonanceCount: increment(1) });
            setHasResonated(true);
            setSelectedNote(prev => ({ ...prev, resonanceCount: (prev.resonanceCount || 0) + 1 }));
        } catch (error) { console.error("Error sending resonance:", error); }
    };

    return (
        <div className="stave-container fade-in" style={{ position: 'relative', minHeight: '450px', background: '#fdfbf7', borderRadius: '16px', border: '1px solid #d1c8b8', padding: '20px', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
                <h2 style={{ color: '#8b3a2b', margin: '0 0 5px 0', fontSize: '2.2rem' }}>The Global Stave</h2>
                <p style={{ color: '#7a7a7a', fontSize: '0.9rem', margin: 0 }}>Click a note to hear an anonymous thought.</p>
            </div>

            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '35px', opacity: 0.15, pointerEvents: 'none' }}>
                <hr style={{ borderTop: '2px solid #000', width: '100%' }} /><hr style={{ borderTop: '2px solid #000', width: '100%' }} /><hr style={{ borderTop: '2px solid #000', width: '100%' }} /><hr style={{ borderTop: '2px solid #000', width: '100%' }} /><hr style={{ borderTop: '2px solid #000', width: '100%' }} />
            </div>

            {globalNotes.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '100px', color: '#7a7a7a' }}>No notes drifting right now. Be the first to cast one!</div>
            )}

            {globalNotes.map((note) => (
                <div key={note.id} onClick={() => setSelectedNote(note)} style={{ position: 'absolute', top: note.top, left: note.left, fontSize: '2.5rem', cursor: 'pointer', color: note.color || '#89a37e', textShadow: '0 4px 8px rgba(0,0,0,0.15)', animation: `floatUpDown 3s ease-in-out infinite alternate`, animationDelay: note.animationDelay, transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                    {['🎵', '🎶', '♩'][Math.floor(Math.random() * 3)]}
                </div>
            ))}

            {selectedNote && (
                <div className="glass-card fade-in" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', zIndex: 100, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '2rem' }}>{moodEmojis[selectedNote.mood]}</span>
                    <p style={{ fontStyle: 'italic', fontSize: '1.2rem', margin: '15px 0' }}>"{selectedNote.text}"</p>
                    <small style={{ color: selectedNote.color, fontWeight: 'bold' }}>{selectedNote.mood}</small>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => handleResonate(selectedNote.id)} className="history-toggle-btn" style={{ background: hasResonated ? '#89a37e' : '#2d2d2d', color: 'white', transition: 'all 0.3s' }} disabled={hasResonated}>
                            {hasResonated ? '✨ Resonated' : '🤍 Resonate'} <span style={{ marginLeft: '6px', opacity: 0.7 }}>({selectedNote.resonanceCount || 0})</span>
                        </button>
                        <button onClick={() => { setSelectedNote(null); setHasResonated(false); }} className="history-toggle-btn">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}