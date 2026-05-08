import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Search, Users, BookMarked,
  BookDown, BookUp, Sun, Moon, Wifi
} from 'lucide-react';
import Dashboard   from './pages/Dashboard';
import CatalogPage from './pages/CatalogPage';
import MembersPage from './pages/MembersPage';
import BorrowPage  from './pages/BorrowPage';
import ReturnPage  from './pages/ReturnPage';
import SearchPage  from './pages/SearchPage';
import MyBooksPage from './pages/MyBooksPage';

const NAV_SECTIONS = [
  { label: 'Main', items: [
    { to: '/',        label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  ]},
  { label: 'Catalog', items: [
    { to: '/catalog', label: 'Book Catalog', icon: BookOpen },
    { to: '/search',  label: 'Search Books', icon: Search },
  ]},
  { label: 'Members', items: [
    { to: '/members', label: 'Members',      icon: Users },
    { to: '/my-books',label: 'My Books',     icon: BookMarked },
  ]},
  { label: 'Circulation', items: [
    { to: '/borrow',  label: 'Borrow Book',  icon: BookDown },
    { to: '/return',  label: 'Return Book',  icon: BookUp },
  ]},
];

const PAGE_TITLES = {
  '/':         'Dashboard',
  '/catalog':  'Book Catalog',
  '/search':   'Search Books',
  '/members':  'Members',
  '/my-books': 'My Books',
  '/borrow':   'Borrow Book',
  '/return':   'Return Book',
};

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hh = ((h % 12) || 12).toString().padStart(2,'0');
      setTime(`${hh}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} ${ampm}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="topbar-clock">{time}</span>;
}

function Topbar({ theme, onToggle }) {
  const loc = useLocation();
  const title = PAGE_TITLES[loc.pathname] || 'LBBS';
  return (
    <header className="topbar">
      <span className="topbar-page-title">{title}</span>
      <div className="topbar-spacer"/>
      <LiveClock/>
      <div className="topbar-badge">
        <div className="pulse-dot"/>
        <Wifi size={11}/>
        System Online
      </div>
      <button className="theme-toggle" onClick={onToggle} title="Toggle dark/light mode">
        {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
      </button>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{background:'none',padding:0,overflow:'hidden'}}>
          <img src="/books-pile.png" alt="LBBS" style={{width:40,height:40,objectFit:'contain'}}/>
        </div>
        <div className="sidebar-logo-text">
          <h3>LBBS</h3>
          <p>Makerere University</p>
        </div>
      </div>

      {/* Nav */}
      {NAV_SECTIONS.map(section => (
        <div key={section.label}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.items.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" style={{flexShrink:0}}/>
              {label}
            </NavLink>
          ))}
        </div>
      ))}

      {/* Bottom image */}
      <div className="sidebar-bookshelf">
        <img src="/books-pile.png" alt="Books" style={{width:'100%',maxWidth:160,display:'block',margin:'0 auto',opacity:0.55,filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'}}/>
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

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('lbbs-theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('lbbs-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar theme={theme} onToggle={toggleTheme}/>
          <main className="main">
            <PageWrapper>
              <Routes>
                <Route path="/"         element={<Dashboard/>}/>
                <Route path="/catalog"  element={<CatalogPage/>}/>
                <Route path="/members"  element={<MembersPage/>}/>
                <Route path="/borrow"   element={<BorrowPage/>}/>
                <Route path="/return"   element={<ReturnPage/>}/>
                <Route path="/search"   element={<SearchPage/>}/>
                <Route path="/my-books" element={<MyBooksPage/>}/>
              </Routes>
            </PageWrapper>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
