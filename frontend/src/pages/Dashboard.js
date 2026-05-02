import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BookDown, BookUp, ChevronRight, Activity } from 'lucide-react';
import { getBooks, getMembers } from '../utils/api';

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
    <div className="label">{label}</div>
    <div className="value" style={{ color }}>{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>
);

const QuickLink = ({ to, label, desc, icon: Icon, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="book-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ background: color + '22', borderRadius: 10, padding: 12, flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <ChevronRight size={15} style={{ color: 'var(--text-dim)' }} />
    </div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, members: 0, available: 0, borrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, mRes] = await Promise.all([getBooks(), getMembers()]);
        const books = bRes.data;
        const members = mRes.data;
        const totalCopies = books.reduce((a, b) => a + b.totalCopies, 0);
        const available = books.reduce((a, b) => a + b.availableCopies, 0);
        setStats({ books: books.length, members: members.length, available, borrowed: totalCopies - available });
        setRecentBooks(books.slice(0, 5));
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      Loading dashboard…
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of the Library Book Borrowing System</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-green">
            <Activity size={10} /> System Online
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Books" value={stats.books} sub="In catalog" color="var(--accent)" />
        <StatCard label="Members" value={stats.members} sub="Registered" color="var(--gold)" />
        <StatCard label="Available" value={stats.available} sub="Copies free" color="var(--success)" />
        <StatCard label="On Loan" value={stats.borrowed} sub="Copies out" color="var(--danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickLink to="/borrow" label="Borrow a Book" desc="Issue a book to a member" icon={BookDown} color="var(--success)" />
              <QuickLink to="/return" label="Return a Book" desc="Process a book return" icon={BookUp} color="var(--accent)" />
              <QuickLink to="/catalog" label="Add to Catalog" desc="Register new books" icon={BookOpen} color="var(--gold)" />
              <QuickLink to="/members" label="Register Member" desc="Add a library member" icon={Users} color="var(--danger)" />
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Books</span>
              <Link to="/catalog" style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            {recentBooks.length === 0 ? (
              <div className="empty"><p>No books in catalog yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentBooks.map((b) => (
                  <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>{b.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.author}</div>
                    </div>
                    <span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>
                      {b.availableCopies}/{b.totalCopies}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
