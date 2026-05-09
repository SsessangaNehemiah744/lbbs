import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, BookMarked, Search } from 'lucide-react';
import { getMemberBorrows, getBooks } from '../utils/api';
import { getSession } from '../utils/auth';

const COVER_COLORS = ['#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6','#fbbf24','#a78bfa','#34d399','#f87171','#60a5fa'];
function hashStr(str) { let h=0; for(const c of str) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h); }
function coverColor(str) { return COVER_COLORS[hashStr(str) % COVER_COLORS.length]; }

export default function StudentDashboard() {
  const session = getSession();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [totalBooks, setTotalBooks]       = useState(0);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, allRes] = await Promise.all([
          getMemberBorrows(session.memberId),
          getBooks(),
        ]);
        setBorrowedBooks(bRes.data.borrowedBooks);
        setTotalBooks(allRes.data.length);
      } catch(_) {}
      setLoading(false);
    })();
  }, [session.memberId]);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      {/* Welcome hero */}
      <div className="hero-card" style={{ marginBottom:24 }}>
        <div className="hero-content">
          <h1>Welcome back,<br/>{session.name.split(' ')[0]}!</h1>
          <p>Your personal library portal — browse books, track your loans, and manage your reading.</p>
          <div className="hero-actions">
            <Link to="/catalog"><button className="btn btn-primary"><BookOpen size={15}/> Browse Catalog</button></Link>
            <Link to="/my-books"><button className="btn btn-outline"><BookMarked size={15}/> My Books</button></Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{totalBooks}</div>
              <div className="hero-stat-label">Books Available</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{borrowedBooks.length}</div>
              <div className="hero-stat-label">On Loan</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{session.memberId}</div>
              <div className="hero-stat-label">Student ID</div>
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <img src="/africanwoman.png"lt="Books"
            style={{ width:200, height:'auto', objectFit:'contain', filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}/>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:24 }}>
        <div className="stat-card amber">
          <div className="stat-icon"><BookOpen size={28} color="var(--amber)"/></div>
          <div className="stat-value">{totalBooks}</div>
          <div className="stat-label">Books in Library</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon"><Clock size={28} color="var(--violet-light)"/></div>
          <div className="stat-value">{borrowedBooks.length}</div>
          <div className="stat-label">Currently Borrowed</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon"><CheckCircle size={28} color="var(--emerald)"/></div>
          <div className="stat-value">{3 - borrowedBooks.length < 0 ? 0 : 3 - borrowedBooks.length}</div>
          <div className="stat-label">Borrow Slots Left</div>
        </div>
      </div>

      {/* Quick actions + current loans */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Actions</div>
              <div className="card-subtitle">What would you like to do?</div>
            </div>
          </div>
          <div className="quick-action-grid">
            <Link to="/catalog" className="quick-action">
              <div className="quick-action-icon" style={{ background:'rgba(245,158,11,0.12)' }}>
                <BookOpen size={22} color="var(--amber)"/>
              </div>
              <div className="quick-action-text"><h4>Browse Catalog</h4><p>Explore all books</p></div>
            </Link>
            <Link to="/my-books" className="quick-action">
              <div className="quick-action-icon" style={{ background:'rgba(139,92,246,0.12)' }}>
                <BookMarked size={22} color="var(--violet-light)"/>
              </div>
              <div className="quick-action-text"><h4>My Books</h4><p>View your loans</p></div>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Currently Borrowed</div>
              <div className="card-subtitle">Books you have on loan</div>
            </div>
          </div>
          {borrowedBooks.length === 0 ? (
            <div className="empty-state" style={{ padding:'20px' }}>
              <BookMarked size={32} style={{ margin:'0 auto 10px', display:'block', opacity:0.3 }}/>
              <p>You have no books on loan.</p>
            </div>
          ) : (
            borrowedBooks.map(b => (
              <div key={b._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div className="book-cover" style={{ background:coverColor(b.bookId||b.title) }}>
                  {b.title[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{b.author}</div>
                  <span className="badge badge-amber" style={{ fontSize:9, marginTop:4 }}>On Loan</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
