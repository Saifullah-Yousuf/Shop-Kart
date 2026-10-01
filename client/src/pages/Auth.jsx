import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errMsg } from '../api';
import { Field } from '../components/Bits';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

function AuthShell({ title, sub, children }) {
  const { settings: s } = useSettings();
  return (
    <div className="authwrap">
      <div className="authcard">
        <span className="brand-mark big">{s.logoEmoji}</span>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, login } = useAuth();
  const { settings: s } = useSettings();
  const nav = useNavigate();
  const loc = useLocation();

  if (user) return <Navigate to={user.isAdmin ? '/admin' : '/'} replace />;

  const go = async (email, password) => {
    setBusy(true); setError('');
    try {
      const u = await login(email, password);
      nav(loc.state?.from || (u.isAdmin ? '/admin' : '/'), { replace: true });
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" sub={`Log in to your ${s.storeName} account`}>
      <form onSubmit={(e) => { e.preventDefault(); go(f.email, f.password); }} className="stack">
        {error && <p className="alert error">{error}</p>}
        <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" /></Field>
        <Field label="Password"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required autoComplete="current-password" /></Field>
        <button className="btn big full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      {s.showDemoLogins && (
        <div className="demo">
          <span>Try a demo account</span>
          <div className="row">
            <button className="btn ghost small" onClick={() => go('admin@shopkart.com', 'admin123')} disabled={busy}>Admin</button>
            <button className="btn ghost small" onClick={() => go('user@shopkart.com', 'user123')} disabled={busy}>Customer</button>
          </div>
        </div>
      )}
      <p className="muted center">New here? <Link to="/register" className="textlink">Create an account</Link></p>
    </AuthShell>
  );
}

export function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, register } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register(f.name, f.email, f.password); nav('/'); } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <AuthShell title="Create your account" sub="Track orders and check out faster">
      <form onSubmit={submit} className="stack">
        {error && <p className="alert error">{error}</p>}
        <Field label="Full name"><input value={f.name} onChange={set('name')} required autoComplete="name" /></Field>
        <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required autoComplete="email" /></Field>
        <Field label="Password" hint="At least 6 characters"><input type="password" minLength={6} value={f.password} onChange={set('password')} required autoComplete="new-password" /></Field>
        <button className="btn big full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="muted center">Already have an account? <Link to="/login" className="textlink">Log in</Link></p>
    </AuthShell>
  );
}
