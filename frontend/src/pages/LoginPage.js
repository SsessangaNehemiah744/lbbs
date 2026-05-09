import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, LogIn, UserPlus, Shield, GraduationCap } from 'lucide-react';
import { loginAdmin, loginStudent, signupStudent } from '../utils/auth';

export default function LoginPage({ onLogin }) {
  const [tab, setTab]       = useState('admin'); // 'admin' | 'student'
  const [mode, setMode]     = useState('login'); // 'login' | 'signup'  (student only)
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Admin fields
  const [adminUser, setAdminUser] = useState('');
  const [adminPwd,  setAdminPwd]  = useState('');

  // Student login fields
  const [stuId,  setStuId]  = useState('');
  const [stuPwd, setStuPwd] = useState('');

  // Student signup fields
  const [sigName,  setSigName]  = useState('');
  const [sigId,    setSigId]    = useState('');
  const [sigEmail, setSigEmail] = useState('');
  const [sigPwd,   setSigPwd]   = useState('');
  const [sigPwd2,  setSigPwd2]  = useState('');

  const clearError = () => setError('');

  const handleAdminLogin = async e => {
    e.preventDefault(); clearError(); setLoading(true);
    const res = await loginAdmin(adminUser.trim(), adminPwd);
    if (res.ok) onLogin(res.user);
    else setError(res.error);
    setLoading(false);
  };

  const handleStudentLogin = async e => {
    e.preventDefault(); clearError(); setLoading(true);
    const res = await loginStudent(stuId.trim(), stuPwd);
    if (res.ok) onLogin(res.user);
    else setError(res.error);
    setLoading(false);
  };

  const handleSignup = async e => {
    e.preventDefault(); clearError();
    if (sigPwd !== sigPwd2) { setError('Passwords do not match.'); return; }
    if (sigPwd.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const res = await signupStudent({ name: sigName, studentId: sigId, email: sigEmail, password: sigPwd });
    if (res.ok) onLogin(res.user);
    else setError(res.error);
    setLoading(false);
  };

  return (
    <div style={S.page}>
      {/* Background decoration */}
      <div style={S.bgBlob1}/>
      <div style={S.bgBlob2}/>

      <div style={S.container}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>
            <BookOpen size={28} color="#000"/>
          </div>
          <div>
            <h1 style={S.logoTitle}>LBBS</h1>
            <p style={S.logoSub}>Makerere University Library</p>
          </div>
        </div>

        {/* Card */}
        <div style={S.card}>
          {/* Tab switcher */}
          <div style={S.tabs}>
            <button style={{ ...S.tab, ...(tab === 'admin' ? S.tabActive : {}) }}
              onClick={() => { setTab('admin'); setMode('login'); clearError(); }}>
              <Shield size={14}/> Librarian
            </button>
            <button style={{ ...S.tab, ...(tab === 'student' ? S.tabActive : {}) }}
              onClick={() => { setTab('student'); setMode('login'); clearError(); }}>
              <GraduationCap size={14}/> Student
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>{error}</div>
          )}

          {/* ── Admin Login ── */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin} style={S.form}>
              <p style={S.formHint}>Sign in with your librarian credentials.</p>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={adminUser} onChange={e => setAdminUser(e.target.value)}
                  placeholder="admin" autoComplete="username"/>
              </div>
              <div className="form-group" style={{ position:'relative' }}>
                <label className="form-label">Password</label>
                <input className="form-input" type={showPwd ? 'text' : 'password'}
                  value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ paddingRight:42 }}/>
                <button type="button" style={S.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }}
                type="submit" disabled={loading}>
                <LogIn size={15}/> {loading ? 'Signing in…' : 'Sign In as Librarian'}
              </button>
              <p style={S.hint}>Username: <code style={S.code}>tabitha.lib</code> · Password: <code style={S.code}>Lib@Mak2025</code></p>
            </form>
          )}

          {/* ── Student Login / Signup ── */}
          {tab === 'student' && (
            <>
              {/* Mode toggle */}
              <div style={S.modeToggle}>
                <button style={{ ...S.modeBtn, ...(mode === 'login' ? S.modeBtnActive : {}) }}
                  onClick={() => { setMode('login'); clearError(); }}>Sign In</button>
                <button style={{ ...S.modeBtn, ...(mode === 'signup' ? S.modeBtnActive : {}) }}
                  onClick={() => { setMode('signup'); clearError(); }}>Create Account</button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleStudentLogin} style={S.form}>
                  <p style={S.formHint}>Sign in with your Student ID and password.</p>
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input className="form-input" value={stuId} onChange={e => setStuId(e.target.value)}
                      placeholder="e.g. M001" autoComplete="username"/>
                  </div>
                  <div className="form-group" style={{ position:'relative' }}>
                    <label className="form-label">Password</label>
                    <input className="form-input" type={showPwd ? 'text' : 'password'}
                      value={stuPwd} onChange={e => setStuPwd(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password"
                      style={{ paddingRight:42 }}/>
                    <button type="button" style={S.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }}
                    type="submit" disabled={loading}>
                    <LogIn size={15}/> {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                  <p style={S.hint}>No account? <span style={S.link} onClick={() => { setMode('signup'); clearError(); }}>Create one →</span></p>
                </form>
              ) : (
                <form onSubmit={handleSignup} style={S.form}>
                  <p style={S.formHint}>Register a new student account.</p>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={sigName} onChange={e => setSigName(e.target.value)} placeholder="Your full name"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input className="form-input" value={sigId} onChange={e => setSigId(e.target.value)} placeholder="e.g. 22/U/1234"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={sigEmail} onChange={e => setSigEmail(e.target.value)} placeholder="you@students.mak.ac.ug"/>
                  </div>
                  <div className="form-group" style={{ position:'relative' }}>
                    <label className="form-label">Password</label>
                    <input className="form-input" type={showPwd ? 'text' : 'password'}
                      value={sigPwd} onChange={e => setSigPwd(e.target.value)}
                      placeholder="Min. 6 characters" style={{ paddingRight:42 }}/>
                    <button type="button" style={S.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-input" type="password" value={sigPwd2}
                      onChange={e => setSigPwd2(e.target.value)} placeholder="Repeat password"/>
                  </div>
                  <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }}
                    type="submit" disabled={loading}>
                    <UserPlus size={15}/> {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                  <p style={S.hint}>Already have an account? <span style={S.link} onClick={() => { setMode('login'); clearError(); }}>Sign in →</span></p>
                </form>
              )}
            </>
          )}
        </div>

        <p style={S.footer}>© {new Date().getFullYear()} Makerere University Library</p>
      </div>
      <style>{CSS}</style>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bgBlob1: {
    position: 'absolute', top: '-20%', right: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'absolute', bottom: '-20%', left: '-10%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
    position: 'relative', zIndex: 1,
    animation: 'loginIn 0.4s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 14,
  },
  logoIcon: {
    width: 52, height: 52,
    background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))',
    borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
  },
  logoTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, fontWeight: 900,
    background: 'linear-gradient(120deg, var(--amber), var(--violet-light))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  logoSub: {
    fontSize: 11, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2,
  },
  card: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  tabs: {
    display: 'flex', gap: 8, marginBottom: 20,
    background: 'var(--bg-surface)',
    borderRadius: 10, padding: 4,
  },
  tab: {
    flex: 1, padding: '9px 0',
    background: 'transparent', border: 'none',
    borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
  },
  tabActive: {
    background: 'var(--bg-card)',
    color: 'var(--amber)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  modeToggle: {
    display: 'flex', gap: 0, marginBottom: 16,
    borderBottom: '1px solid var(--border)',
  },
  modeBtn: {
    flex: 1, padding: '8px 0',
    background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
    marginBottom: -1,
  },
  modeBtnActive: {
    color: 'var(--amber)',
    borderBottomColor: 'var(--amber)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  formHint: { fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 13, marginBottom: 12,
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%',
    background: 'none', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    padding: 0,
  },
  hint: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' },
  link: { color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 },
  code: {
    background: 'rgba(255,255,255,0.07)', padding: '1px 6px',
    borderRadius: 4, fontFamily: 'monospace', fontSize: 11,
  },
  footer: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
};

const CSS = `
@keyframes loginIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
