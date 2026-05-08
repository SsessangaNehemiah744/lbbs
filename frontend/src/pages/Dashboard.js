import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, Clock, BookDown, BookUp, BookMarked } from 'lucide-react';
import { getBooks, getMembers } from '../utils/api';

const COVER_COLORS = ['#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6','#fbbf24','#a78bfa','#34d399','#f87171','#60a5fa'];
function coverColor(str) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COVER_COLORS[Math.abs(h) % COVER_COLORS.length];
}

function countUp(el, target, duration = 800) {
  if (!el) return;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(p * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function Dashboard() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, mRes] = await Promise.all([getBooks(), getMembers()]);
        const books = bRes.data, members = mRes.data;
        const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
        const avail = books.reduce((s, b) => s + b.availableCopies, 0);
        const onLoan = totalCopies - avail;

        countUp(document.getElementById('stat-books'),     books.length);
        countUp(document.getElementById('stat-members'),   members.length);
        countUp(document.getElementById('stat-available'), avail);
        countUp(document.getElementById('stat-loans'),     onLoan);
        countUp(document.getElementById('hero-books'),     books.length);
        countUp(document.getElementById('hero-members'),   members.length);
        countUp(document.getElementById('hero-loans'),     onLoan);

        setRecentBooks([...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner"/>
      <span>Loading dashboard…</span>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="hero-card">
        <div className="hero-content">
          <h1>Makerere University<br/>Library System</h1>
          <p>Digitizing library operations — books, members, and circulation — for a smarter academic experience.</p>
          <div className="hero-actions">
            <Link to="/borrow"><button className="btn btn-primary"><BookDown size={15}/> Borrow Book</button></Link>
            <Link to="/catalog"><button className="btn btn-outline"><BookOpen size={15}/> Add to Catalog</button></Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value" id="hero-books">0</div>
              <div className="hero-stat-label">Books</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" id="hero-members">0</div>
              <div className="hero-stat-label">Members</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" id="hero-loans">0</div>
              <div className="hero-stat-label">On Loan</div>
            </div>
          </div>
        </div>
        {/* Books pile image */}
        <div className="hero-illustration">
          <img
            src="/books-pile.png"
            alt="Books"
            style={{
              width: 220,
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
            }}
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card amber">
          <div className="stat-icon"><BookOpen size={28} color="var(--amber)"/></div>
          <div className="stat-value" id="stat-books">0</div>
          <div className="stat-label">Books in Catalog</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon"><Users size={28} color="var(--violet-light)"/></div>
          <div className="stat-value" id="stat-members">0</div>
          <div className="stat-label">Registered Members</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon"><CheckCircle size={28} color="var(--emerald)"/></div>
          <div className="stat-value" id="stat-available">0</div>
          <div className="stat-label">Available Copies</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><Clock size={28} color="var(--red)"/></div>
          <div className="stat-value" id="stat-loans">0</div>
          <div className="stat-label">Copies On Loan</div>
        </div>
      </div>

      {/* Quick Actions + Recent Books */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Actions</div>
              <div className="card-subtitle">Common library operations</div>
            </div>
          </div>
          <div className="quick-action-grid">
            <Link to="/borrow" className="quick-action">
              <div className="quick-action-icon" style={{background:'rgba(245,158,11,0.12)'}}>
                <BookDown size={22} color="var(--amber)"/>
              </div>
              <div className="quick-action-text"><h4>Borrow Book</h4><p>Issue to a member</p></div>
            </Link>
            <Link to="/return" className="quick-action">
              <div className="quick-action-icon" style={{background:'rgba(16,185,129,0.12)'}}>
                <BookUp size={22} color="var(--emerald)"/>
              </div>
              <div className="quick-action-text"><h4>Return Book</h4><p>Process a return</p></div>
            </Link>
            <Link to="/catalog" className="quick-action">
              <div className="quick-action-icon" style={{background:'rgba(139,92,246,0.12)'}}>
                <BookOpen size={22} color="var(--violet-light)"/>
              </div>
              <div className="quick-action-text"><h4>Book Catalog</h4><p>Add or view books</p></div>
            </Link>
            <Link to="/members" className="quick-action">
              <div className="quick-action-icon" style={{background:'rgba(59,130,246,0.12)'}}>
                <Users size={22} color="#60a5fa"/>
              </div>
              <div className="quick-action-text"><h4>Members</h4><p>Register or manage</p></div>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Books</div>
              <div className="card-subtitle">Last 5 added to catalog</div>
            </div>
          </div>
          {recentBooks.length === 0 ? (
            <div className="empty-state" style={{padding:'20px'}}>
              <BookMarked size={32} style={{margin:'0 auto 10px',display:'block',opacity:0.3}}/>
              <p>No books in catalog yet.</p>
            </div>
          ) : (
            recentBooks.map(b => {
              const pct = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
              const barColor = pct > 50 ? 'var(--emerald)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
              return (
                <div key={b._id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                  <div className="book-cover" style={{background:coverColor(b.bookId||b.title)}}>
                    {b.title[0].toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</div>
                    <div style={{fontSize:11,color:'var(--text-secondary)'}}>{b.author}</div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{width:`${pct}%`,background:barColor}}/>
                    </div>
                    <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{b.availableCopies}/{b.totalCopies} copies</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
