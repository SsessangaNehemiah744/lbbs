import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, Users, RefreshCw, UserCheck } from 'lucide-react';
import { getMembers, addMember, deleteMember } from '../utils/api';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f87171,#dc2626)',
  'linear-gradient(135deg,#60a5fa,#2563eb)',
  'linear-gradient(135deg,#fbbf24,#b45309)',
];

function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// Members hero illustration
function MembersIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person 1 */}
      <circle cx="40" cy="35" r="16" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
      <circle cx="40" cy="30" r="8" fill="rgba(245,158,11,0.4)"/>
      <path d="M22 60c0-10 8-16 18-16s18 6 18 16" stroke="rgba(245,158,11,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Person 2 */}
      <circle cx="80" cy="30" r="18" fill="rgba(167,139,250,0.2)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5"/>
      <circle cx="80" cy="24" r="9" fill="rgba(167,139,250,0.4)"/>
      <path d="M60 58c0-11 9-18 20-18s20 7 20 18" stroke="rgba(167,139,250,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Person 3 */}
      <circle cx="120" cy="35" r="16" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5"/>
      <circle cx="120" cy="30" r="8" fill="rgba(52,211,153,0.4)"/>
      <path d="M102 60c0-10 8-16 18-16s18 6 18 16" stroke="rgba(52,211,153,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* ID cards */}
      <rect x="20" y="75" width="36" height="24" rx="4" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
      <rect x="62" y="72" width="36" height="24" rx="4" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/>
      <rect x="104" y="75" width="36" height="24" rx="4" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.3)" strokeWidth="1"/>
      <line x1="26" y1="83" x2="50" y2="83" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="89" x2="44" y2="89" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="68" y1="80" x2="92" y2="80" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="68" y1="86" x2="86" y2="86" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="110" y1="83" x2="134" y2="83" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="89" x2="128" y2="89" stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

const initForm = { memberId: '', name: '', email: '', phone: '' };

export default function MembersPage() {
  const [members, setMembers] = useState([]);
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
      const res = await getMembers();
      setMembers(res.data);
      setFiltered(res.data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(members); return; }
    const q = search.toLowerCase();
    setFiltered(members.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q)
    ));
  }, [search, members]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.memberId || !form.name || !form.email) { setError('memberId, name, and email are required.'); return; }
    setSubmitting(true);
    try {
      await addMember(form);
      setSuccess(`Member "${form.name}" registered successfully.`);
      setForm(initForm);
      load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleDelete = async (memberId, name) => {
    if (!window.confirm(`Remove member "${name}"?`)) return;
    setError(''); setSuccess('');
    try {
      await deleteMember(memberId);
      setSuccess(`Member "${name}" removed.`);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700,
            background: 'var(--gradient-accent)', backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'gradientShift 5s ease infinite',
          }}>Members</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginTop: 5 }}>
            Register and manage library members
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ opacity: 0.7 }}><MembersIllustration /></div>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Register form */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={14} color="var(--violet)" />
            </span>
            Register New Member
          </span>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid cols-2">
            <div className="field">
              <label>Member ID *</label>
              <input name="memberId" value={form.memberId} onChange={handleChange} placeholder="e.g. M006" />
            </div>
            <div className="field">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="field">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Registering…</>
                : <><UserCheck size={14} /> Register Member</>}
            </button>
          </div>
        </form>
      </div>

      {/* Members table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={16} style={{ color: 'var(--violet)' }} />
            All Members
            <span className="badge badge-blue" style={{ marginLeft: 4 }}>{filtered.length}</span>
          </span>
          <div className="search-wrap">
            <Search className="icon" />
            <input
              placeholder="Search by name, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Loading members…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.2 }}>
              <circle cx="32" cy="22" r="12" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 56c0-13 11-22 24-22s24 9 24 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <p>No members found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="member-avatar" style={{ background: getAvatarColor(m.name) }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{m.name}</div>
                          <span className="badge badge-blue" style={{ marginTop: 3, fontSize: '0.62rem' }}>{m.memberId}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{m.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{m.phone || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="badge badge-green">Active</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleDelete(m.memberId, m.name)}
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
