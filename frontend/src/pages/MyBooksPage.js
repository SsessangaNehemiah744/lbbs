import React, { useState } from 'react';
import { X, Hash, Copy, Info, BookOpen, Clock, Eye } from 'lucide-react';
import { getMemberBorrows } from '../utils/api';

const COVER_COLORS = ['#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6','#fbbf24','#a78bfa','#34d399','#f87171','#60a5fa'];
const COVER_PATTERNS = [
  'repeating-linear-gradient(45deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 2px,transparent 2px,transparent 8px)',
  'repeating-linear-gradient(-45deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 2px,transparent 2px,transparent 8px)',
  'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.15) 0%,transparent 50%)',
  'repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 6px)',
];
const AVATAR_GRADIENTS = [
  ['#f59e0b','#d97706'],['#8b5cf6','#6d28d9'],['#10b981','#059669'],
  ['#ef4444','#dc2626'],['#3b82f6','#2563eb'],['#fbbf24','#f59e0b'],
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
function avatarGradient(str) {
  const [a, b] = AVATAR_GRADIENTS[hashStr(str) % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg,${a},${b})`;
}

/* ── Detail Modal ── */
function BookModal({ book, onClose }) {
  if (!book) return null;
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
              <span className="badge badge-amber">On Loan</span>
            </div>
            <h2 style={S.modalTitle}>{book.title}</h2>
            <p style={S.modalAuthor}>by {book.author}</p>
            {book.isbn && (
              <div style={S.metaRow}><Hash size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ISBN: {book.isbn}</span></div>
            )}
            <div style={S.metaRow}><Copy size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ID: {book.bookId}</span></div>
            <div style={S.loanNotice}>
              <Clock size={14} style={{ color:'var(--amber)', flexShrink:0 }}/>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                Currently checked out — please return when done
              </span>
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
  const bg = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);

  return (
    <div style={S.card} className="book-ecom-card" onClick={onClick}>
      <div style={{ ...S.cover, background: bg }}>
        <div style={{ ...S.coverPat, backgroundImage: pat }}/>
        <div style={S.spine}/>
        <span style={S.letter}>{book.title[0].toUpperCase()}</span>
        <div style={S.shine}/>
        {/* On Loan badge on cover */}
        <div style={S.loanBadge}>
          <Clock size={9}/> On Loan
        </div>
        {/* Hover overlay */}
        <div className="cover-hover-overlay" style={S.hoverOverlay}>
          <Eye size={16} style={{ marginBottom:4 }}/>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.5px' }}>View Details</span>
        </div>
      </div>
      <div style={S.body}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`} style={{ fontSize:10 }}>{book.genre}</span>
          <span className="badge badge-amber" style={{ fontSize:10 }}>Borrowed</span>
        </div>
        <h3 style={S.title} title={book.title}>{book.title}</h3>
        <p style={S.author}>{book.author}</p>
        {book.description && <p style={S.desc}>{book.description}</p>}
      </div>
      <div style={S.footer}>
        <span style={S.idPill}>{book.bookId}</span>
        <span style={{ fontSize:10, color:'var(--amber)', display:'flex', alignItems:'center', gap:3 }}>
          <Info size={10}/> Details
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MyBooksPage() {
  const [memberId, setMemberId] = useState('');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [selected, setSelected] = useState(null);

  const handleLookup = async e => {
    e?.preventDefault();
    if (!memberId.trim()) return;
    setAlert(null); setData(null);
    setLoading(true);
    try {
      const res = await getMemberBorrows(memberId.trim());
      setData(res.data);
    } catch(err) {
      setAlert({ type:'error', msg: err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Books</h1>
          <p>Look up a member's currently borrowed books</p>
        </div>
      </div>

      {/* Lookup form */}
      <div className="card" style={{ marginBottom:24 }}>
        <form onSubmit={handleLookup} style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
          <div className="form-group" style={{ flex:1 }}>
            <label className="form-label">Member ID</label>
            <input className="form-input" value={memberId} onChange={e => setMemberId(e.target.value)}
              placeholder="e.g. M001" onKeyDown={e => e.key === 'Enter' && handleLookup()}/>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '⏳' : '🔎'} Look Up
          </button>
        </form>
        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginTop:12 }}>
            <span>❌</span><div>{alert.msg}</div>
          </div>
        )}
      </div>

      {loading && <div className="loading-center"><div className="spinner"/></div>}

      {data && !loading && (
        <>
          {/* Member profile card */}
          <div className="member-profile" style={{ marginBottom:24 }}>
            <div className="member-profile-avatar"
              style={{ background: avatarGradient(data.member.memberId || data.member.name) }}>
              {data.member.name[0].toUpperCase()}
            </div>
            <div className="member-profile-info">
              <h3>{data.member.name}</h3>
              <p>
                <span className="badge badge-violet" style={{ marginRight:8 }}>{data.member.memberId}</span>
                {data.member.email}
              </p>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:'var(--amber)' }}>
                {data.count}
              </div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>On Loan</div>
            </div>
          </div>

          {/* Borrowed books grid */}
          {data.borrowedBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>No books on loan</h3>
              <p>{data.member.name} has no books currently borrowed.</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <BookOpen size={14} style={{ color:'var(--amber)' }}/>
                <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>
                  {data.count} book{data.count !== 1 ? 's' : ''} currently borrowed
                </span>
              </div>
              <div style={S.grid}>
                {data.borrowedBooks.map(b => (
                  <BookCard key={b._id} book={b} onClick={() => setSelected(b)}/>
                ))}
              </div>
            </>
          )}
        </>
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
  loanBadge: {
    position:'absolute', bottom:10, left:10,
    background:'rgba(245,158,11,0.9)', color:'#000',
    fontSize:9, fontWeight:800, padding:'3px 9px',
    borderRadius:20, display:'flex', alignItems:'center', gap:3,
    letterSpacing:'0.5px', zIndex:3,
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
  },
  footer: {
    padding:'8px 14px 12px', display:'flex', alignItems:'center',
    justifyContent:'space-between', borderTop:'1px solid var(--border)', marginTop:4,
  },
  idPill: {
    fontSize:10, color:'var(--text-muted)', fontFamily:'monospace',
    background:'rgba(255,255,255,0.05)', padding:'2px 7px', borderRadius:4,
  },
  /* Modal */
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
  loanNotice: {
    display:'flex', alignItems:'center', gap:8, marginTop:14,
    background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
    borderRadius:8, padding:'10px 12px',
  },
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
