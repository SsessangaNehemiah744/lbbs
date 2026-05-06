import React, { useState } from 'react';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import { getBooks } from '../utils/api';

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

function getBookGradient(title) {
  return COVER_GRADIENTS[title.charCodeAt(0) % COVER_GRADIENTS.length];
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

// Search illustration
function SearchIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Books stack */}
      <rect x="20" y="50" width="70" height="12" rx="3" fill="rgba(245,158,11,0.4)"/>
      <rect x="20" y="50" width="5" height="12" rx="1" fill="rgba(245,158,11,0.6)"/>
      <rect x="25" y="38" width="60" height="12" rx="3" fill="rgba(167,139,250,0.4)"/>
      <rect x="25" y="38" width="5" height="12" rx="1" fill="rgba(167,139,250,0.6)"/>
      <rect x="30" y="26" width="50" height="12" rx="3" fill="rgba(52,211,153,0.4)"/>
      <rect x="30" y="26" width="5" height="12" rx="1" fill="rgba(52,211,153,0.6)"/>
      <rect x="20" y="62" width="70" height="3" rx="1" fill="rgba(245,158,11,0.2)"/>
      {/* Magnifying glass */}
      <circle cx="118" cy="50" r="28" stroke="rgba(245,158,11,0.5)" strokeWidth="3" fill="rgba(245,158,11,0.05)"/>
      <circle cx="118" cy="50" r="18" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" fill="rgba(245,158,11,0.04)"/>
      <line x1="138" y1="70" x2="155" y2="87" stroke="rgba(245,158,11,0.5)" strokeWidth="4" strokeLinecap="round"/>
      {/* Search lines inside glass */}
      <line x1="108" y1="46" x2="128" y2="46" stroke="rgba(245,158,11,0.4)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="108" y1="52" x2="124" y2="52" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="108" y1="58" x2="126" y2="58" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Empty search state illustration
function EmptySearchIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.25 }}>
      <circle cx="50" cy="45" r="30" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="72" y1="67" x2="95" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="38" y1="38" x2="62" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="54" x2="58" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(''); setSearched(false);
    if (!q.trim()) { setError('Please enter a search keyword.'); return; }
    setLoading(true);
    try {
      const res = await getBooks(q.trim());
      setResults(res.data);
      setSearched(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>Search Books</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            Search the catalog by title or author keyword
          </p>
        </div>
        <div style={{ opacity: 0.75 }}><SearchIllustration /></div>
      </div>

      {/* Search card */}
      <div className="card">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>
                <Sparkles size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: 'var(--accent)' }} />
                Search Keyword
              </label>
              <div className="search-wrap" style={{ flex: 1 }}>
                <Search className="icon" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title or author…"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginBottom: 1 }}>
              {loading
                ? <span className="spinner" style={{ width: 14, height: 14 }} />
                : <Search size={14} />}
              Search
            </button>
          </div>
        </form>
        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
      </div>

      {/* Results */}
      {searched && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {results.length === 0
                ? 'No results found'
                : <>{results.length} result{results.length !== 1 ? 's' : ''} for <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>"{q}"</em></>}
            </span>
            {results.length > 0 && (
              <span className="badge badge-gold">{results.length} book{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <EmptySearchIllustration />
              <p>No books match your search. Try a different keyword.</p>
            </div>
          ) : (
            <div className="book-grid">
              {results.map((b, i) => {
                const pct = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
                const barColor = pct === 0 ? 'var(--danger)' : pct < 50 ? 'var(--warn)' : 'var(--success)';
                return (
                  <div key={b._id} className="book-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    {/* Generated book cover */}
                    <div className="book-cover" style={{ background: getBookGradient(b.title) }}>
                      {b.title.charAt(0)}
                    </div>
                    <GenrePill genre={b.genre} />
                    <div className="book-card-title" style={{ marginTop: 8 }}>{b.title}</div>
                    <div className="book-card-author">by {b.author}</div>
                    {b.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
                        {b.description.length > 90 ? b.description.slice(0, 90) + '…' : b.description}
                      </div>
                    )}
                    {/* Availability bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Availability</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: barColor }}>{b.availableCopies}/{b.totalCopies}</span>
                      </div>
                      <div className="avail-bar">
                        <div className="avail-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                    <div className="book-card-footer">
                      <span className="badge badge-gray">{b.bookId}</span>
                      <div className="copies-indicator">
                        <div className={`copies-dot ${pct === 0 ? 'unavailable' : pct < 50 ? 'low' : 'available'}`} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {pct === 0 ? 'Unavailable' : pct < 50 ? 'Low stock' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
