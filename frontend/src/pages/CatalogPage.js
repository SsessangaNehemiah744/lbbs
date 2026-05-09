import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Search, RefreshCw, X, Hash, Copy, Info, ChevronUp, Eye, BookDown, CheckCircle } from 'lucide-react';
import { getBooks, addBook, deleteBook, submitBorrowRequest } from '../utils/api';
import { getSession } from '../utils/auth';

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
const GENRES = ['General','Programming','Computer Science','Software Architecture',
  'Software Engineering','Mathematics','Science','Fiction','Non-Fiction',
  'Engineering','Medicine','Law','Business','Literature','History','Arts','Other'];
const initForm = { bookId:'', title:'', author:'', totalCopies:'1', genre:'General', isbn:'', description:'' };

function hashStr(str) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(h);
}
function coverColor(str) { return COVER_COLORS[hashStr(str) % COVER_COLORS.length]; }
function coverPattern(str) { return COVER_PATTERNS[hashStr(str) % COVER_PATTERNS.length]; }

/* ── Book Detail Modal ── */
function BookModal({ book, onClose }) {
  const [imgError, setImgError] = useState(false);
  if (!book) return null;
  const pct = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;
  const barColor = pct > 50 ? 'var(--emerald)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
  const statusLabel = book.availableCopies === 0 ? 'Unavailable' : book.availableCopies <= 1 ? 'Low Stock' : 'Available';
  const statusClass = book.availableCopies === 0 ? 'badge-red' : book.availableCopies <= 1 ? 'badge-amber' : 'badge-emerald';
  const bg = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);
  const showImg = book.coverImage && !imgError;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}><X size={18}/></button>
        <div style={S.modalTop}>
          {/* Large cover */}
          <div style={{ ...S.modalCover, background: bg }}>
            {showImg ? (
              <img
                src={book.coverImage}
                alt={book.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:8, position:'absolute', inset:0 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <>
                <div style={{ ...S.modalCoverPat, backgroundImage: pat }}/>
                <div style={S.modalSpine}/>
                <span style={S.modalLetter}>{book.title[0].toUpperCase()}</span>
                <div style={S.modalShine}/>
              </>
            )}
          </div>
          {/* Info */}
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
function BookCard({ book, onDelete, onClick, readOnly = false, onBorrow, borrowState = {} }) {
  const pct = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;
  const barColor = pct > 50 ? 'var(--emerald)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
  const statusLabel = book.availableCopies === 0 ? 'Unavailable' : book.availableCopies <= 1 ? 'Low Stock' : 'Available';
  const statusClass = book.availableCopies === 0 ? 'badge-red' : book.availableCopies <= 1 ? 'badge-amber' : 'badge-emerald';
  const bg = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);
  const [imgError, setImgError] = useState(false);

  const bState = borrowState[book.bookId] || 'idle';
  const unavailable = book.availableCopies === 0;
  const showImg = book.coverImage && !imgError;

  return (
    <div style={S.card} className="book-ecom-card" onClick={onClick}>
      {/* ── Cover ── */}
      <div style={{ ...S.cover, background: bg }}>
        {showImg ? (
          <img
            src={book.coverImage}
            alt={book.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', position:'absolute', inset:0 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <>
            <div style={{ ...S.coverPat, backgroundImage: pat }}/>
            <div style={S.spine}/>
            <span style={S.letter}>{book.title[0].toUpperCase()}</span>
            <div style={S.shine}/>
          </>
        )}
        {book.availableCopies === 0 && <div style={S.ribbon}>OUT OF STOCK</div>}
        <div className="cover-hover-overlay" style={S.hoverOverlay}>
          <Eye size={16} style={{ marginBottom:4 }}/>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.5px' }}>View Details</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={S.body}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`} style={{ fontSize:10 }}>{book.genre}</span>
          <span className={`badge ${statusClass}`} style={{ fontSize:10 }}>{statusLabel}</span>
        </div>
        <h3 style={S.title} title={book.title}>{book.title}</h3>
        <p style={S.author}>{book.author}</p>
        {book.isbn && <p style={S.isbn}>ISBN: {book.isbn}</p>}
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

      {/* ── Footer ── */}
      <div style={S.footer} onClick={e => e.stopPropagation()}>
        <span style={S.idPill}>{book.bookId}</span>
        {/* Admin: delete button */}
        {!readOnly && (
          <button className="btn btn-danger btn-sm" style={{ padding:'4px 10px' }}
            onClick={e => { e.stopPropagation(); onDelete(book.bookId, book.title); }}>
            <Trash2 size={12}/>
          </button>
        )}
        {/* Student: borrow button */}
        {readOnly && onBorrow && (
          bState === 'approved' ? (
            <span style={{ fontSize:10, color:'var(--emerald)', display:'flex', alignItems:'center', gap:3, fontWeight:700 }}>
              <CheckCircle size={11}/> Approved
            </span>
          ) : bState === 'pending' ? (
            <span style={{ fontSize:10, color:'#60a5fa', display:'flex', alignItems:'center', gap:3, fontWeight:700 }}>
              <BookDown size={11}/> Pending…
            </span>
          ) : bState === 'rejected' ? (
            <button
              className="btn btn-sm"
              style={{ padding:'4px 12px', fontSize:10, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'var(--red)' }}
              onClick={e => { e.stopPropagation(); onBorrow(book); }}>
              <BookDown size={11}/> Retry
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              style={{ padding:'4px 12px', fontSize:10, opacity: (unavailable || bState === 'loading') ? 0.5 : 1 }}
              disabled={unavailable || bState === 'loading'}
              onClick={e => { e.stopPropagation(); onBorrow(book); }}>
              {bState === 'loading' ? '…' : <><BookDown size={11}/> Borrow</>}
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function CatalogPage({ readOnly = false }) {
  const [session] = useState(() => getSession()); // stable reference — only read once
  const [books, setBooks]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]       = useState(null);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [borrowState, setBorrowState] = useState({});

  const memberId = session?.memberId || null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getBooks();
      setBooks(r.data);
      setFiltered(r.data);
      // Restore borrow states from existing requests for this student
      if (readOnly && memberId) {
        const raw = localStorage.getItem('lbbs_borrow_requests');
        if (raw) {
          const reqs = JSON.parse(raw);
          const states = {};
          reqs.forEach(req => {
            if (req.memberId === memberId) {
              if (req.status === 'pending')  states[req.bookId] = 'pending';
              if (req.status === 'approved') states[req.bookId] = 'approved';
              if (req.status === 'rejected') states[req.bookId] = 'rejected';
            }
          });
          setBorrowState(states);
        }
      }
    } catch(_) {}
    setLoading(false);
  }, [readOnly, memberId]); // memberId is a primitive string — safe dependency

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(books); return; }
    const q = search.toLowerCase();
    setFiltered(books.filter(b => [b.bookId,b.title,b.author,b.genre].join(' ').toLowerCase().includes(q)));
  }, [search, books]);

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.bookId || !form.title || !form.author) return showAlert('error','Book ID, Title, and Author are required.');
    setSubmitting(true);
    try {
      await addBook({ ...form, totalCopies: parseInt(form.totalCopies) || 1 });
      showAlert('success', `"${form.title}" added to catalog.`);
      setForm(initForm); load();
    } catch(err) { showAlert('error', err.message); }
    setSubmitting(false);
  };

  const handleDelete = async (bookId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await deleteBook(bookId); showAlert('success', `"${title}" removed.`); load(); }
    catch(err) { showAlert('error', err.message); }
  };

  const handleBorrow = async (book) => {
    if (!memberId) return;
    setBorrowState(s => ({ ...s, [book.bookId]: 'loading' }));
    try {
      await submitBorrowRequest({ bookId: book.bookId, memberId });
      setBorrowState(s => ({ ...s, [book.bookId]: 'pending' }));
      showAlert('success', `Request submitted for "${book.title}". Waiting for librarian approval.`);
    } catch(err) {
      setBorrowState(s => ({ ...s, [book.bookId]: 'idle' }));
      showAlert('error', err.message);
    }
  };

  // Poll every 4 seconds to check if any pending requests were approved/rejected
  useEffect(() => {
    if (!readOnly || !memberId) return;
    const interval = setInterval(() => {
      const raw = localStorage.getItem('lbbs_borrow_requests');
      if (!raw) return;
      const reqs = JSON.parse(raw);
      setBorrowState(prev => {
        const next = { ...prev };
        reqs.forEach(r => {
          if (r.memberId === memberId) {
            if (r.status === 'approved') next[r.bookId] = 'approved';
            if (r.status === 'rejected') next[r.bookId] = 'rejected';
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [readOnly, memberId]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Book Catalog</h1>
          <p>{readOnly ? 'Browse the library collection' : 'Browse and manage the entire library collection'}</p>
        </div>
        {!readOnly && (
        <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
          {showForm ? <ChevronUp size={15}/> : <Plus size={15}/>}
          {showForm ? 'Hide Form' : 'Add New Book'}
        </button>
        )}
      </div>

      {/* Collapsible add form */}
      {showForm && !readOnly && (
        <div className="card" style={{ marginBottom:24, animation:'fadeIn 0.25s ease' }}>
          <div className="card-header">
            <div className="card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <BookOpen size={16}/> Add New Book
            </div>
          </div>
          {alert && (
            <div className={`alert alert-${alert.type}`}>
              <span>{alert.type === 'success' ? <RefreshCw size={14}/> : <X size={14}/>}</span>
              <div>{alert.msg}</div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2" style={{ marginBottom:16 }}>
              <div className="form-group">
                <label className="form-label">Book ID</label>
                <input className="form-input" value={form.bookId} onChange={e => setForm(f => ({ ...f, bookId:e.target.value }))} placeholder="e.g. B001"/>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="Book title"/>
              </div>
              <div className="form-group">
                <label className="form-label">Author</label>
                <input className="form-input" value={form.author} onChange={e => setForm(f => ({ ...f, author:e.target.value }))} placeholder="Author name"/>
              </div>
              <div className="form-group">
                <label className="form-label">Total Copies</label>
                <input className="form-input" type="number" min="1" value={form.totalCopies} onChange={e => setForm(f => ({ ...f, totalCopies:e.target.value }))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Genre</label>
                <select className="form-select" value={form.genre} onChange={e => setForm(f => ({ ...f, genre:e.target.value }))}>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input className="form-input" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn:e.target.value }))} placeholder="978-..."/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Brief description..."/>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              <Plus size={15}/> {submitting ? 'Adding…' : 'Add Book to Catalog'}
            </button>
          </form>
        </div>
      )}

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:16 }}><div>{alert.msg}</div></div>
      )}

      {/* Search + count */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:1 }}/>
          <input className="form-input" style={{ paddingLeft:38 }} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, genre, or ID..."/>
        </div>
        <span className="badge badge-amber" style={{ whiteSpace:'nowrap' }}>{filtered.length} books</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
          <h3>No books found</h3>
          <p>{search ? 'Try a different search.' : 'Add your first book above.'}</p>
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(b => (
            <BookCard key={b._id} book={b} onDelete={handleDelete} onClick={() => setSelected(b)}
              readOnly={readOnly} onBorrow={readOnly ? handleBorrow : undefined} borrowState={borrowState}/>
          ))}
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
    fontSize:11.5, color:'var(--text-secondary)', marginBottom:4,
    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
  },
  isbn: { fontSize:10, color:'var(--text-muted)', marginBottom:2 },
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
