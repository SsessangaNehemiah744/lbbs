import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Search, RefreshCw, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { getMembers, addMember, deleteMember } from '../utils/api';

const AVATAR_GRADIENTS = [
  ['#f59e0b','#d97706'],['#8b5cf6','#6d28d9'],['#10b981','#059669'],
  ['#ef4444','#dc2626'],['#3b82f6','#2563eb'],['#fbbf24','#f59e0b'],
  ['#a78bfa','#8b5cf6'],['#34d399','#10b981'],
];
function avatarGradient(str) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  const [a, b] = AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

const initForm = { memberId:'', name:'', email:'', phone:'' };

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initForm);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');

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

  const showAlert = (type, msg) => { setAlert({type,msg}); setTimeout(()=>setAlert(null),5000); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.memberId||!form.name||!form.email) return showAlert('error','Member ID, Name, and Email are required.');
    setSubmitting(true);
    try {
      await addMember(form);
      showAlert('success',`Member "${form.name}" registered.`);
      setForm(initForm); load();
    } catch(e) { showAlert('error',e.message); }
    setSubmitting(false);
  };

  const handleDelete = async (memberId, name) => {
    if (!window.confirm(`Delete member "${name}"?`)) return;
    try { await deleteMember(memberId); showAlert('success',`"${name}" removed.`); load(); }
    catch(e) { showAlert('error',e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Members</h1>
          <p>Register new library members and manage existing ones</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      <div className="card" style={{marginBottom:24}}>
        <div className="card-header">
          <div className="card-title"><Plus size={15} style={{marginRight:6}}/>Register New Member</div>
        </div>
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.type==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}
            <div>{alert.msg}</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2" style={{marginBottom:16}}>
            <div className="form-group">
              <label className="form-label">Member ID</label>
              <input className="form-input" value={form.memberId} onChange={e=>setForm(f=>({...f,memberId:e.target.value}))} placeholder="e.g. MEM001"/>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name"/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@mak.ac.ug"/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+256 7XX XXX XXX"/>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            <Plus size={14}/> {submitting?'Registering…':'Register Member'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="card-title"><Users size={15} style={{marginRight:6}}/>All Members</div>
            <span className="badge badge-violet">{filtered.length} members</span>
          </div>
          <div style={{position:'relative',display:'flex',alignItems:'center'}}>
            <Search size={14} style={{position:'absolute',left:10,color:'var(--text-muted)',pointerEvents:'none'}}/>
            <input className="form-input" style={{paddingLeft:32,width:260}} value={search}
              onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, ID…"/>
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Member ID</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan="7">
                    <div className="empty-state">
                      <Users size={40} style={{margin:'0 auto 12px',display:'block',opacity:0.3}}/>
                      <h3>No members found</h3>
                      <p>{search?'Try a different search.':'Register your first member above.'}</p>
                    </div>
                  </td></tr>
                ) : filtered.map((m,i) => (
                  <tr key={m._id} style={{animationDelay:`${i*0.04}s`}}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div className="member-avatar" style={{background:avatarGradient(m.memberId||m.name)}}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div style={{fontWeight:600}}>{m.name}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-violet">{m.memberId}</span></td>
                    <td style={{color:'var(--text-secondary)'}}>{m.email}</td>
                    <td style={{color:'var(--text-secondary)'}}>{m.phone||'—'}</td>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>
                      {new Date(m.createdAt).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'})}
                    </td>
                    <td><span className="badge badge-emerald">Active</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(m.memberId,m.name)}>
                        <Trash2 size={13}/>
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
