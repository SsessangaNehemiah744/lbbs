import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, Users, RefreshCw } from 'lucide-react';
import { getMembers, addMember, deleteMember } from '../utils/api';

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
      <div className="page-header">
        <div>
          <h2>Members</h2>
          <p>Register and manage library members</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><Plus size={14} style={{ marginRight: 6 }} />Register Member</span>
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
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Registering…</> : <><Plus size={14} /> Register Member</>}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Members ({filtered.length})</span>
          <div className="search-wrap">
            <Search className="icon" />
            <input placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty"><Users size={32} /><p>No members found.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id}>
                    <td><span className="badge badge-blue">{m.memberId}</span></td>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{m.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{m.phone || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleDelete(m.memberId, m.name)}
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
