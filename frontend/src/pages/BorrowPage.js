import React, { useState } from 'react';
import { BookDown, CheckCircle, AlertCircle, Hash, User } from 'lucide-react';
import { borrowBook } from '../utils/api';

// Borrow illustration
function BorrowIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person giving book */}
      <circle cx="55" cy="45" r="20" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5"/>
      <circle cx="55" cy="38" r="10" fill="rgba(52,211,153,0.35)"/>
      <path d="M33 75c0-12 10-20 22-20s22 8 22 20" stroke="rgba(52,211,153,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Arrow */}
      <path d="M85 80 L115 80" stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M108 73 L115 80 L108 87" stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Book being handed */}
      <rect x="88" y="68" width="24" height="32" rx="3" fill="rgba(245,158,11,0.5)"/>
      <rect x="88" y="68" width="5" height="32" rx="1" fill="rgba(245,158,11,0.7)"/>
      <line x1="96" y1="78" x2="108" y2="78" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="96" y1="84" x2="108" y2="84" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Person receiving */}
      <circle cx="145" cy="45" r="20" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5"/>
      <circle cx="145" cy="38" r="10" fill="rgba(167,139,250,0.35)"/>
      <path d="M123 75c0-12 10-20 22-20s22 8 22 20" stroke="rgba(167,139,250,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Checkmark */}
      <circle cx="155" cy="110" r="18" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5"/>
      <path d="M146 110 L152 116 L164 104" stroke="rgba(52,211,153,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Decorative dots */}
      <circle cx="20" cy="120" r="4" fill="rgba(245,158,11,0.2)"/>
      <circle cx="180" cy="30" r="5" fill="rgba(167,139,250,0.2)"/>
      <circle cx="170" cy="130" r="3" fill="rgba(52,211,153,0.2)"/>
    </svg>
  );
}

const STEPS = [
  { n: '1', text: 'Enter the Book ID (e.g. B001) and Member ID (e.g. M001).' },
  { n: '2', text: 'The system checks the book exists and has available copies.' },
  { n: '3', text: "It also confirms the member doesn't already hold this book." },
  { n: '4', text: 'On success, availableCopies is decremented atomically.' },
];

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
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>Borrow a Book</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            Issue a book to a registered library member
          </p>
        </div>
        <div style={{ opacity: 0.8, flexShrink: 0 }}>
          <BorrowIllustration />
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookDown size={14} color="var(--success)" />
            </span>
            Borrowing Form
          </span>
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
              <label>
                <Hash size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Book ID *
              </label>
              <input
                name="bookId"
                value={form.bookId}
                onChange={handleChange}
                placeholder="e.g. B001"
              />
            </div>
            <div className="field">
              <label>
                <User size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Member ID *
              </label>
              <input
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                placeholder="e.g. M001"
              />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '12px 20px', fontSize: '0.9rem' }}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing…</>
                : <><BookDown size={16} /> Borrow Book</>}
            </button>
          </div>
        </form>
      </div>

      {/* How it works */}
      <div className="card" style={{ borderColor: 'rgba(52,211,153,0.15)' }}>
        <div className="card-header" style={{ marginBottom: 16, paddingBottom: 14 }}>
          <span className="card-title" style={{ fontSize: '0.95rem' }}>How Borrowing Works</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--success), #059669)',
                color: '#0a1a10', borderRadius: 8,
                width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
                boxShadow: '0 2px 8px rgba(52,211,153,0.25)',
              }}>{n}</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
