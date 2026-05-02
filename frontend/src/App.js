import React, { useState } from 'react';
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

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h1>Library<br/>System</h1>
          <span>LBBS v1.0 — Makerere</span>
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
              <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>IST 3205 &middot; Group 3</p>
          <p><strong>Makerere University</strong></p>
        </div>
      </aside>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IST 3205 — Group 3</span>
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
