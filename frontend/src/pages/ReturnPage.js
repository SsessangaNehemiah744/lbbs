import React, { useState } from 'react';
import { BookUp, CheckCircle, AlertCircle } from 'lucide-react';
import { returnBook } from '../utils/api';

export default function ReturnPage() {
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
      const res = await returnBook(form);
      setResult(res.data);
      setForm({ bookId: '', memberId: '' });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h2>Return a Book</h2>
          <p>Process a book return from a member</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><BookUp size={14} style={{ marginRight: 6 }} />Return Form</span>
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
                Copies now available: <strong>{result.availableCopies}</strong>
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
            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Processing…</> : <><BookUp size={15} /> Return Book</>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ borderColor: 'rgba(99,179,237,0.15)' }}>
        <div className="card-title" style={{ marginBottom: 12 }}>How Returns Work</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['1', 'Enter the Book ID and the Member ID of the returning member.'],
            ['2', 'The system verifies both the book and member exist.'],
            ['3', 'It confirms the member currently has this book on loan.'],
            ['4', 'availableCopies is incremented and the borrower record is removed atomically.'],
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
