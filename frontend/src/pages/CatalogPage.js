import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, BookOpen, RefreshCw, Library } from 'lucide-react';
import { getBooks, addBook, deleteBook } from '../utils/api';

const GENRES = ['General', 'Programming', 'Computer Science', 'Software Architecture', 'Software Engineering', 'Mathematics', 'Science', 'Fiction', 'Non-Fiction'];

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

function getBookGradient(title) {
  return COVER_GRADIENTS[title.charCodeAt(0) % COVER_GRADIENTS.length];
}

function GenrePill({ genre }) {
  const s = GENRE_STYLES[genre] || GENRE_STYLES['General'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      fontSize: '0.68rem', fontWeight: 600,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}33`,
    }}>
      {genre || 'General'}
    </span>
  );
}

// Catalog hero illustration
function CatalogIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Table */}
      <rect x="10" y="100" width="160" height="8" rx="4" fill="rgba(245,158,11,0.2)"/>
      <rect x="30" y="108" width="8" height="20" rx="2" fill="rgba(245,158,11,0.15)"/>
      <rect x="142" y="108" width="8" height="20" rx="2" fill="rgba(245,158,11,0.15)"/>
      {/* Stack of books */}
      <rect x="50" y="60" width="80" height="14" rx="3" fill="rgba(245,158,11,0.5)"/>
      <rect x="50" y="60" width="6" height="14" rx="1" fill="rgba(245,158,11,0.7)"/>
      <rect x="55" y="46" width="70" height="14" rx="3" fill="rgba(167,139,250,0.5)"/>
      <rect x="55" y="46" width="6" height="14" rx="1" fill="rgba(167,139,250,0.7)"/>
      <rect x="60" y="32" width="60" height="14" rx="3" fill="rgba(52,211,153,0.5)"/>
      <rect x="60" y="32" width="6" height="14" rx="1" fill="rgba(52,211,153,0.7)"/>
      <rect x="65" y="18" width="50" height="14" rx="3" fill="rgba(248,113,113,0.5)"/>
      <rect x="65" y="18" width="6" height="14" rx="1" fill="rgba(248,113,113,0.7)"/>
      {/* Magnifying glass */}
      <circle cx="148" cy="30" r="16" stroke="rgba(245,158,11,0.4)" strokeWidth="3" fill="none"/>
      <line x1="159" y1="41" x2="170" y2="52" stroke="rgba(245,158,11,0.4)" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="148" cy="30" r="8" fill="rgba(245,158,11,0.08)"/>
      {/* Plus icon */}
      <circle cx="28" cy="28" r="14" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5"/>
      <line x1="28" y1="22" x2="28" y2="34" stroke="rgba(52,211,153,0.7)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="28" x2="34" y2="28" stroke="rgba(52,211,153,0.7)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const initForm = { bookId: '', title: '', author: '', totalCopies: '', genre: 'General', isbn: '', description: '' };

export default function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBooks();
      setBooks(res.data);
      setFiltered(res.data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(books); return; }
    const q = search.toLowerCase();
    setFiltered(books.filter((b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.bookId.toLowerCase().includes(q) ||
      (b.genre || '').toLowerCase().includes(q)
    ));
  }, [search, books]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const { bookId, title, author, totalCopies } = form;
    if (!bookId || !title || !author || !totalCopies) { setError('bookId, title, author, and totalCopies are required.'); return; }
    const copies = parseInt(totalCopies, 10);
    if (isNaN(copies) || copies < 1) { setError('totalCopies must be a positive integer.'); return; }
    setSubmitting(true);
    try {
      await addBook({ ...form, totalCopies: copies });
      setSuccess(`"${title}" added to catalog.`);
      setForm(initForm);
      load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleDelete = async (bookId, title) => {
    if (!window.confirm(`Remove "${title}" from the catalog?`)) return;
    setError(''); setSuccess('');
    try {
      await deleteBook(bookId);
      setSuccess(`"${title}" removed.`);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      {/* Page header with illustration */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>Book Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            Manage the library's complete book collection
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ opacity: 0.6 }}><CatalogIllustration /></div>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Add book form */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={14} color="var(--success)" />
            </span>
            Add New Book
          </span>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid cols-3">
            <div className="field">
              <label>Book ID *</label>
              <input name="bookId" value={form.bookId} onChange={handleChange} placeholder="e.g. B009" />
            </div>
            <div className="field">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" />
            </div>
            <div className="field">
              <label>Author *</label>
              <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" />
            </div>
            <div className="field">
              <label>Total Copies *</label>
              <input name="totalCopies" type="number" min="1" value={form.totalCopies} onChange={handleChange} placeholder="1" />
            </div>
            <div className="field">
              <label>Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description (optional)" rows={2} />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Adding…</>
                : <><Plus size={14} /> Add Book</>}
            </button>
          </div>
        </form>
      </div>

      {/* Books table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Library size={16} style={{ color: 'var(--accent)' }} />
            All Books
            <span className="badge badge-gold" style={{ marginLeft: 4 }}>{filtered.length}</span>
          </span>
          <div className="search-wrap">
            <Search className="icon" />
            <input
              placeholder="Filter by title, author, genre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Loading catalog…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.2 }}>
              <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 24h24M20 32h16M20 40h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No books found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th style={{ textAlign: 'center' }}>Copies</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const pct = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
                  const barColor = pct === 0 ? 'var(--danger)' : pct < 50 ? 'var(--warn)' : 'var(--success)';
                  return (
                    <tr key={b._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 40, borderRadius: 4, flexShrink: 0,
                            background: getBookGradient(b.title),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                            fontFamily: 'var(--font-display)',
                            boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                          }}>
                            {b.title.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{b.title}</div>
                            <span className="badge badge-gray" style={{ marginTop: 3, fontSize: '0.62rem' }}>{b.bookId}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{b.author}</td>
                      <td><GenrePill genre={b.genre} /></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.totalCopies}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 700, color: barColor }}>{b.availableCopies}</span>
                          <div style={{ width: 48, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        {b.availableCopies === 0 ? (
                          <span className="badge badge-red">Unavailable</span>
                        ) : b.availableCopies < b.totalCopies * 0.5 ? (
                          <span className="badge badge-gold">Low Stock</span>
                        ) : (
                          <span className="badge badge-green">Available</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Remove book"
                          onClick={() => handleDelete(b.bookId, b.title)}
                          style={{ color: 'var(--danger)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
