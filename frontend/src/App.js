import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, BookMarked,
  BookDown, Sun, Moon, Wifi,
  LogOut, Activity, Shield, GraduationCap,
} from 'lucide-react';

import { getSession, logout } from './utils/auth';

// Pages — shared
import LoginPage      from './pages/LoginPage';
import CatalogPage    from './pages/CatalogPage';
import MyBooksPage    from './pages/MyBooksPage';

// Admin pages
import Dashboard      from './pages/Dashboard';
import MembersPage    from './pages/MembersPage';
import BorrowPage     from './pages/BorrowPage';
import ActivityLog    from './pages/ActivityLog';

// Student pages
import StudentDashboard from './pages/StudentDashboard';

// ── Nav config per role ───────────────────────────────────────────────────────
const ADMIN_NAV = [
  { label: 'Main', items: [
    { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, exact: true },
    { to: '/activity',  label: 'Activity Log', icon: Activity },
  ]},
  { label: 'Catalog', items: [
    { to: '/catalog',   label: 'Book Catalog', icon: BookOpen },
  ]},
  { label: 'Members', items: [
    { to: '/members',   label: 'Members',      icon: Users },
    { to: '/my-books',  label: 'Member Books', icon: BookMarked },
  ]},
  { label: 'Circulation', items: [
    { to: '/borrow',    label: 'Borrow Book',  icon: BookDown },
  ]},
];

const STUDENT_NAV = [
  { label: 'Main', items: [
    { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  ]},
  { label: 'Library', items: [
    { to: '/catalog',   label: 'Browse Catalog', icon: BookOpen },
    { to: '/my-books',  label: 'My Books',        icon: BookMarked },
  ]},
];

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/catalog':   'Book Catalog',
  '/members':   'Members',
  '/my-books':  'My Books',
  '/borrow':    'Borrow Book',
  '/activity':  'Activity Log',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hh = ((h % 12) || 12).toString().padStart(2, '0');
      setTime(`${hh}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} ${ampm}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="topbar-clock">{time}</span>;
}

function Topbar({ theme, onToggle, user, onLogout }) {
  const loc = useLocation();
  const title = PAGE_TITLES[loc.pathname] || 'LBBS';
  return (
    <header className="topbar">
      {/* Logo + name moved here from sidebar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:20 }}>
        <div style={{
          width:34, height:34, borderRadius:9,
          background:'linear-gradient(135deg,var(--amber),var(--amber-dark))',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, boxShadow:'0 2px 8px rgba(245,158,11,0.35)',
        }}>
          <img src="/books-pile.png" alt="LBBS" style={{ width:24, height:24, objectFit:'contain' }}/>
        </div>
        <div style={{ lineHeight:1 }}>
          <div style={{
            fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:900,
            background:'linear-gradient(120deg,var(--amber),var(--violet-light))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>LBBS</div>
          <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
            Makerere University
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width:1, height:28, background:'var(--border)', marginRight:16 }}/>

      <span className="topbar-page-title">{title}</span>
      <div className="topbar-spacer"/>
      <LiveClock/>
      <div className="topbar-badge">
        <div className="pulse-dot"/>
        <Wifi size={11}/>
        System Online
      </div>
      <button className="theme-toggle" onClick={onToggle} title="Toggle theme">
        {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
      </button>
      <button className="theme-toggle" onClick={onLogout} title="Logout" style={{ color:'var(--red)' }}>
        <LogOut size={16}/>
      </button>
    </header>
  );
}

function Sidebar({ user }) {
  const nav = user.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;
  const isAdmin = user.role === 'admin';
  const avatarBg = isAdmin
    ? 'linear-gradient(135deg,var(--amber),var(--amber-dark))'
    : 'linear-gradient(135deg,var(--violet),#6d28d9)';
  const roleColor = isAdmin ? 'var(--amber)' : 'var(--violet-light)';
  const roleLabel = isAdmin ? 'Librarian' : 'Student';
  const RoleIcon  = isAdmin ? Shield : GraduationCap;

  return (
    <aside className="sidebar">
      {/* ── Big profile section ── */}
      <div style={{
        padding:'24px 20px 20px',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        background: isAdmin
          ? 'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.07) 0%,transparent 70%)'
          : 'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.07) 0%,transparent 70%)',
      }}>

        {/* Avatar — fixed 86px container, ring stays inside */}
        <div style={{ position:'relative', width:86, height:86, flexShrink:0 }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            background: isAdmin
              ? 'conic-gradient(from 0deg,var(--amber),var(--amber-dark),transparent 50%,transparent 80%,var(--amber))'
              : 'conic-gradient(from 0deg,var(--violet),var(--violet-light),transparent 50%,transparent 80%,var(--violet))',
            animation:'spin 3s linear infinite',
          }}/>
          <div style={{ position:'absolute', inset:3, borderRadius:'50%', background:'#0e0c0a' }}/>
          <div style={{
            position:'absolute', inset:5, borderRadius:'50%',
            background: avatarBg,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, fontWeight:900, color:'#fff',
            fontFamily:"'Playfair Display',serif",
          }}>
            {user.name[0].toUpperCase()}
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontSize:14, fontWeight:700, color:'var(--text-primary)',
          fontFamily:"'Playfair Display',serif",
          lineHeight:1.3, textAlign:'center',
        }}>
          {user.name}
        </div>

        {/* Role badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:5,
          background: isAdmin ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
          border:`1px solid ${isAdmin ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.25)'}`,
          color: roleColor,
          fontSize:9, fontWeight:700,
          padding:'4px 12px', borderRadius:20,
          textTransform:'uppercase', letterSpacing:'1px',
        }}>
          <RoleIcon size={9}/>
          {roleLabel}
        </div>
      </div>

      {/* ── Nav sections ── */}
      <div style={{ paddingTop:8 }}>
      {nav.map(section => (
        <div key={section.label}>
          {section.items.map(({ to, label, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <div className="nav-icon-box">
                <Icon size={15} style={{ flexShrink:0 }}/>
              </div>
              {label}
            </NavLink>
          ))}
        </div>
      ))}
      </div>

      <div className="sidebar-bookshelf">
        <img src="/books-pile.png" alt="Books"
          style={{ width:'100%', maxWidth:140, display:'block', margin:'0 auto', opacity:0.45, filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}/>
        <div style={{ textAlign:'center', marginTop:10 }}>
          <div style={{
            fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:900,
            background:'linear-gradient(120deg,var(--amber),var(--violet-light))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            letterSpacing:'1px',
          }}>LBBS</div>
          <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1.5px', marginTop:2 }}>
            Library Book<br/>Borrowing System
          </div>
        </div>
      </div>
    </aside>
  );
}

function PageWrapper({ children }) {
  const loc = useLocation();
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState(children);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => { setContent(children); setVisible(true); }, 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}>
      {content}
    </div>
  );
}

// ── Student-only catalog (read-only, no delete) ───────────────────────────────
// CatalogPage already handles this via the role prop
function StudentCatalog() {
  return <CatalogPage readOnly />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(() => getSession());
  const [theme, setTheme] = useState(() => localStorage.getItem('lbbs-theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('lbbs-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { logout(); setUser(null); };

  // Not logged in → show login page
  if (!user) {
    return (
      <BrowserRouter>
        <LoginPage onLogin={handleLogin}/>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar user={user}/>
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          <Topbar theme={theme} onToggle={toggleTheme} user={user} onLogout={handleLogout}/>
          <main className="main">
            <PageWrapper>
              {user.role === 'admin' ? (
                <Routes>
                  <Route path="/"         element={<Dashboard/>}/>
                  <Route path="/catalog"  element={<CatalogPage/>}/>
                  <Route path="/members"  element={<MembersPage/>}/>
                  <Route path="/borrow"   element={<BorrowPage/>}/>
                  <Route path="/my-books" element={<MyBooksPage/>}/>
                  <Route path="/activity" element={<ActivityLog/>}/>
                  <Route path="*"         element={<Navigate to="/" replace/>}/>
                </Routes>
              ) : (
                <Routes>
                  <Route path="/"         element={<StudentDashboard/>}/>
                  <Route path="/catalog"  element={<StudentCatalog/>}/>
                  <Route path="/my-books" element={<MyBooksPage studentId={user.memberId}/>}/>
                  <Route path="*"         element={<Navigate to="/" replace/>}/>
                </Routes>
              )}
            </PageWrapper>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
