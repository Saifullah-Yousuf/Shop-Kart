import { useState } from 'react';
import { errMsg } from '../api';
import { Field } from '../components/Bits';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useUI();
  const [info, setInfo] = useState({ name: user.name, phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveInfo = async (e) => {
    e.preventDefault();
    try { await updateProfile(info); toast('Profile saved'); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    try { await updateProfile(pw); setPw({ currentPassword: '', newPassword: '' }); toast('Password changed'); } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <div className="narrow">
      <h1 className="page-title">Your profile</h1>
      <form className="panel stack" onSubmit={saveInfo}>
        <h3>Details</h3>
        <Field label="Email"><input value={user.email} disabled /></Field>
        <Field label="Full name"><input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required /></Field>
        <Field label="Phone"><input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} inputMode="tel" /></Field>
        <button className="btn">Save profile</button>
      </form>
      <form className="panel stack" onSubmit={savePw}>
        <h3>Change password</h3>
        <Field label="Current password"><input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required autoComplete="current-password" /></Field>
        <Field label="New password" hint="At least 6 characters"><input type="password" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required autoComplete="new-password" /></Field>
        <button className="btn">Change password</button>
      </form>
    </div>
  );
}
