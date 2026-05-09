import React, { useState, useEffect, useCallback } from 'react';
import { X, Hash, Copy, Info, BookOpen, Clock, Eye, BookUp,
         Users, RefreshCw, CheckCircle, AlertCircle, Calendar, AlertTriangle } from 'lucide-react';
import { getMembers, getMemberBorrows, returnBook } from '../utils/api';

/* ── helpers ── */
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
function hashStr(str) { let h=0; for(const c of str) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h); }
function coverColor(str)   { return COVER_COLORS[hashStr(str) % COVER_COLORS.length]; }
function coverPattern(str) { return COVER_PATTERNS[hashStr(str) % COVER_PATTERNS.length]; }
function avatarGradient(str){ const [a,b]=AVATAR_GRADIENTS[hashStr(str)%AVATAR_GRADIENTS.length]; return `linear-gradient(135deg,${a},${b})`; }

function dueBadge(days) {
  if (days === null) return null;
  if (days < 0)  return { label:`${Math.abs(days)}d overdue`, color:'var(--red)',   bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)',   icon: AlertTriangle };
  if (days <= 3) return { label:`${days}d left`,              color:'var(--red)',   bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.25)',  icon: AlertTriangle };
  if (days <= 7) return { label:`${days}d left`,              color:'var(--amber)', bg:'rgba(245,158,11,0.1)',   border:'rgba(245,158,11,0.25)', icon: Clock };
  return           { label:`${days}d left`,                   color:'var(--emerald)',bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)',icon: Clock };
}

/* ── Book detail modal ── */
function BookModal({ book, member, onClose, onReturn, isAdmin }) {
  const [imgErr, setImgErr] = useState(false);
  if (!book) return null;
  const bg  = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);
  const due = dueBadge(book.daysRemaining ?? null);
  const DueIcon = due?.icon || Clock;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}><X size={18}/></button>
        <div style={S.modalTop}>
          <div style={{ ...S.modalCover, background: bg }}>
            {book.coverImage && !imgErr ? (
              <img src={book.coverImage} alt={book.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, borderRadius:8 }}
                onError={() => setImgErr(true)}/>
            ) : (
              <>
                <div style={{ position:'absolute', inset:0, backgroundImage:pat }}/>
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:12, background:'rgba(0,0,0,0.3)' }}/>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:52, fontWeight:900, color:'rgba(0,0,0,0.35)', position:'relative', zIndex:1 }}>
                  {book.title[0].toUpperCase()}
                </span>
              </>
            )}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`}>{book.genre}</span>
              <span className="badge badge-amber">On Loan</span>
            </div>
            <h2 style={S.modalTitle}>{book.title}</h2>
            <p style={S.modalAuthor}>by {book.author}</p>
            {book.isbn && <div style={S.metaRow}><Hash size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ISBN: {book.isbn}</span></div>}
            <div style={S.metaRow}><Copy size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>ID: {book.bookId}</span></div>
            {book.borrowedAt && (
              <div style={S.metaRow}><Calendar size={12} style={{color:'var(--text-muted)'}}/><span style={S.metaTxt}>Borrowed: {new Date(book.borrowedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span></div>
            )}
            {due && (
              <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:12, background:due.bg, border:`1px solid ${due.border}`, borderRadius:8, padding:'9px 12px' }}>
                <DueIcon size={13} style={{ color:due.color, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:due.color, fontWeight:700 }}>{due.label}</span>
                {book.dueDate && <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:'auto' }}>Due: {new Date(book.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              </div>
            )}
            {isAdmin && member && (
              <div style={{ marginTop:10, background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:8, padding:'9px 12px' }}>
                <div style={{ fontSize:10, color:'var(--violet-light)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 }}>Borrowed by</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{member.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{member.memberId}</div>
              </div>
            )}
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
        {isAdmin && onReturn && (
          <button className="btn btn-sm" onClick={onReturn}
            style={{ marginTop:16, width:'100%', justifyContent:'center', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--emerald)', padding:'10px 0', fontSize:13 }}>
            <BookUp size={14}/> Process Return
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Book card (shared by admin + student) ── */
function BookCard({ book, member, onClick, onReturn, isAdmin }) {
  const [imgErr, setImgErr] = useState(false);
  const bg  = coverColor(book.bookId || book.title);
  const pat = coverPattern(book.bookId || book.title);
  const due = dueBadge(book.daysRemaining ?? null);
  const DueIcon = due?.icon || Clock;

  return (
    <div style={S.card} className="book-ecom-card" onClick={onClick}>
      {/* Cover */}
      <div style={{ ...S.cover, background: bg }}>
        {book.coverImage && !imgErr ? (
          <img src={book.coverImage} alt={book.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', position:'absolute', inset:0 }}
            onError={() => setImgErr(true)}/>
        ) : (
          <>
            <div style={{ ...S.coverPat, backgroundImage:pat }}/>
            <div style={S.spine}/>
            <span style={S.letter}>{book.title[0].toUpperCase()}</span>
            <div style={S.shine}/>
          </>
        )}
        {/* On Loan badge */}
        <div style={S.loanBadge}><Clock size={9}/> On Loan</div>
        {/* Due badge on cover */}
        {due && (
          <div style={{ position:'absolute', top:8, right:8, background:due.bg, border:`1px solid ${due.border}`, color:due.color, fontSize:9, fontWeight:800, padding:'3px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:3, zIndex:4 }}>
            <DueIcon size={9}/> {due.label}
          </div>
        )}
        <div className="cover-hover-overlay" style={S.hoverOverlay}>
          <Eye size={16} style={{ marginBottom:4 }}/><span style={{ fontSize:11, fontWeight:700 }}>View Details</span>
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
          <span className={`badge badge-${GENRE_BADGE[book.genre]||'gray'}`} style={{ fontSize:10 }}>{book.genre}</span>
          <span className="badge badge-amber" style={{ fontSize:10 }}>Borrowed</span>
        </div>
        <h3 style={S.title} title={book.title}>{book.title}</h3>
        <p style={S.author}>{book.author}</p>
        {/* Days remaining bar */}
        {due && (
          <div style={{ marginTop:'auto', paddingTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:3 }}>
              <span style={{ color:'var(--text-muted)' }}>Return deadline</span>
              <span style={{ color:due.color, fontWeight:700 }}>{due.label}</span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:3,
                background: due.color,
                width: book.daysRemaining !== null
                  ? `${Math.max(0, Math.min(100, (book.daysRemaining / 14) * 100))}%`
                  : '100%',
                transition:'width 0.6s ease',
              }}/>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={S.footer} onClick={e => e.stopPropagation()}>
        <span style={S.idPill}>{book.bookId}</span>
        {isAdmin && onReturn ? (
          <button className="btn btn-sm"
            style={{ padding:'4px 10px', fontSize:10, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--emerald)' }}
            onClick={e => { e.stopPropagation(); onReturn(book, member); }}>
            <BookUp size={11}/> Return
          </button>
        ) : (
          <span style={{ fontSize:10, color:'var(--amber)', display:'flex', alignItems:'center', gap:3 }}>
            <Info size={10}/> Details
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADMIN VIEW
───────────────────────────────────────────── */
function AdminMemberBooks() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [alert, setAlert]     = useState(null);
  const [returning, setReturning] = useState({});
  const [selected, setSelected]   = useState(null); // { book, member }

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const mRes = await getMembers();
      const results = await Promise.all(
        mRes.data.map(m => getMemberBorrows(m.memberId).then(r => r.data).catch(() => ({ member:m, borrowedBooks:[], count:0 })))
      );
      setRows(results.filter(r => r.count > 0));
    } catch(_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReturn = async (book, member) => {
    const key = `${book.bookId}_${member.memberId}`;
    setReturning(s => ({ ...s, [key]:true }));
    try {
      const res = await returnBook({ bookId: book.bookId, memberId: member.memberId });
      showAlert('success', res.data.message);
      load();
    } catch(err) { showAlert('error', err.message); }
    setReturning(s => ({ ...s, [key]:false }));
  };

  const filtered = search.trim()
    ? rows.filter(r =>
        r.member.name.toLowerCase().includes(search.toLowerCase()) ||
        r.member.memberId.toLowerCase().includes(search.toLowerCase()) ||
        r.borrowedBooks.some(b => b.title.toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  const totalLoans = rows.reduce((s, r) => s + r.count, 0);
  const overdueCount = rows.reduce((s, r) => s + r.borrowedBooks.filter(b => b.daysRemaining !== null && b.daysRemaining < 0).length, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Member Books</h1>
          <p>All members with currently borrowed books</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={13}/> Refresh</button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:16 }}>
          {alert.type==='success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          <div>{alert.msg}</div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <div className="stat-card amber">
          <div className="stat-icon"><Users size={24} color="var(--amber)"/></div>
          <div className="stat-value">{rows.length}</div>
          <div className="stat-label">Members with Loans</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon"><BookOpen size={24} color="var(--violet-light)"/></div>
          <div className="stat-value">{totalLoans}</div>
          <div className="stat-label">Total On Loan</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><AlertTriangle size={24} color="var(--red)"/></div>
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:20 }}>
        <Users size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:1 }}/>
        <input className="form-input" style={{ paddingLeft:38 }} value={search}
          onChange={e => setSearch(e.target.value)} placeholder="Search by member name, ID, or book title…"/>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
          <h3>{search ? 'No matches' : 'No books on loan'}</h3>
          <p>{search ? 'Try a different search.' : 'All books are available.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {filtered.map(({ member, borrowedBooks, count }) => (
            <div key={member.memberId} className="card" style={{ padding:0, overflow:'hidden' }}>
              {/* Member header */}
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'linear-gradient(135deg,rgba(245,158,11,0.05),rgba(139,92,246,0.05))', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', flexShrink:0, background:avatarGradient(member.memberId||member.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', fontFamily:"'Playfair Display',serif" }}>
                  {member.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>{member.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span className="badge badge-violet" style={{ fontSize:10 }}>{member.memberId}</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{member.email}</span>
                  </div>
                </div>
                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:'var(--amber)', lineHeight:1 }}>{count}</div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)' }}>On Loan</div>
                </div>
              </div>
              {/* Books grid */}
              <div style={{ padding:'16px 20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                  {borrowedBooks.map(book => (
                    <BookCard key={book._id} book={book} member={member} isAdmin
                      onClick={() => setSelected({ book, member })}
                      onReturn={handleReturn}/>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookModal
        book={selected?.book} member={selected?.member} isAdmin
        onClose={() => setSelected(null)}
        onReturn={selected ? () => { handleReturn(selected.book, selected.member); setSelected(null); } : null}/>
      <style>{CSS}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STUDENT VIEW
───────────────────────────────────────────── */
function StudentMyBooks({ studentId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getMemberBorrows(studentId)
      .then(res => setData(res.data))
      .catch(err => setAlert({ type:'error', msg: err.message }))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Books</h1>
          <p>Your currently borrowed books</p>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:16 }}>
          <span>❌</span><div>{alert.msg}</div>
        </div>
      )}
      {loading && <div className="loading-center"><div className="spinner"/></div>}

      {data && !loading && (
        <>
          <div className="member-profile" style={{ marginBottom:24 }}>
            <div className="member-profile-avatar" style={{ background:avatarGradient(data.member.memberId||data.member.name) }}>
              {data.member.name[0].toUpperCase()}
            </div>
            <div className="member-profile-info">
              <h3>{data.member.name}</h3>
              <p><span className="badge badge-violet" style={{ marginRight:8 }}>{data.member.memberId}</span>{data.member.email}</p>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:'var(--amber)' }}>{data.count}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>On Loan</div>
            </div>
          </div>

          {data.borrowedBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>No books on loan</h3>
              <p>You have no books currently borrowed.</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <BookOpen size={14} style={{ color:'var(--amber)' }}/>
                <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>
                  {data.count} book{data.count!==1?'s':''} currently borrowed
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:20 }}>
                {data.borrowedBooks.map(b => (
                  <BookCard key={b._id} book={b} isAdmin={false}
                    onClick={() => setSelected(b)}/>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <BookModal book={selected} isAdmin={false} onClose={() => setSelected(null)}/>
      <style>{CSS}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────── */
export default function MyBooksPage({ studentId = null }) {
  if (studentId) return <StudentMyBooks studentId={studentId}/>;
  return <AdminMemberBooks/>;
}

/* ── Styles ── */
const S = {
  card: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer', transition:'transform 0.22s ease,border-color 0.22s ease,box-shadow 0.22s ease', position:'relative' },
  cover: { height:180, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 },
  coverPat: { position:'absolute', inset:0 },
  spine: { position:'absolute', left:0, top:0, bottom:0, width:10, background:'rgba(0,0,0,0.28)', borderRight:'1px solid rgba(255,255,255,0.08)' },
  shine: { position:'absolute', top:0, left:10, right:0, height:'38%', background:'linear-gradient(180deg,rgba(255,255,255,0.13) 0%,transparent 100%)', pointerEvents:'none' },
  letter: { fontFamily:"'Playfair Display',serif", fontSize:58, fontWeight:900, color:'rgba(0,0,0,0.32)', position:'relative', zIndex:1, userSelect:'none' },
  loanBadge: { position:'absolute', bottom:10, left:10, background:'rgba(245,158,11,0.9)', color:'#000', fontSize:9, fontWeight:800, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:3, letterSpacing:'0.5px', zIndex:3 },
  hoverOverlay: { position:'absolute', inset:0, background:'rgba(0,0,0,0.68)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', opacity:0, transition:'opacity 0.25s ease', zIndex:2 },
  body: { padding:'14px 14px 8px', flex:1, display:'flex', flexDirection:'column' },
  title: { fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:'var(--text-primary)', lineHeight:1.35, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  author: { fontSize:11.5, color:'var(--text-secondary)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  footer: { padding:'8px 14px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid var(--border)', marginTop:4 },
  idPill: { fontSize:10, color:'var(--text-muted)', fontFamily:'monospace', background:'rgba(255,255,255,0.05)', padding:'2px 7px', borderRadius:4 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(7px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn 0.2s ease' },
  modal: { background:'var(--bg-card)', border:'1px solid var(--border-accent)', borderRadius:20, padding:28, maxWidth:580, width:'100%', position:'relative', boxShadow:'0 28px 90px rgba(0,0,0,0.65)', animation:'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)', maxHeight:'90vh', overflowY:'auto' },
  closeBtn: { position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.07)', border:'1px solid var(--border)', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', cursor:'pointer' },
  modalTop: { display:'flex', gap:24, marginBottom:20, alignItems:'flex-start' },
  modalCover: { width:110, height:150, borderRadius:8, flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', boxShadow:'4px 4px 22px rgba(0,0,0,0.55)' },
  modalTitle: { fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'var(--text-primary)', lineHeight:1.3, marginBottom:6 },
  modalAuthor: { fontSize:13, color:'var(--text-secondary)', marginBottom:8, fontStyle:'italic' },
  metaRow: { display:'flex', alignItems:'center', gap:6, marginBottom:4 },
  metaTxt: { color:'var(--text-muted)', fontSize:12 },
  descBox: { background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', marginTop:16 },
};

const CSS = `
.book-ecom-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--border-accent);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2);
}
.book-ecom-card:hover .cover-hover-overlay { opacity: 1 !important; }
@keyframes modalIn { from{opacity:0;transform:scale(0.85) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
`;
