import React, { useState } from 'react';
import { BookDown, CheckCircle, AlertCircle } from 'lucide-react';
import { borrowBook } from '../utils/api';

const STEPS = [
  { title:'Book Exists?',      desc:'Verify the book ID is in the catalog.' },
  { title:'Member Exists?',    desc:'Confirm the member is registered.' },
  { title:'No Duplicate?',     desc:"Check member doesn't already hold this book." },
  { title:'Copies Available?', desc:'Decrement available count and issue.' },
];

export default function BorrowPage() {
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
      const res = await borrowBook({ bookId: bookId.trim(), memberId: memberId.trim() });
      showAlert('success', res.data.message + ` Remaining copies: ${res.data.availableCopies}.`);
      setBookId(''); setMemberId('');
    } catch(e) { showAlert('error', e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Borrow Book</h1>
          <p>Issue a book to a registered library member</p>
        </div>
      </div>
      <div className="form-page-wrap">
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><BookDown size={15} style={{marginRight:6}}/>Issue a Book</div>
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
                <BookDown size={15}/> {loading?'Processing…':'Confirm Borrow'}
              </button>
            </form>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:20}}>
            <svg width="100%" viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="30" r="16" fill="#1f1c19" stroke="#a8997e" strokeWidth="1.5"/>
              <rect x="34" y="50" width="32" height="40" rx="6" fill="#1f1c19" stroke="#a8997e" strokeWidth="1.5"/>
              <rect x="100" y="35" width="30" height="40" rx="4" fill="#f59e0b"/>
              <rect x="102" y="37" width="26" height="36" rx="3" fill="#fbbf24" opacity="0.5"/>
              <line x1="90" y1="55" x2="145" y2="55" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4"/>
              <polygon points="143,49 155,55 143,61" fill="#f59e0b"/>
              <circle cx="210" cy="30" r="16" fill="#1a1410" stroke="#f59e0b" strokeWidth="1.5"/>
              <rect x="194" y="50" width="32" height="40" rx="6" fill="#1a1410" stroke="#f59e0b" strokeWidth="1.5"/>
              <text x="105" y="108" textAnchor="middle" fontSize="10" fill="#a8997e" fontFamily="Inter,sans-serif">Librarian</text>
              <text x="210" y="108" textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="Inter,sans-serif">Member</text>
            </svg>
          </div>
          <div className="card">
            <div className="card-title" style={{marginBottom:16}}>How Borrowing Works</div>
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
