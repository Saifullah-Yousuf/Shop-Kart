import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Icon from '../../components/Icon';
import { Loader } from '../../components/Bits';
import { useUI } from '../../context/UIContext';

function Row({ c, onSaved, onDelete }) {
  const [f, setF] = useState({ icon: c.icon, name: c.name, order: c.order });
  const dirty = f.icon !== c.icon || f.name !== c.name || Number(f.order) !== c.order;
  return (
    <li className="catedit">
      <input className="emoji-in" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} aria-label="Icon" maxLength={4} />
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Category name" />
      <input type="number" className="order-in" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} aria-label="Sort order" />
      <span className="muted nowrap">{c.productCount} products</span>
      <button className="btn small" disabled={!dirty} onClick={() => onSaved(c._id, { ...f, order: Number(f.order) })}>Save</button>
      <button className="icon-btn danger-text" onClick={() => onDelete(c)} aria-label={`Delete ${c.name}`}><Icon name="trash" size={18} /></button>
    </li>
  );
}

export default function AdminCategories() {
  const [cats, setCats] = useState(null);
  const [f, setF] = useState({ icon: '🛍️', name: '' });
  const { toast, confirm } = useUI();
  const load = () => api.get('/categories').then((r) => setCats(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try { await api.post('/categories', { ...f, order: (cats?.length || 0) + 1 }); setF({ icon: '🛍️', name: '' }); toast('Category added'); load(); }
    catch (err) { toast(errMsg(err), 'error'); }
  };
  const save = async (id, body) => {
    try { await api.put(`/categories/${id}`, body); toast('Category saved'); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const del = async (c) => {
    if (!(await confirm({ title: `Delete “${c.name}”?`, confirmText: 'Delete', danger: true }))) return;
    try { await api.delete(`/categories/${c._id}`); toast('Category deleted'); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <div className="narrow left">
      <form className="panel catadd" onSubmit={add}>
        <input className="emoji-in" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} aria-label="Icon" maxLength={4} />
        <input placeholder="New category name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required aria-label="Category name" />
        <button className="btn"><Icon name="plus" size={18} /> Add</button>
      </form>
      <p className="muted">Renaming a category also moves its products. Lower order numbers show first on the homepage.</p>
      {!cats ? <Loader /> : (
        <ul className="panel catlist">
          {cats.map((c) => <Row key={c._id + c.name + c.order + c.icon} c={c} onSaved={save} onDelete={del} />)}
        </ul>
      )}
    </div>
  );
}
