import React, { useState, useEffect, useCallback } from 'react';
import { BookDown, CheckCircle, AlertCircle, Clock, X, RefreshCw, User, BookOpen } from 'lucide-react';
import { borrowBook, getBorrowRequests, approveBorrowRequest, rejectBorrowRequest } from '../utils/api';

const COVER_COLORS = ['#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6','#fbbf24','#a78bfa','#34d399','#f87171','#60a5fa'];
function hashStr(str) { let h=0; for(const c of str) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h); }
function coverColor(str) { return COVER_COLORS[hashStr(str) % COVER_COLORS.length]; }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

/* ── Reject modal ── */
function RejectModal({ request, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  if (!request) return null;
  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onCancel}><X size={16}/></button>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:8 }}>Reject Request</h3>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
          Rejecting <strong>"{request.bookTitle}"</strong> for <strong>{request.memberName}</strong>.
          Optionally provide a reason.
        </p>
        <div className="form-group" style={{ marginBottom:16 }}>
          <label className="form-label">Reason (optional)</label>
          <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Book reserved for another member…" style={{ minHeight:70 }}/>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }}
            onClick={() => onConfirm(reason)}>
            <X size={14}/> Confirm Reject
          </button>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function BorrowPage() {
  const [tab, setTab]           = useState('requests'); // 'requests' | 'manual'
  const [requests, setRequests] = useState([]);
  const [filter, setFilter]     = useState('pending');
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [actionId, setActionId] = useState(null); // which request is being actioned
  const [rejectTarget, setRejectTarget] = useState(null);
  const [alert, setAlert]       = useState(null);

  // Manual borrow form
  const [bookId, setBookId]     = useState('');
  const [memberId, setMemberId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 6000); };

  const loadRequests = useCallback(async () => {
    setLoadingReqs(true);
    try {
      const res = await getBorrowRequests();
      setRequests(res.data);
    } catch(_) {}
    setLoadingReqs(false);
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  // Auto-refresh every 5 seconds to pick up new student requests
  useEffect(() => {
    const t = setInterval(loadRequests, 5000);
    return () => clearInterval(t);
  }, [loadRequests]);

  const handleApprove = async (borrowReq) => {
    const id = borrowReq._id || borrowReq.id;
    setActionId(id);
    try {
      await approveBorrowRequest(id);
      showAlert('success', `"${borrowReq.bookTitle}" approved for ${borrowReq.memberName}.`);
      loadRequests();
    } catch(err) {
      showAlert('error', err.message);
    }
    setActionId(null);
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    const id = rejectTarget._id || rejectTarget.id;
    setActionId(id);
    try {
      await rejectBorrowRequest(id, reason);
      showAlert('success', `Request for "${rejectTarget.bookTitle}" rejected.`);
      setRejectTarget(null);
      loadRequests();
    } catch(err) {
      showAlert('error', err.message);
    }
    setActionId(null);
  };

  const handleManualBorrow = async e => {
    e.preventDefault();
    if (!bookId || !memberId) return showAlert('error', 'Both Book ID and Member ID are required.');
    setManualLoading(true);
    try {
      const res = await borrowBook({ bookId: bookId.trim(), memberId: memberId.trim() });
      showAlert('success', res.data.message + ` Remaining copies: ${res.data.availableCopies}.`);
      setBookId(''); setMemberId('');
    } catch(err) { showAlert('error', err.message); }
    setManualLoading(false);
  };

  const visible = requests.filter(r => filter === 'all' ? true : r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Borrow Book</h1>
          <p>Manage student borrow requests and issue books manually</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadRequests}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:16 }}>
          {alert.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          <div>{alert.msg}</div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:24 }}>
        {[
          { key:'requests', label: pendingCount > 0 ? `Borrow Requests (${pendingCount} pending)` : 'Borrow Requests', icon: Clock },
          { key:'manual',   label: 'Manual Issue', icon: BookDown },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:'10px 20px', background:'transparent', border:'none',
            borderBottom: tab === key ? '2px solid var(--amber)' : '2px solid transparent',
            color: tab === key ? 'var(--amber)' : 'var(--text-secondary)',
            fontSize:13, fontWeight:600, cursor:'pointer', display:'flex',
            alignItems:'center', gap:7, fontFamily:'Inter,sans-serif',
            marginBottom:-1, transition:'color 0.2s',
          }}>
            <Icon size={14}/> {label}
            {key === 'requests' && pendingCount > 0 && (
              <span style={{
                background:'var(--amber)', color:'#000', fontSize:10, fontWeight:800,
                padding:'1px 7px', borderRadius:20, marginLeft:2,
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Borrow Requests tab ── */}
      {tab === 'requests' && (
        <>
          {/* Filter pills */}
          <div style={{ display:'flex', gap:8, marginBottom:18 }}>
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:'5px 16px', borderRadius:20, border:'1px solid var(--border)',
                background: filter === f ? 'var(--amber)' : 'var(--bg-card)',
                color: filter === f ? '#000' : 'var(--text-secondary)',
                fontSize:12, fontWeight:600, cursor:'pointer',
                fontFamily:'Inter,sans-serif', transition:'all 0.15s',
                textTransform:'capitalize',
              }}>{f === 'all' ? 'All' : f}</button>
            ))}
          </div>

          {loadingReqs ? (
            <div className="loading-center"><div className="spinner"/></div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
              <h3>No {filter === 'all' ? '' : filter} requests</h3>
              <p>{filter === 'pending' ? 'No students are waiting for approval.' : 'Nothing to show here.'}</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {visible.map((req, i) => (
                <div key={req._id || req.id} style={{
                  background:'var(--bg-card)', border:`1px solid ${
                    req.status === 'pending'  ? 'rgba(96,165,250,0.35)' :
                    req.status === 'approved' ? 'rgba(16,185,129,0.35)' :
                    'rgba(239,68,68,0.25)'
                  }`,
                  borderRadius:14, padding:'16px 20px',
                  display:'flex', alignItems:'center', gap:16,
                  animation:'rowIn 0.3s ease both',
                  animationDelay:`${i*0.04}s`,
                }}>
                  {/* Book cover mini */}
                  <div style={{
                    width:44, height:58, borderRadius:6, flexShrink:0,
                    background: coverColor(req.bookId),
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, fontWeight:900, color:'rgba(0,0,0,0.35)',
                    fontFamily:"'Playfair Display',serif",
                    boxShadow:'2px 2px 10px rgba(0,0,0,0.4)',
                  }}>
                    {req.bookTitle[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:"'Playfair Display',serif" }}>
                        {req.bookTitle}
                      </span>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:20,
                        background:
                          req.status === 'pending'  ? 'rgba(96,165,250,0.15)'  :
                          req.status === 'approved' ? 'rgba(16,185,129,0.15)'  :
                          'rgba(239,68,68,0.15)',
                        color:
                          req.status === 'pending'  ? '#60a5fa'       :
                          req.status === 'approved' ? 'var(--emerald)' :
                          'var(--red)',
                        border: `1px solid ${
                          req.status === 'pending'  ? 'rgba(96,165,250,0.3)'   :
                          req.status === 'approved' ? 'rgba(16,185,129,0.3)'   :
                          'rgba(239,68,68,0.3)'
                        }`,
                        textTransform:'capitalize',
                      }}>{req.status}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-secondary)', marginBottom:2 }}>
                      <User size={11}/> {req.memberName}
                      <span style={{ color:'var(--text-muted)' }}>·</span>
                      <span className="badge badge-violet" style={{ fontSize:9 }}>{req.memberId}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-muted)' }}>
                      <BookOpen size={10}/> {req.bookId}
                      <span>·</span>
                      <Clock size={10}/> {timeAgo(req.createdAt)}
                    </div>
                    {req.reason && (
                      <div style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>
                        Reason: {req.reason}
                      </div>
                    )}
                  </div>

                  {/* Actions — only for pending */}
                  {req.status === 'pending' && (
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button
                        className="btn btn-sm"
                        style={{
                          background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)',
                          color:'var(--emerald)', padding:'6px 14px', fontSize:12,
                          opacity: actionId === req.id ? 0.6 : 1,
                        }}
                        disabled={actionId === (req._id || req.id)}
                        onClick={() => handleApprove(req)}>
                        <CheckCircle size={13}/> Approve
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{
                          background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                          color:'var(--red)', padding:'6px 14px', fontSize:12,
                          opacity: actionId === (req._id || req.id) ? 0.6 : 1,
                        }}
                        disabled={actionId === (req._id || req.id)}
                        onClick={() => setRejectTarget(req)}>
                        <X size={13}/> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Manual Issue tab ── */}
      {tab === 'manual' && (
        <div className="form-page-wrap">
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title"><BookDown size={15} style={{ marginRight:6 }}/>Issue a Book Directly</div>
              </div>
              <form onSubmit={handleManualBorrow}>
                <div className="form-grid" style={{ marginBottom:16 }}>
                  <div className="form-group">
                    <label className="form-label">Book ID</label>
                    <input className="form-input" value={bookId} onChange={e => setBookId(e.target.value)} placeholder="e.g. B001"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Member ID</label>
                    <input className="form-input" value={memberId} onChange={e => setMemberId(e.target.value)} placeholder="e.g. M001"/>
                  </div>
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={manualLoading}>
                  <BookDown size={15}/> {manualLoading ? 'Processing…' : 'Confirm Borrow'}
                </button>
              </form>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom:16 }}>How Borrowing Works</div>
            <div className="how-it-works-steps">
              {[
                { title:'Student Requests',    desc:'Student clicks Borrow on a book in the catalog.' },
                { title:'Librarian Reviews',   desc:'Request appears here with student and book details.' },
                { title:'Approve or Reject',   desc:'Librarian approves (issues book) or rejects with a reason.' },
                { title:'Student Notified',    desc:'Button turns green (approved) or red (rejected) for the student.' },
              ].map((s, i) => (
                <div className="step" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-text"><h5>{s.title}</h5><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RejectModal
        request={rejectTarget}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}

const S = {
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
  },
  modal: {
    background:'var(--bg-card)', border:'1px solid var(--border-accent)', borderRadius:16,
    padding:24, maxWidth:440, width:'100%', position:'relative',
    boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
    animation:'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
  },
  closeBtn: {
    position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.07)',
    border:'1px solid var(--border)', borderRadius:'50%', width:28, height:28,
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'var(--text-secondary)', cursor:'pointer',
  },
};
