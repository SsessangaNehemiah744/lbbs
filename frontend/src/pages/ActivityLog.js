import React, { useState, useEffect, useCallback } from 'react';
import { Activity, BookDown, BookUp, Trash2, UserPlus, BookOpen, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const TYPE_CONFIG = {
  borrow:        { icon: BookDown,  color: 'var(--amber)',        label: 'Borrow',         badge: 'badge-amber'   },
  return:        { icon: BookUp,    color: 'var(--emerald)',      label: 'Return',         badge: 'badge-emerald' },
  add_book:      { icon: BookOpen,  color: 'var(--violet-light)', label: 'Book Added',     badge: 'badge-violet'  },
  delete_book:   { icon: Trash2,    color: 'var(--red)',          label: 'Book Deleted',   badge: 'badge-red'     },
  add_member:    { icon: UserPlus,  color: 'var(--emerald)',      label: 'Member Added',   badge: 'badge-emerald' },
  delete_member: { icon: Trash2,    color: 'var(--red)',          label: 'Member Removed', badge: 'badge-red'     },
  borrow_request:{ icon: BookDown,  color: '#60a5fa',             label: 'Request',        badge: 'badge-gray'    },
  borrow_rejected:{ icon: BookDown, color: 'var(--red)',          label: 'Rejected',       badge: 'badge-red'     },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityLog() {
  const [logs, setLogs]     = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity');
      setLogs(res.data);
    } catch(_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const types = ['all', 'borrow', 'return', 'add_book', 'delete_book', 'add_member', 'delete_member'];
  const visible = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  const clearLogs = async () => {
    if (!window.confirm('Clear all activity logs?')) return;
    try {
      await api.delete('/activity');
      setLogs([]);
    } catch(_) {}
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Activity Log</h1>
          <p>A record of all library operations</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button className="btn btn-danger btn-sm" onClick={clearLogs}>
            <Trash2 size={13}/> Clear Log
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {types.map(t => (
          <button key={t}
            style={{
              padding:'5px 14px', borderRadius:20, border:'1px solid var(--border)',
              background: filter === t ? 'var(--amber)' : 'var(--bg-card)',
              color: filter === t ? '#000' : 'var(--text-secondary)',
              fontSize:12, fontWeight:600, cursor:'pointer',
              fontFamily:'Inter,sans-serif', transition:'all 0.15s',
            }}
            onClick={() => setFilter(t)}>
            {t === 'all' ? 'All' : (TYPE_CONFIG[t]?.label || t)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <Activity size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
            <h3>No activity yet</h3>
            <p>Actions like borrowing, returning, and adding books will appear here.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {visible.map((log, i) => {
              const cfg = TYPE_CONFIG[log.type] || { icon: Activity, color:'var(--text-muted)', badge:'badge-gray', label: log.type };
              const Icon = cfg.icon;
              return (
                <div key={log._id} style={{
                  display:'flex', alignItems:'flex-start', gap:14,
                  padding:'14px 0',
                  borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                  animation:'rowIn 0.3s ease both',
                  animationDelay:`${i * 0.03}s`,
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background:`${cfg.color}18`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon size={16} color={cfg.color}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span className={`badge ${cfg.badge}`} style={{ fontSize:10 }}>{cfg.label}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{timeAgo(log.createdAt)}</span>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-primary)', margin:0, lineHeight:1.5 }}>{log.message}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', margin:'2px 0 0' }}>
                      {new Date(log.createdAt).toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
