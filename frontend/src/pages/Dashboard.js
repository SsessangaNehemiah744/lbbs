import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BookDown, BookUp, ChevronRight, TrendingUp, Library } from 'lucide-react';
import { getBooks, getMembers } from '../utils/api';

// Animated counter hook
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Hero illustration — library scene
function HeroIllustration() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bookshelf */}
      <rect x="20" y="30" width="180" height="110" rx="8" fill="#1e1916" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
      {/* Shelf lines */}
      <rect x="20" y="80" width="180" height="3" fill="rgba(245,158,11,0.15)"/>
      <rect x="20" y="130" width="180" height="3" fill="rgba(245,158,11,0.15)"/>
      {/* Top row books */}
      <rect x="32" y="38" width="16" height="38" rx="2" fill="#f59e0b" opacity="0.8"/>
      <rect x="32" y="38" width="4" height="38" rx="1" fill="#d97706"/>
      <rect x="50" y="42" width="12" height="34" rx="2" fill="#a78bfa" opacity="0.7"/>
      <rect x="64" y="36" width="18" height="40" rx="2" fill="#34d399" opacity="0.7"/>
      <rect x="84" y="40" width="14" height="36" rx="2" fill="#f87171" opacity="0.7"/>
      <rect x="100" y="38" width="16" height="38" rx="2" fill="#fbbf24" opacity="0.7"/>
      <rect x="118" y="44" width="12" height="32" rx="2" fill="#60a5fa" opacity="0.6"/>
      <rect x="132" y="38" width="20" height="38" rx="2" fill="#f59e0b" opacity="0.5"/>
      <rect x="154" y="42" width="14" height="34" rx="2" fill="#a78bfa" opacity="0.5"/>
      <rect x="170" y="36" width="16" height="40" rx="2" fill="#34d399" opacity="0.5"/>
      {/* Bottom row books */}
      <rect x="32" y="88" width="20" height="36" rx="2" fill="#a78bfa" opacity="0.6"/>
      <rect x="54" y="90" width="14" height="34" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="70" y="86" width="18" height="38" rx="2" fill="#f87171" opacity="0.5"/>
      <rect x="90" y="90" width="16" height="34" rx="2" fill="#34d399" opacity="0.6"/>
      <rect x="108" y="88" width="12" height="36" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="122" y="92" width="20" height="32" rx="2" fill="#60a5fa" opacity="0.5"/>
      <rect x="144" y="86" width="14" height="38" rx="2" fill="#f59e0b" opacity="0.5"/>
      <rect x="160" y="90" width="16" height="34" rx="2" fill="#a78bfa" opacity="0.4"/>
      {/* Decorative lamp */}
      <ellipse cx="110" cy="18" rx="18" ry="6" fill="rgba(245,158,11,0.15)"/>
      <rect x="108" y="8" width="4" height="12" rx="2" fill="rgba(245,158,11,0.3)"/>
      <ellipse cx="110" cy="8" rx="10" ry="5" fill="rgba(245,158,11,0.4)"/>
    </svg>
  );
}

const STAT_CONFIGS = [
  { key: 'books',    label: 'Total Books',  sub: 'In catalog',    color: 'var(--accent)',   icon: BookOpen },
  { key: 'members',  label: 'Members',      sub: 'Registered',    color: 'var(--violet)',   icon: Users },
  { key: 'available',label: 'Available',    sub: 'Copies free',   color: 'var(--success)',  icon: TrendingUp },
  { key: 'borrowed', label: 'On Loan',      sub: 'Copies out',    color: 'var(--danger)',   icon: Library },
];

function StatCard({ label, value, sub, color, icon: Icon, delay }) {
  const animated = useCountUp(value);
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}s`, '--stat-color': color + '22' }}>
      <div className="stat-icon" style={{ position: 'absolute', top: 18, right: 18, opacity: 0.12 }}>
        <Icon size={40} color={color} />
      </div>
      <div className="label">{label}</div>
      <div className="value" style={{ color }}>{animated}</div>
      <div className="sub">{sub}</div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        opacity: 0.4,
      }} />
    </div>
  );
}

const QUICK_ACTIONS = [
  { to: '/borrow',  label: 'Borrow a Book',    desc: 'Issue a book to a member',    icon: BookDown, color: 'var(--success)',  bg: 'rgba(52,211,153,0.1)' },
  { to: '/return',  label: 'Return a Book',    desc: 'Process a book return',        icon: BookUp,   color: 'var(--accent)',   bg: 'rgba(245,158,11,0.1)' },
  { to: '/catalog', label: 'Add to Catalog',   desc: 'Register new books',           icon: BookOpen, color: 'var(--violet)',   bg: 'rgba(167,139,250,0.1)' },
  { to: '/members', label: 'Register Member',  desc: 'Add a library member',         icon: Users,    color: 'var(--danger)',   bg: 'rgba(248,113,113,0.1)' },
];

// Genre color map
const GENRE_COLORS = {
  'Programming':          { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  'Computer Science':     { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  'Software Architecture':{ bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  'Software Engineering': { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Mathematics':          { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  'General':              { bg: 'rgba(255,255,255,0.08)', color: '#8a7f78' },
};

function getGenreStyle(genre) {
  return GENRE_COLORS[genre] || GENRE_COLORS['General'];
}

function getBookCoverColor(title) {
  const colors = [
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#a78bfa,#7c3aed)',
    'linear-gradient(135deg,#34d399,#059669)',
    'linear-gradient(135deg,#f87171,#dc2626)',
    'linear-gradient(135deg,#60a5fa,#2563eb)',
    'linear-gradient(135deg,#fbbf24,#d97706)',
  ];
  const idx = title.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, members: 0, available: 0, borrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, mRes] = await Promise.all([getBooks(), getMembers()]);
        const books = bRes.data;
        const members = mRes.data;
        const totalCopies = books.reduce((a, b) => a + b.totalCopies, 0);
        const available = books.reduce((a, b) => a + b.availableCopies, 0);
        setStats({ books: books.length, members: members.length, available, borrowed: totalCopies - available });
        setRecentBooks(books.slice(0, 5));
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading dashboard…</span>
    </div>
  );

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Welcome to LBBS</h1>
          <p>Library Book Borrowing System — Makerere University, IST 3205 Group 3. Manage your catalog, members, and borrowing records all in one place.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Link to="/borrow" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-sm">
                <BookDown size={13} /> Borrow Book
              </button>
            </Link>
            <Link to="/catalog" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost btn-sm">
                <BookOpen size={13} /> View Catalog
              </button>
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <HeroIllustration />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CONFIGS.map((s, i) => (
          <StatCard key={s.key} {...s} value={stats[s.key]} delay={i * 0.08} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon, color, bg }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '44'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ background: bg, borderRadius: 10, padding: 10, flexShrink: 0 }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Books */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Books</span>
            <Link to="/catalog" style={{ fontSize: '0.76rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          {recentBooks.length === 0 ? (
            <div className="empty"><BookOpen size={32} /><p>No books in catalog yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentBooks.map((b, i) => {
                const pct = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
                const barColor = pct === 0 ? 'var(--danger)' : pct < 50 ? 'var(--warn)' : 'var(--success)';
                const gs = getGenreStyle(b.genre);
                return (
                  <div key={b._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < recentBooks.length - 1 ? '1px solid var(--border)' : 'none',
                    animation: `staggerFadeUp 0.3s ease ${i * 0.07}s both`,
                  }}>
                    {/* Mini cover */}
                    <div style={{
                      width: 36, height: 44, borderRadius: 4, flexShrink: 0,
                      background: getBookCoverColor(b.title),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                      fontFamily: 'var(--font-display)',
                      boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      {b.title.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 1 }}>{b.author}</div>
                      <div style={{ marginTop: 5, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{b.bookId}</span>
                      <span style={{ fontSize: '0.7rem', color: barColor, fontWeight: 600 }}>{b.availableCopies}/{b.totalCopies}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
