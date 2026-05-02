import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, BookOpen, RefreshCw } from 'lucide-react';
import { getBooks, addBook, deleteBook } from '../utils/api';

const GENRES = ['General', 'Programming', 'Computer Science', 'Software Architecture', 'Software Engineering', 'Mathematics', 'Science', 'Fiction', 'Non-Fiction'];

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
      <div className="page-header">
        <div>
          <h2>Book Catalog</h2>
          <p>Manage the library's book collection</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Add book form */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Plus size={14} style={{ marginRight: 6 }} />Add New Book</span>
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
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Adding…</> : <><Plus size={14} /> Add Book</>}
            </button>
          </div>
        </form>
      </div>

      {/* Books table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Books ({filtered.length})</span>
          <div className="search-wrap">
            <Search className="icon" />
            <input
              placeholder="Filter books…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty"><BookOpen size={32} /><p>No books found.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id}>
                    <td><span className="badge badge-gray">{b.bookId}</span></td>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{b.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                    <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.genre || '—'}</span></td>
                    <td style={{ textAlign: 'center' }}>{b.totalCopies}</td>
                    <td style={{ textAlign: 'center' }}>{b.availableCopies}</td>
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
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
