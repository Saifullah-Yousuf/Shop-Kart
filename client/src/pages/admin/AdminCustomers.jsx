import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Icon from '../../components/Icon';
import { Loader } from '../../components/Bits';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';
import { money, shortDate } from '../../utils/format';

export default function AdminCustomers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const { user: me } = useAuth();
  const { settings: s } = useSettings();
  const { toast, confirm } = useUI();
  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { load(); }, []);

  const role = async (u) => {
    const make = !u.isAdmin;
    if (!(await confirm({ title: make ? `Make ${u.name} an admin?` : `Remove admin access from ${u.name}?`, message: make ? 'Admins can change products, orders and store settings.' : undefined, confirmText: make ? 'Make admin' : 'Remove access' }))) return;
    try { await api.put(`/users/${u._id}/role`, { isAdmin: make }); toast('Role updated'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const del = async (u) => {
    if (!(await confirm({ title: `Delete ${u.name}?`, message: 'Their past orders stay in the system.', confirmText: 'Delete', danger: true }))) return;
    try { await api.delete(`/users/${u._id}`); toast('User deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  if (!users) return <Loader />;
  const list = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="toolbar">
        <div className="searchbar inline"><Icon name="search" size={18} />
          <input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
        </div>
        <span className="muted">{users.length} accounts</span>
      </div>
      <div className="panel flush">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Role</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id}>
                  <td><div className="cell-product"><span className="avatar">{u.name[0]}</span><div><strong>{u.name}</strong><span className="muted">{u.email}</span></div></div></td>
                  <td className="muted nowrap">{shortDate(u.createdAt)}</td>
                  <td>{u.orders}</td>
                  <td>{money(u.spent, s.currency)}</td>
                  <td><span className={`badge ${u.isAdmin ? 's-processing' : ''}`}>{u.isAdmin ? 'Admin' : 'Customer'}</span></td>
                  <td>
                    {u._id !== me._id && (
                      <div className="row end">
                        <button className="btn ghost small" onClick={() => role(u)}>{u.isAdmin ? 'Remove admin' : 'Make admin'}</button>
                        <button className="icon-btn danger-text" onClick={() => del(u)} aria-label={`Delete ${u.name}`}><Icon name="trash" size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
