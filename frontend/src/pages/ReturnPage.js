import React, { useState } from 'react';
import { BookUp, CheckCircle, AlertCircle, Hash, User } from 'lucide-react';
import { returnBook } from '../utils/api';

// Return illustration
function ReturnIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person returning */}
      <circle cx="55" cy="45" r="20" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5"/>
      <circle cx="55" cy="38" r="10" fill="rgba(167,139,250,0.35)"/>
      <path d="M33 75c0-12 10-20 22-20s22 8 22 20" stroke="rgba(167,139,250,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Arrow (reversed) */}
      <path d="M115 80 L85 80" stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M92 73 L85 80 L92 87" stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Book being returned */}
      <rect x="88" y="68" width="24" height="32" rx="3" fill="rgba(245,158,11,0.5)"/>
      <rect x="88" y="68" width="5" height="32" rx="1" fill="rgba(245,158,11,0.7)"/>
      <line x1="96" y1="78" x2="108" y2="78" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="96" y1="84" x2="108" y2="84" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Library shelf receiver */}
      <rect x="125" y="60" width="50" height="50" rx="6" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5"/>
      <rect x="125" y="88" width="50" height="3" fill="rgba(245,158,11,0.2)"/>
      <rect x="132" y="68" width="10" height="20" rx="2" fill="rgba(245,158,11,0.3)"/>
      <rect x="144" y="72" width="8" height="16" rx="2" fill="rgba(167,139,250,0.3)"/>
      <rect x="154" y="66" width="12" height="22" rx="2" fill="rgba(52,211,153,0.3)"/>
      {/* Plus sign on shelf */}
      <circle cx="155" cy="110" r="14" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
      <line x1="155" y1="104" x2="155" y2="116" stroke="rgba(245,158,11,0.7)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="149" y1="110" x2="161" y2="110" stroke="rgba(245,158,11,0.7)" strokeWidth="2" strokeLinecap="round"/>
      {/* Decorative */}
      <circle cx="20" cy="30" r="4" fill="rgba(167,139,250,0.2)"/>
      <circle cx="185" cy="140" r="5" fill="rgba(245,158,11,0.15)"/>
    </svg>
  );
}

const STEPS = [
  { n: '1', text: 'Enter the Book ID and the Member ID of the returning member.' },
  { n: '2', text: 'The system verifies both the book and member exist.' },
  { n: '3', text: 'It confirms the member currently has this book on loan.' },
  { n: '4', text: 'availableCopies is incremented and the borrower record is removed atomically.' },
];

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
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>Return a Book</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            Process a book return from a library member
          </p>
        </div>
        <div style={{ opacity: 0.8, flexShrink: 0 }}>
          <ReturnIllustration />
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookUp size={14} color="var(--accent)" />
            </span>
            Return Form
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
                Copies now available: <strong>{result.availableCopies}</strong>
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
                : <><BookUp size={16} /> Return Book</>}
            </button>
          </div>
        </form>
      </div>

      {/* How it works */}
      <div className="card" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
        <div className="card-header" style={{ marginBottom: 16, paddingBottom: 14 }}>
          <span className="card-title" style={{ fontSize: '0.95rem' }}>How Returns Work</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), #d97706)',
                color: '#0c0a09', borderRadius: 8,
                width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
                boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
              }}>{n}</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
