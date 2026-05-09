import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, RefreshCw, Users, CheckCircle, AlertCircle,
         X, Mail, Phone, Hash, Calendar, ChevronUp, Eye, UserPlus } from 'lucide-react';
import { getMembers, addMember, deleteMember } from '../utils/api';

const AVATAR_GRADIENTS = [
  ['#f59e0b','#d97706'],['#8b5cf6','#6d28d9'],['#10b981','#059669'],
  ['#ef4444','#dc2626'],['#3b82f6','#2563eb'],['#fbbf24','#f59e0b'],
  ['#a78bfa','#8b5cf6'],['#34d399','#10b981'],
];
function hashStr(str) { let h=0; for(const c of str) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h); }
function avatarGradient(str) {
  const [a,b] = AVATAR_GRADIENTS[hashStr(str) % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg,${a},${b})`;
}

const initForm = { memberId:'', name:'', email:'', phone:'' };

/* ── Member Detail Modal ── */
function MemberModal({ member, onClose, onDelete }) {
  if (!member) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}><X size={18}/></button>

        {/* Avatar + name */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:24 }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background: avatarGradient(member.memberId || member.name),
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, fontWeight:900, color:'#fff',
            fontFamily:"'Playfair Display',serif",
            boxShadow:'0 6px 24px rgba(0,0,0,0.4)',
            border:'3px solid rgba(255,255,255,0.1)',
          }}>
            {member.name[0].toUpperCase()}
          </div>
          <div style={{ textAlign:'center' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'var(--text-primary)', marginBottom:6 }}>
              {member.name}
            </h2>
            <span className="badge badge-violet">{member.memberId}</span>
            <span className="badge badge-emerald" style={{ marginLeft:8 }}>Active</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
          <div style={S.detailRow}>
            <Mail size={14} style={{ color:'var(--amber)', flexShrink:0 }}/>
            <div>
              <div style={S.detailLabel}>Email</div>
              <div style={S.detailVal}>{member.email}</div>
            </div>
          </div>
          <div style={S.detailRow}>
            <Phone size={14} style={{ color:'var(--emerald)', flexShrink:0 }}/>
            <div>
              <div style={S.detailLabel}>Phone</div>
              <div style={S.detailVal}>{member.phone || '—'}</div>
            </div>
          </div>
          <div style={S.detailRow}>
            <Hash size={14} style={{ color:'var(--violet-light)', flexShrink:0 }}/>
            <div>
              <div style={S.detailLabel}>Member ID</div>
              <div style={S.detailVal}>{member.memberId}</div>
            </div>
          </div>
          <div style={S.detailRow}>
            <Calendar size={14} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
            <div>
              <div style={S.detailLabel}>Joined</div>
              <div style={S.detailVal}>
                {new Date(member.createdAt).toLocaleDateString('en-GB',{ year:'numeric', month:'long', day:'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Delete */}
        <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center' }}
          onClick={() => { onDelete(member.memberId, member.name); onClose(); }}>
          <Trash2 size={14}/> Remove Member
        </button>
      </div>
    </div>
  );
}

/* ── Member Card ── */
function MemberCard({ member, onClick, onDelete }) {
  const joined = new Date(member.createdAt).toLocaleDateString('en-GB',{ year:'numeric', month:'short', day:'numeric' });
  return (
    <div style={S.card} className="member-ecom-card" onClick={onClick}>
      {/* Top — avatar */}
      <div style={S.cardTop}>
        <div style={{ ...S.avatar, background: avatarGradient(member.memberId || member.name) }}>
          {member.name[0].toUpperCase()}
        </div>
        {/* Hover overlay */}
        <div className="cover-hover-overlay" style={S.hoverOverlay}>
          <Eye size={16} style={{ marginBottom:4 }}/>
          <span style={{ fontSize:11, fontWeight:700 }}>View Profile</span>
        </div>
      </div>

      {/* Body */}
      <div style={S.cardBody}>
        <h3 style={S.cardName} title={member.name}>{member.name}</h3>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          <span className="badge badge-violet" style={{ fontSize:10 }}>{member.memberId}</span>
          <span className="badge badge-emerald" style={{ fontSize:10 }}>Active</span>
        </div>
        <div style={S.cardMeta}>
          <Mail size={10} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{member.email}</span>
        </div>
        {member.phone && (
          <div style={S.cardMeta}>
            <Phone size={10} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
            <span>{member.phone}</span>
          </div>
        )}
        <div style={S.cardMeta}>
          <Calendar size={10} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
          <span>Joined {joined}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={S.cardFooter} onClick={e => e.stopPropagation()}>
        <span style={S.idPill}>{member.memberId}</span>
        <button className="btn btn-danger btn-sm" style={{ padding:'4px 10px' }}
          onClick={e => { e.stopPropagation(); onDelete(member.memberId, member.name); }}>
          <Trash2 size={12}/>
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MembersPage() {
  const [members, setMembers]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]       = useState(null);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getMembers(); setMembers(r.data); setFiltered(r.data); } catch(_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(members); return; }
    const q = search.toLowerCase();
    setFiltered(members.filter(m => [m.memberId,m.name,m.email].join(' ').toLowerCase().includes(q)));
  }, [search, members]);

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.memberId || !form.name || !form.email)
      return showAlert('error','Member ID, Name, and Email are required.');
    setSubmitting(true);
    try {
      await addMember(form);
      showAlert('success', `Member "${form.name}" registered.`);
      setForm(initForm); load();
    } catch(err) { showAlert('error', err.message); }
    setSubmitting(false);
  };

  const handleDelete = async (memberId, name) => {
    if (!window.confirm(`Delete member "${name}"?`)) return;
    try { await deleteMember(memberId); showAlert('success', `"${name}" removed.`); load(); }
    catch(err) { showAlert('error', err.message); }
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Members</h1>
          <p>Register and manage library members</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
            {showForm ? <ChevronUp size={15}/> : <UserPlus size={15}/>}
            {showForm ? 'Hide Form' : 'Register Member'}
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:16 }}>
          {alert.type === 'success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          <div>{alert.msg}</div>
        </div>
      )}

      {/* Collapsible register form */}
      {showForm && (
        <div className="card" style={{ marginBottom:24, animation:'fadeIn 0.25s ease' }}>
          <div className="card-header">
            <div className="card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <UserPlus size={15}/> Register New Member
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2" style={{ marginBottom:16 }}>
              <div className="form-group">
                <label className="form-label">Member ID</label>
                <input className="form-input" value={form.memberId}
                  onChange={e => setForm(f => ({ ...f, memberId:e.target.value }))} placeholder="e.g. M005"/>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Full name"/>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email:e.target.value }))} placeholder="email@mak.ac.ug"/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} placeholder="+256 7XX XXX XXX"/>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              <Plus size={14}/> {submitting ? 'Registering…' : 'Register Member'}
            </button>
          </form>
        </div>
      )}

      {/* Stats + search bar */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:1 }}/>
          <input className="form-input" style={{ paddingLeft:38 }} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or ID…"/>
        </div>
        <span className="badge badge-violet" style={{ whiteSpace:'nowrap' }}>{filtered.length} members</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
          <h3>No members found</h3>
          <p>{search ? 'Try a different search.' : 'Register your first member above.'}</p>
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(m => (
            <MemberCard key={m._id} member={m}
              onClick={() => setSelected(m)}
              onDelete={handleDelete}/>
          ))}
        </div>
      )}

      <MemberModal
        member={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}/>

      <style>{CSS}</style>
    </div>
  );
}

/* ── Styles ── */
const S = {
  grid: {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',
    gap:20,
  },
  card: {
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16,
    overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer',
    transition:'transform 0.22s ease,border-color 0.22s ease,box-shadow 0.22s ease',
    position:'relative',
  },
  cardTop: {
    height:120, position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center',
    background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(245,158,11,0.08))',
    borderBottom:'1px solid var(--border)',
    overflow:'hidden',
  },
  avatar: {
    width:72, height:72, borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:28, fontWeight:900, color:'#fff',
    fontFamily:"'Playfair Display',serif",
    boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
    border:'3px solid rgba(255,255,255,0.12)',
    position:'relative', zIndex:1,
  },
  hoverOverlay: {
    position:'absolute', inset:0, background:'rgba(0,0,0,0.65)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    color:'#fff', opacity:0, transition:'opacity 0.25s ease', zIndex:2,
  },
  cardBody: {
    padding:'14px 14px 8px', flex:1, display:'flex', flexDirection:'column', gap:4,
  },
  cardName: {
    fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700,
    color:'var(--text-primary)', lineHeight:1.3, marginBottom:4,
    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
  },
  cardMeta: {
    display:'flex', alignItems:'center', gap:6,
    fontSize:11, color:'var(--text-muted)', minWidth:0,
  },
  cardFooter: {
    padding:'8px 14px 12px', display:'flex', alignItems:'center',
    justifyContent:'space-between', borderTop:'1px solid var(--border)', marginTop:4,
  },
  idPill: {
    fontSize:10, color:'var(--text-muted)', fontFamily:'monospace',
    background:'rgba(255,255,255,0.05)', padding:'2px 7px', borderRadius:4,
  },
  /* Modal */
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(7px)',
    zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
    padding:20, animation:'fadeIn 0.2s ease',
  },
  modal: {
    background:'var(--bg-card)', border:'1px solid var(--border-accent)', borderRadius:20,
    padding:28, maxWidth:420, width:'100%', position:'relative',
    boxShadow:'0 28px 90px rgba(0,0,0,0.65)',
    animation:'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
    maxHeight:'90vh', overflowY:'auto',
  },
  closeBtn: {
    position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.07)',
    border:'1px solid var(--border)', borderRadius:'50%', width:32, height:32,
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'var(--text-secondary)', cursor:'pointer',
  },
  detailRow: {
    display:'flex', alignItems:'flex-start', gap:12,
    background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)',
    borderRadius:10, padding:'12px 14px',
  },
  detailLabel: { fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 },
  detailVal:   { fontSize:13, color:'var(--text-primary)', fontWeight:500 },
};

const CSS = `
.member-ecom-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--border-accent);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.2);
}
.member-ecom-card:hover .cover-hover-overlay {
  opacity: 1 !important;
}
@keyframes modalIn {
  from { opacity:0; transform:scale(0.85) translateY(24px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; }
  to   { opacity:1; }
}
`;
