import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { getBooks } from '../utils/api';

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
      <div className="page-header">
        <div>
          <h2>Search Books</h2>
          <p>Search the catalog by title or author keyword</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Keyword</label>
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
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Search size={14} />}
                Search
              </button>
            </div>
          </div>
        </form>
        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
      </div>

      {searched && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {results.length === 0 ? 'No results found' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
            </span>
          </div>
          {results.length === 0 ? (
            <div className="empty">
              <BookOpen size={32} />
              <p>No books match your search. Try a different keyword.</p>
            </div>
          ) : (
            <div className="book-grid">
              {results.map((b) => (
                <div key={b._id} className="book-card">
                  <div className="book-card-genre">{b.genre || 'General'}</div>
                  <div className="book-card-title">{b.title}</div>
                  <div className="book-card-author">by {b.author}</div>
                  {b.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
                      {b.description.length > 100 ? b.description.slice(0, 100) + '…' : b.description}
                    </div>
                  )}
                  <div className="book-card-footer">
                    <span className="badge badge-gray">{b.bookId}</span>
                    <div className="copies-indicator">
                      <div className={`copies-dot ${b.availableCopies === 0 ? 'unavailable' : b.availableCopies < b.totalCopies * 0.5 ? 'low' : 'available'}`} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {b.availableCopies}/{b.totalCopies} available
                      </span>
                    </div>
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
