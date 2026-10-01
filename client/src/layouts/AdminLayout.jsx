import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const LINKS = [
  { to: '/admin', icon: 'chart', label: 'Overview', end: true },
  { to: '/admin/orders', icon: 'receipt', label: 'Orders' },
  { to: '/admin/products', icon: 'box', label: 'Products' },
  { to: '/admin/categories', icon: 'tag', label: 'Categories' },
  { to: '/admin/customers', icon: 'users', label: 'Customers' },
  { to: '/admin/settings', icon: 'settings', label: 'Store settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings: s } = useSettings();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => setOpen(false), [loc.pathname]);

  const current = LINKS.find((l) => (l.end ? loc.pathname === l.to : loc.pathname.startsWith(l.to)));

  return (
    <div className={`admin ${open ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <Link to="/admin" className="brand"><span className="brand-mark">{s.logoEmoji}</span>{s.storeName}</Link>
        <nav>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}><Icon name={l.icon} size={19} />{l.label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Link to="/" className="sidebar-store"><Icon name="store" size={19} />View store<Icon name="external" size={14} /></Link>
          <div className="sidebar-user">
            <span className="avatar">{user.name[0]}</span>
            <div><strong>{user.name}</strong><span>{user.email}</span></div>
            <button className="icon-btn" aria-label="Log out" onClick={() => { logout(); nav('/login'); }}><Icon name="logout" size={18} /></button>
          </div>
        </div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} />

      <div className="admin-main">
        <header className="admin-top">
          <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <h1>{current?.label || 'Dashboard'}</h1>
          <ThemeToggle />
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
