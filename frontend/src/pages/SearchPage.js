import React, { useState } from 'react';
import { Search, BookOpen, X, Hash, Copy, Info, Eye, Sparkles } from 'lucide-react';
import { getBooks } from '../utils/api';

const COVER_COLORS = ['#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6','#fbbf24','#a78bfa','#34d399','#f87171','#60a5fa'];
const COVER_PATTERNS = [
  'repeating-linear-gradient(45deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 2px,transparent 2px,transparent 8px)',
  'repeating-linear-gradient(-45deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 2px,transparent 2px,transparent 8px)',
  'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.15) 0%,transparent 50%)',
  'repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 6px)',
];
const GENRE_BADGE = {
  'Computer Science':'violet','Mathematics':'amber','Literature':'amber',
  'Science':'emerald','Law':'violet','Business':'amber','Engineering':'emerald',
  'Medicine':'red','History':'gray','Arts':'violet','Other':'gray',
  'Programming':'violet','Software Architecture':'violet','Software Engineering':'emerald',
  'Fiction':'amber','Non-Fiction':'gray','General':'gray',
};

function hashStr(str) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(h);
}
function coverColor(str) { return COVER_COLORS[hashStr(str) % COVER_COLORS.length]; }
function coverPattern(str) { return COVER_PATTERNS[hashStr(str) % COVER_PATTERNS.length]; }

/* ── Detail Modal ── */
function BookModal({ book, onClose }) {
  if (!book) return null;
  const pct = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;
  const barColor = pct > 50 ? 'var(--emerald)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
  const statusLabel = book.availableCopies === 0 ? 'Unavailable' : book.availableCopies <= 1 ? 'Low Stock' : 'Available';
  const statusClass = book.availableCopies === 0 ? 'badge-red' : book.availableCopies <= 1 ? 'badge-amber' : 'badge-emerald';
  const bg = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}><X size={18}/></button>
        <div style={S.modalTop}>
          <div style={{ ...S.modalCover, background: bg }}>
            <div style={{ ...S.modalCoverPat, backgroundImage: pat }}/>
            <div style={S.modalSpine}/>
            <span style={S.modalLetter}>{book.title[0].toUpperCase()}</span>
            <div style={S.modalShine}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
              <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`}>{book.genre}</span>
              <span className={`badge ${statusClass}`}>{statusLabel}</span>
            </div>
            <h2 style={S.modalTitle}>{book.title}</h2>
            <p style={S.modalAuthor}>by {book.author}</p>
            {book.isbn && (
              <div style={S.metaRow}><Hash size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ISBN: {book.isbn}</span></div>
            )}
            <div style={S.metaRow}><Copy size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ID: {book.bookId}</span></div>
            <div style={{ marginTop:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                <span style={{ color:'var(--text-secondary)', fontWeight:600 }}>Availability</span>
                <span style={{ color:'var(--text-muted)' }}>{book.availableCopies} / {book.totalCopies} copies</span>
              </div>
              <div className="progress-bar-wrap" style={{ height:8, borderRadius:6 }}>
                <div className="progress-bar-fill" style={{ width:`${pct}%`, background:barColor, borderRadius:6 }}/>
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{pct}% available</div>
            </div>
            <div style={S.statsRow}>
              <div style={S.stat}><div style={{ ...S.statVal, color:'var(--amber)' }}>{book.totalCopies}</div><div style={S.statLbl}>Total</div></div>
              <div style={S.stat}><div style={{ ...S.statVal, color:'var(--emerald)' }}>{book.availableCopies}</div><div style={S.statLbl}>Available</div></div>
              <div style={S.stat}><div style={{ ...S.statVal, color:'var(--violet-light)' }}>{book.totalCopies - book.availableCopies}</div><div style={S.statLbl}>On Loan</div></div>
            </div>
          </div>
        </div>
        {book.description && (
          <div style={S.descBox}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <Info size={13} style={{ color:'var(--amber)' }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.8px' }}>About this book</span>
            </div>
            <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.7 }}>{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Book Card ── */
function BookCard({ book, onClick }) {
  const pct = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;
  const barColor = pct > 50 ? 'var(--emerald)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
  const statusLabel = book.availableCopies === 0 ? 'Unavailable' : book.availableCopies <= 1 ? 'Low Stock' : 'Available';
  const statusClass = book.availableCopies === 0 ? 'badge-red' : book.availableCopies <= 1 ? 'badge-amber' : 'badge-emerald';
  const bg = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);

  return (
    <div style={S.card} className="book-ecom-card" onClick={onClick}>
      <div style={{ ...S.cover, background: bg }}>
        <div style={{ ...S.coverPat, backgroundImage: pat }}/>
        <div style={S.spine}/>
        <span style={S.letter}>{book.title[0].toUpperCase()}</span>
        <div style={S.shine}/>
        {book.availableCopies === 0 && <div style={S.ribbon}>OUT OF STOCK</div>}
        <div className="cover-hover-overlay" style={S.hoverOverlay}>
          <Eye size={16} style={{ marginBottom:4 }}/>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.5px' }}>View Details</span>
        </div>
      </div>
      <div style={S.body}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`} style={{ fontSize:10 }}>{book.genre}</span>
          <span className={`badge ${statusClass}`} style={{ fontSize:10 }}>{statusLabel}</span>
        </div>
        <h3 style={S.title} title={book.title}>{book.title}</h3>
        <p style={S.author}>{book.author}</p>
        {book.description && <p style={S.desc}>{book.description}</p>}
        <div style={{ marginTop:'auto', paddingTop:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
            <span style={{ color:'var(--text-muted)' }}>Availability</span>
            <span style={{ color:'var(--text-secondary)', fontWeight:600 }}>{book.availableCopies}/{book.totalCopies}</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width:`${pct}%`, background:barColor }}/>
          </div>
        </div>
      </div>
      <div style={S.footer}>
        <span style={S.idPill}>{book.bookId}</span>
        <span style={{ fontSize:10, color:'var(--text-muted)' }}>Click for details</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SearchPage() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSearch = async e => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try { const res = await getBooks(query.trim()); setResults(res.data); setSearched(true); }
    catch(_) {}
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Search Books</h1>
          <p>Find books by title or author across the entire catalog</p>
        </div>
        <svg width="100" height="70" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="45" cy="35" r="22" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.5"/>
          <line x1="62" y1="52" x2="80" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          <rect x="33" y="26" width="6" height="18" rx="2" fill="#8b5cf6" opacity="0.7"/>
          <rect x="41" y="22" width="5" height="22" rx="2" fill="#f59e0b" opacity="0.7"/>
          <rect x="48" y="28" width="6" height="16" rx="2" fill="#10b981" opacity="0.7"/>
        </svg>
      </div>

      <div className="card" style={{ marginBottom:24 }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
          <div className="form-group" style={{ flex:1 }}>
            <label className="form-label">Search Query</label>
            <input className="form-input" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Enter book title or author name…"/>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Search size={14}/> {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {loading && <div className="loading-center"><div className="spinner"/></div>}

      {searched && !loading && (
        results.length === 0 ? (
          <div className="empty-state">
            <Search size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
            <h3>No results found</h3>
            <p>No books match "<strong>{query}</strong>". Try a different keyword.</p>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
              <Sparkles size={14} style={{ color:'var(--amber)' }}/>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                <strong style={{ color:'var(--amber)' }}>{query}</strong>
              </span>
            </div>
            <div style={S.grid}>
              {results.map(b => <BookCard key={b._id} book={b} onClick={() => setSelected(b)}/>)}
            </div>
          </>
        )
      )}

      {!searched && !loading && (
        <div className="empty-state" style={{ paddingTop:64 }}>
          <BookOpen size={48} style={{ margin:'0 auto 16px', display:'block', opacity:0.2 }}/>
          <h3 style={{ marginBottom:8 }}>Start searching</h3>
          <p>Type a title or author name above and hit Search.</p>
        </div>
      )}

      <BookModal book={selected} onClose={() => setSelected(null)}/>
      <style>{CSS}</style>
    </div>
  );
}

/* ── Styles ── */
const S = {
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:20 },
  card: {
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16,
    overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer',
    transition:'transform 0.22s ease,border-color 0.22s ease,box-shadow 0.22s ease',
    position:'relative',
  },
  cover: {
    height:180, position:'relative', display:'flex', alignItems:'center',
    justifyContent:'center', overflow:'hidden', flexShrink:0,
  },
  coverPat: { position:'absolute', inset:0 },
  spine: {
    position:'absolute', left:0, top:0, bottom:0, width:10,
    background:'rgba(0,0,0,0.28)', borderRight:'1px solid rgba(255,255,255,0.08)',
  },
  shine: {
    position:'absolute', top:0, left:10, right:0, height:'38%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.13) 0%,transparent 100%)',
    pointerEvents:'none',
  },
  letter: {
    fontFamily:"'Playfair Display',serif", fontSize:58, fontWeight:900,
    color:'rgba(0,0,0,0.32)', position:'relative', zIndex:1,
    userSelect:'none', textShadow:'0 2px 10px rgba(0,0,0,0.25)',
  },
  ribbon: {
    position:'absolute', top:14, right:-10, background:'var(--red)', color:'#fff',
    fontSize:8, fontWeight:800, padding:'3px 18px 3px 8px', letterSpacing:'1px',
    clipPath:'polygon(0 0,100% 0,88% 50%,100% 100%,0 100%)',
  },
  hoverOverlay: {
    position:'absolute', inset:0, background:'rgba(0,0,0,0.68)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    color:'#fff', opacity:0, transition:'opacity 0.25s ease', zIndex:2,
  },
  body: { padding:'14px 14px 8px', flex:1, display:'flex', flexDirection:'column' },
  title: {
    fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700,
    color:'var(--text-primary)', lineHeight:1.35, marginBottom:4,
    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
  },
  author: {
    fontSize:11.5, color:'var(--text-secondary)', marginBottom:6,
    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
  },
  desc: {
    fontSize:11, color:'var(--text-muted)', lineHeight:1.5,
    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
    marginBottom:4,
  },
  footer: {
    padding:'8px 14px 12px', display:'flex', alignItems:'center',
    justifyContent:'space-between', borderTop:'1px solid var(--border)', marginTop:4,
  },
  idPill: {
    fontSize:10, color:'var(--text-muted)', fontFamily:'monospace',
    background:'rgba(255,255,255,0.05)', padding:'2px 7px', borderRadius:4,
  },
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(7px)',
    zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
    padding:20, animation:'fadeIn 0.2s ease',
  },
  modal: {
    background:'var(--bg-card)', border:'1px solid var(--border-accent)', borderRadius:20,
    padding:28, maxWidth:620, width:'100%', position:'relative',
    boxShadow:'0 28px 90px rgba(0,0,0,0.65)',
    animation:'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
    maxHeight:'90vh', overflowY:'auto',
  },
  closeBtn: {
    position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.07)',
    border:'1px solid var(--border)', borderRadius:'50%', width:32, height:32,
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'var(--text-secondary)', cursor:'pointer',
  },
  modalTop: { display:'flex', gap:24, marginBottom:20, alignItems:'flex-start' },
  modalCover: {
    width:110, height:150, borderRadius:8, flexShrink:0, position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center',
    overflow:'hidden', boxShadow:'4px 4px 22px rgba(0,0,0,0.55)',
  },
  modalCoverPat: { position:'absolute', inset:0 },
  modalSpine: {
    position:'absolute', left:0, top:0, bottom:0, width:12,
    background:'rgba(0,0,0,0.3)', borderRight:'1px solid rgba(255,255,255,0.1)',
  },
  modalShine: {
    position:'absolute', top:0, left:12, right:0, height:'45%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)',
  },
  modalLetter: {
    fontFamily:"'Playfair Display',serif", fontSize:56, fontWeight:900,
    color:'rgba(0,0,0,0.35)', position:'relative', zIndex:1, userSelect:'none',
  },
  modalTitle: {
    fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900,
    color:'var(--text-primary)', lineHeight:1.3, marginBottom:6,
  },
  modalAuthor: { fontSize:13, color:'var(--text-secondary)', marginBottom:10, fontStyle:'italic' },
  metaRow: { display:'flex', alignItems:'center', gap:6, marginBottom:4 },
  metaTxt: { color:'var(--text-muted)', fontSize:12 },
  statsRow: {
    display:'flex', gap:20, marginTop:18, padding:'14px 0',
    borderTop:'1px solid var(--border)',
  },
  stat: { textAlign:'center' },
  statVal: { fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, lineHeight:1 },
  statLbl: { fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginTop:4 },
  descBox: {
    background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)',
    borderRadius:10, padding:'14px 16px',
  },
};

const CSS = `
.book-ecom-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--border-accent);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2);
}
.book-ecom-card:hover .cover-hover-overlay {
  opacity: 1 !important;
}
@keyframes modalIn {
  from { opacity:0; transform:scale(0.85) translateY(24px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; }
  to   { opacity:1; }
}
`;
