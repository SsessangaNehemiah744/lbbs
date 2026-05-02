import React, { useState } from 'react';
import { BookMarked, Search, AlertCircle } from 'lucide-react';
import { getMemberBorrows } from '../utils/api';

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
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h2>My Books</h2>
          <p>View all books currently on loan for a member</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><BookMarked size={14} style={{ marginRight: 6 }} />Look Up Member</span>
        </div>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Member ID</label>
              <input
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. M001"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Search size={14} />}
              Look Up
            </button>
          </div>
        </form>
        {error && (
          <div className="alert alert-error" style={{ marginTop: 14 }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
      </div>

      {data && (
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">{data.member.name}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {data.member.memberId} · {data.member.email}
              </div>
            </div>
            <span className="badge badge-blue">{data.count} book{data.count !== 1 ? 's' : ''} on loan</span>
          </div>

          {data.borrowedBooks.length === 0 ? (
            <div className="empty">
              <BookMarked size={30} />
              <p>This member has no books on loan.</p>
            </div>
          ) : (
            <div className="book-grid">
              {data.borrowedBooks.map((b) => (
                <div key={b._id} className="book-card">
                  <div className="book-card-genre">{b.genre || 'General'}</div>
                  <div className="book-card-title">{b.title}</div>
                  <div className="book-card-author">by {b.author}</div>
                  <div className="book-card-footer">
                    <span className="badge badge-gray">{b.bookId}</span>
                    <span className="badge badge-gold">On Loan</span>
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
