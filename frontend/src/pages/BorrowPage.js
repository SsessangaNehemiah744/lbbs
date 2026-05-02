import React, { useState } from 'react';
import { BookDown, CheckCircle, AlertCircle } from 'lucide-react';
import { borrowBook } from '../utils/api';

export default function BorrowPage() {
  const [form, setForm] = useState({ bookId: '', memberId: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    if (!form.bookId || !form.memberId) { setError('Both Book ID and Member ID are required.'); return; }
    setLoading(true);
    try {
      const res = await borrowBook(form);
      setResult(res.data);
      setForm({ bookId: '', memberId: '' });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h2>Borrow a Book</h2>
          <p>Issue a book to a registered member</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><BookDown size={14} style={{ marginRight: 6 }} />Borrowing Form</span>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>{result.message}</strong>
              <div style={{ marginTop: 4, fontSize: '0.8rem', opacity: 0.85 }}>
                Remaining copies available: <strong>{result.availableCopies}</strong>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Book ID *</label>
              <input name="bookId" value={form.bookId} onChange={handleChange} placeholder="e.g. B001" />
            </div>
            <div className="field">
              <label>Member ID *</label>
              <input name="memberId" value={form.memberId} onChange={handleChange} placeholder="e.g. M001" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-success w-full" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Processing…</> : <><BookDown size={15} /> Borrow Book</>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ borderColor: 'var(--accent-glow)' }}>
        <div className="card-title" style={{ marginBottom: 12 }}>How Borrowing Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['1', 'Enter the Book ID (e.g. B001) and Member ID (e.g. M001).'],
            ['2', 'The system checks the book exists and has available copies.'],
            ['3', 'It also confirms the member doesn\'t already hold this book.'],
            ['4', 'On success, availableCopies is decremented atomically.'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{n}</span>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
