import React, { useState } from 'react';
import { BookMarked, Search, AlertCircle, User } from 'lucide-react';
import { getMemberBorrows } from '../utils/api';

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f87171,#dc2626)',
  'linear-gradient(135deg,#60a5fa,#2563eb)',
  'linear-gradient(135deg,#fbbf24,#b45309)',
  'linear-gradient(135deg,#c084fc,#7c3aed)',
  'linear-gradient(135deg,#6ee7b7,#047857)',
];

const GENRE_STYLES = {
  'Programming':           { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  'Computer Science':      { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  'Software Architecture': { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  'Software Engineering':  { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Mathematics':           { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  'Science':               { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  'Fiction':               { bg: 'rgba(167,139,250,0.15)', color: '#c084fc' },
  'Non-Fiction':           { bg: 'rgba(52,211,153,0.12)',  color: '#6ee7b7' },
  'General':               { bg: 'rgba(255,255,255,0.07)', color: '#8a7f78' },
};

const AVATAR_COLORS = [
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f87171,#dc2626)',
  'linear-gradient(135deg,#60a5fa,#2563eb)',
];

function getBookGradient(title) {
  return COVER_GRADIENTS[title.charCodeAt(0) % COVER_GRADIENTS.length];
}

function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function GenrePill({ genre }) {
  const s = GENRE_STYLES[genre] || GENRE_STYLES['General'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      fontSize: '0.65rem', fontWeight: 700,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}33`,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {genre || 'General'}
    </span>
  );
}

// My Books illustration
function MyBooksIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person reading */}
      <circle cx="80" cy="30" r="20" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5"/>
      <circle cx="80" cy="24" r="10" fill="rgba(245,158,11,0.35)"/>
      <path d="M58 60c0-12 10-20 22-20s22 8 22 20" stroke="rgba(245,158,11,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Open book */}
      <rect x="50" y="72" width="30" height="22" rx="3" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.4)" strokeWidth="1"/>
      <rect x="80" y="72" width="30" height="22" rx="3" fill="rgba(167,139,250,0.2)" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
      <line x1="80" y1="72" x2="80" y2="94" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="55" y1="80" x2="76" y2="80" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="55" y1="86" x2="74" y2="86" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="84" y1="80" x2="105" y2="80" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="84" y1="86" x2="102" y2="86" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeLinecap="round"/>
      {/* Bookmark */}
      <path d="M120 10 L120 40 L113 34 L106 40 L106 10 Z" fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"/>
      {/* Stars */}
      <circle cx="25" cy="25" r="3" fill="rgba(245,158,11,0.3)"/>
      <circle cx="140" cy="60" r="4" fill="rgba(167,139,250,0.3)"/>
      <circle cx="15" cy="90" r="2.5" fill="rgba(52,211,153,0.3)"/>
    </svg>
  );
}

// Empty state illustration
function EmptyBooksIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.2 }}>
      <rect x="15" y="20" width="70" height="50" rx="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="15" y="40" width="70" height="2" fill="currentColor" opacity="0.5"/>
      <path d="M30 30 L70 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 52 L60 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 60 L55 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="75" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="75" y1="15" x2="75" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="70" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function MyBooksPage() {
  const [memberId, setMemberId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(''); setData(null);
    if (!memberId.trim()) { setError('Member ID is required.'); return; }
    setLoading(true);
    try {
      const res = await getMemberBorrows(memberId.trim());
      setData(res.data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>My Books</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            View all books currently on loan for a member
          </p>
        </div>
        <div style={{ opacity: 0.8 }}><MyBooksIllustration /></div>
      </div>

      {/* Lookup card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookMarked size={14} color="var(--accent)" />
            </span>
            Look Up Member
          </span>
        </div>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>
                <User size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Member ID
              </label>
              <input
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. M001"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginBottom: 1 }}>
              {loading
                ? <span className="spinner" style={{ width: 14, height: 14 }} />
                : <Search size={14} />}
              Look Up
            </button>
          </div>
        </form>
        {error && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <div className="card" style={{ animation: 'fadeUp 0.4s ease both' }}>
          {/* Member profile header */}
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="member-avatar" style={{
                background: getAvatarColor(data.member.name),
                width: 48, height: 48, fontSize: '1.1rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}>
                {data.member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                  {data.member.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{data.member.memberId}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{data.member.email}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
                {data.count} book{data.count !== 1 ? 's' : ''} on loan
              </span>
            </div>
          </div>

          {data.borrowedBooks.length === 0 ? (
            <div className="empty">
              <EmptyBooksIllustration />
              <p>This member has no books on loan.</p>
            </div>
          ) : (
            <div className="book-grid">
              {data.borrowedBooks.map((b, i) => (
                <div key={b._id} className="book-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  {/* Generated book cover */}
                  <div className="book-cover" style={{ background: getBookGradient(b.title) }}>
                    {b.title.charAt(0)}
                  </div>
                  <GenrePill genre={b.genre} />
                  <div className="book-card-title" style={{ marginTop: 8 }}>{b.title}</div>
                  <div className="book-card-author">by {b.author}</div>
                  <div className="book-card-footer">
                    <span className="badge badge-gray">{b.bookId}</span>
                    <span className="badge badge-gold" style={{ animation: 'pulse-glow 2.5s ease infinite' }}>
                      On Loan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
