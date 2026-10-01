import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { settings: s } = useSettings();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);

  const search = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/shop?keyword=${encodeURIComponent(q.trim())}` : '/shop');
  };

  return (
    <div className="store">
      <a href="#main" className="skip">Skip to content</a>
      {s.announcementOn && s.announcement && <div className="announce">{s.announcement}</div>}

      <header className="topbar">
        <div className="topbar-inner">
          <button className="icon-btn only-mobile" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
          <Link to="/" className="brand"><span className="brand-mark">{s.logoEmoji}</span>{s.storeName}</Link>

          <form className="searchbar" onSubmit={search} role="search">
            <Icon name="search" size={18} />
            <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
          </form>

          <nav className={`mainnav ${open ? 'open' : ''}`}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            {user && <NavLink to="/orders">My orders</NavLink>}
            {user?.isAdmin && <NavLink to="/admin" className="nav-admin">Dashboard</NavLink>}
            {user ? (
              <>
                <NavLink to="/profile" className="only-mobile">Profile</NavLink>
                <button className="linkish only-mobile" onClick={() => { logout(); nav('/'); }}>Log out</button>
              </>
            ) : (
              <NavLink to="/login" className="only-mobile">Log in</NavLink>
            )}
          </nav>

          <div className="topbar-actions">
            <ThemeToggle />
            {user ? (
              <div className="usermenu only-desktop">
                <Link to="/profile" className="icon-btn" aria-label="Profile"><Icon name="user" /></Link>
                <button className="icon-btn" onClick={() => { logout(); nav('/'); }} aria-label="Log out"><Icon name="logout" /></button>
              </div>
            ) : (
              <Link to="/login" className="btn small only-desktop">Log in</Link>
            )}
            <Link to="/cart" className="icon-btn cartbtn" aria-label={`Cart, ${count} items`}>
              <Icon name="cart" />
              {count > 0 && <b>{count}</b>}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="page">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <Link to="/" className="brand"><span className="brand-mark">{s.logoEmoji}</span>{s.storeName}</Link>
            <p className="muted">{s.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">All products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Track my orders</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            {s.contactPhone && <span><Icon name="phone" size={16} /> {s.contactPhone}</span>}
            {s.contactEmail && <a href={`mailto:${s.contactEmail}`}><Icon name="mail" size={16} /> {s.contactEmail}</a>}
            {s.address && <span><Icon name="pin" size={16} /> {s.address}</span>}
          </div>
          {(s.whatsapp || s.instagram || s.facebook) && (
            <div className="footer-col">
              <h4>Follow</h4>
              {s.whatsapp && <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            </div>
          )}
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} {s.storeName}</span>
          {s.footerText && <span>{s.footerText}</span>}
        </div>
      </footer>
    </div>
  );
}
