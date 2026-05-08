import React, { useState } from 'react';
import { BookUp, CheckCircle, AlertCircle } from 'lucide-react';
import { returnBook } from '../utils/api';

const STEPS = [
  { title:'Book Exists?',   desc:'Verify the book ID is in the catalog.' },
  { title:'Member Exists?', desc:'Confirm the member is registered.' },
  { title:'Book on Loan?',  desc:'Confirm the member currently holds this book.' },
  { title:'Restore Copy',   desc:'Increment available count and update records.' },
];

export default function ReturnPage() {
  const [bookId, setBookId]     = useState('');
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);

  const showAlert = (type, msg) => { setAlert({type,msg}); setTimeout(()=>setAlert(null),6000); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!bookId||!memberId) return showAlert('error','Both Book ID and Member ID are required.');
    setLoading(true);
    try {
      const res = await returnBook({ bookId: bookId.trim(), memberId: memberId.trim() });
      showAlert('success', res.data.message + ` Available copies now: ${res.data.availableCopies}.`);
      setBookId(''); setMemberId('');
    } catch(e) { showAlert('error', e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Return Book</h1>
          <p>Process a book return from a library member</p>
        </div>
      </div>
      <div className="form-page-wrap">
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><BookUp size={15} style={{marginRight:6}}/>Process Return</div>
            </div>
            {alert && (
              <div className={`alert alert-${alert.type}`}>
                {alert.type==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}
                <div>{alert.msg}</div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{marginBottom:16}}>
                <div className="form-group">
                  <label className="form-label">Book ID</label>
                  <input className="form-input" value={bookId} onChange={e=>setBookId(e.target.value)} placeholder="e.g. B001"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Member ID</label>
                  <input className="form-input" value={memberId} onChange={e=>setMemberId(e.target.value)} placeholder="e.g. M001"/>
                </div>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                <BookUp size={15}/> {loading?'Processing…':'Confirm Return'}
              </button>
            </form>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:20}}>
            <svg width="100%" viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="70" cy="30" r="16" fill="#1a1410" stroke="#10b981" strokeWidth="1.5"/>
              <rect x="54" y="50" width="32" height="40" rx="6" fill="#1a1410" stroke="#10b981" strokeWidth="1.5"/>
              <rect x="120" y="35" width="30" height="40" rx="4" fill="#10b981"/>
              <rect x="122" y="37" width="26" height="36" rx="3" fill="#34d399" opacity="0.5"/>
              <line x1="160" y1="55" x2="215" y2="55" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4"/>
              <polygon points="162,49 150,55 162,61" fill="#10b981"/>
              <rect x="220" y="20" width="40" height="70" rx="4" fill="#1f1c19" stroke="#a8997e" strokeWidth="1.5"/>
              <rect x="224" y="30" width="32" height="6" rx="2" fill="#a8997e" opacity="0.5"/>
              <rect x="224" y="44" width="32" height="6" rx="2" fill="#a8997e" opacity="0.5"/>
              <rect x="224" y="58" width="32" height="6" rx="2" fill="#a8997e" opacity="0.5"/>
              <text x="70"  y="108" textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="Inter,sans-serif">Member</text>
              <text x="240" y="108" textAnchor="middle" fontSize="10" fill="#a8997e" fontFamily="Inter,sans-serif">Library</text>
            </svg>
          </div>
          <div className="card">
            <div className="card-title" style={{marginBottom:16}}>How Returns Work</div>
            <div className="how-it-works-steps">
              {STEPS.map((s,i) => (
                <div className="step" key={i}>
                  <div className="step-num">{i+1}</div>
                  <div className="step-text"><h5>{s.title}</h5><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
