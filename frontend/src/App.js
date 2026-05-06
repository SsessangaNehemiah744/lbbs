import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen, Users, BookMarked, Search, LayoutDashboard,
  BookUp, BookDown, Menu, X, ChevronRight
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CatalogPage from './pages/CatalogPage';
import MembersPage from './pages/MembersPage';
import BorrowPage from './pages/BorrowPage';
import ReturnPage from './pages/ReturnPage';
import SearchPage from './pages/SearchPage';
import MyBooksPage from './pages/MyBooksPage';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/catalog', label: 'Book Catalog', icon: BookOpen },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/borrow', label: 'Borrow Book', icon: BookDown },
  { to: '/return', label: 'Return Book', icon: BookUp },
  { to: '/search', label: 'Search Books', icon: Search },
  { to: '/my-books', label: 'My Books', icon: BookMarked },
];

function PageTitle() {
  const loc = useLocation();
  const match = NAV.find((n) => (n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  return <span className="topbar-title">{match?.label || 'LBBS'}</span>;
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="topbar-clock">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// Inline SVG book icon for sidebar logo
function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}

// Sidebar decorative books illustration (inline SVG)
function BooksIllustration() {
  return (
    <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book 1 */}
      <rect x="8" y="10" width="18" height="44" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="8" y="10" width="4" height="44" rx="1" fill="#d97706" opacity="0.7"/>
      <line x1="12" y1="22" x2="22" y2="22" stroke="#0c0a09" strokeWidth="1" opacity="0.3"/>
      <line x1="12" y1="28" x2="22" y2="28" stroke="#0c0a09" strokeWidth="1" opacity="0.3"/>
      {/* Book 2 */}
      <rect x="28" y="6" width="16" height="48" rx="2" fill="#a78bfa" opacity="0.6"/>
      <rect x="28" y="6" width="4" height="48" rx="1" fill="#7c3aed" opacity="0.5"/>
      {/* Book 3 */}
      <rect x="46" y="14" width="20" height="40" rx="2" fill="#34d399" opacity="0.5"/>
      <rect x="46" y="14" width="4" height="40" rx="1" fill="#059669" opacity="0.5"/>
      {/* Book 4 */}
      <rect x="68" y="8" width="14" height="46" rx="2" fill="#f87171" opacity="0.5"/>
      <rect x="68" y="8" width="3" height="46" rx="1" fill="#dc2626" opacity="0.4"/>
      {/* Book 5 */}
      <rect x="84" y="16" width="18" height="38" rx="2" fill="#fbbf24" opacity="0.5"/>
      <rect x="84" y="16" width="4" height="38" rx="1" fill="#d97706" opacity="0.4"/>
      {/* Book 6 */}
      <rect x="104" y="10" width="14" height="44" rx="2" fill="#60a5fa" opacity="0.4"/>
      <rect x="104" y="10" width="3" height="44" rx="1" fill="#2563eb" opacity="0.4"/>
      {/* Shelf */}
      <rect x="4" y="54" width="132" height="4" rx="2" fill="#4a4540" opacity="0.5"/>
    </svg>
  );
}

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">
              <BookIcon />
            </div>
            <div>
              <h1>LBBS</h1>
              <span>Makerere University</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon className="icon" size={15} />
              {label}
              <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.25 }} />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-illustration">
          <BooksIllustration />
        </div>

        <div className="sidebar-footer">
          <p>IST 3205 &middot; Group 3</p>
          <p><strong>Library Book Borrowing System</strong></p>
        </div>
      </aside>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <header className="topbar">
            <PageTitle />
            <div className="topbar-actions">
              <LiveClock />
              <div className="topbar-badge">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }} />
                IST 3205 — Group 3
              </div>
            </div>
          </header>
          <main className="page">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/borrow" element={<BorrowPage />} />
              <Route path="/return" element={<ReturnPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-books" element={<MyBooksPage />} />
            </Routes>
          </main>
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen((o) => !o)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </BrowserRouter>
  );
}
