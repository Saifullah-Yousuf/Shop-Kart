import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Icon from '../../components/Icon';
import ImageField from '../../components/ImageField';
import ProductImage from '../../components/ProductImage';
import { Empty, Field, Loader, Modal, Pagination, Toggle } from '../../components/Bits';
import { useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';
import { money } from '../../utils/format';

const EMPTY = { name: '', description: '', price: '', comparePrice: '', category: '', image: '', countInStock: '', featured: false };

function ProductForm({ initial, cats, onSaved, onClose }) {
  const [f, setF] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY, category: cats[0]?.name || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const body = { ...f, price: Number(f.price), comparePrice: Number(f.comparePrice) || 0, countInStock: Number(f.countInStock) };
    try {
      const { data } = initial ? await api.put(`/products/${initial._id}`, body) : await api.post('/products', body);
      onSaved(data, !initial);
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <Modal title={initial ? 'Edit product' : 'Add product'} onClose={onClose} wide>
      <form onSubmit={submit} className="stack">
        {error && <p className="alert error">{error}</p>}
        <Field label="Photo"><ImageField value={f.image} onChange={(image) => setF({ ...f, image })} /></Field>
        <Field label="Name"><input value={f.name} onChange={set('name')} required /></Field>
        <div className="grid2">
          <Field label="Category">
            <select value={f.category} onChange={set('category')}>
              {cats.map((c) => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
              {f.category && !cats.some((c) => c.name === f.category) && <option value={f.category}>{f.category}</option>}
            </select>
          </Field>
          <Field label="Stock"><input type="number" min="0" value={f.countInStock} onChange={set('countInStock')} required /></Field>
          <Field label="Price (Rs.)"><input type="number" min="0" value={f.price} onChange={set('price')} required /></Field>
          <Field label="Old price (optional)" hint="Shown crossed out to mark a sale"><input type="number" min="0" value={f.comparePrice} onChange={set('comparePrice')} /></Field>
        </div>
        <Field label="Description"><textarea rows="3" value={f.description} onChange={set('description')} /></Field>
        <Toggle checked={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Feature on homepage" />
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminProducts() {
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState({ keyword: '', category: '', page: 1 });
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const { settings: s } = useSettings();
  const { toast, confirm } = useUI();

  const load = () =>
    api.get('/products', { params: { ...q, limit: 15 } }).then((r) => setData(r.data)).catch((e) => toast(errMsg(e), 'error'));

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const del = async (p) => {
    if (!(await confirm({ title: `Delete “${p.name}”?`, message: 'Past orders keep their copy of this product.', confirmText: 'Delete', danger: true }))) return;
    try { await api.delete(`/products/${p._id}`); toast('Product deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const toggleFeatured = async (p) => {
    try { await api.put(`/products/${p._id}`, { featured: !p.featured }); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <div className="toolbar">
        <div className="searchbar inline"><Icon name="search" size={18} />
          <input placeholder="Search products" value={q.keyword} onChange={(e) => setQ({ ...q, keyword: e.target.value, page: 1 })} aria-label="Search products" />
        </div>
        <select value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value, page: 1 })} aria-label="Filter by category">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <button className="btn" onClick={() => setEditing('new')}><Icon name="plus" size={18} /> Add product</button>
      </div>

      {!data ? <Loader /> : data.products.length === 0 ? (
        <Empty title="No products found" text="Add your first product or change the search." action={<button className="btn" onClick={() => setEditing('new')}>Add product</button>} />
      ) : (
        <div className="panel flush">
          <div className="table-wrap">
            <table className="ptable">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td><div className="cell-product"><ProductImage product={p} /><div><strong>{p.name}</strong><span className="muted">{p.sold} sold</span></div></div></td>
                    <td>{p.category}</td>
                    <td>{money(p.price, s.currency)}{p.comparePrice > p.price && <s className="muted block">{money(p.comparePrice, s.currency)}</s>}</td>
                    <td><span className={p.countInStock === 0 ? 'danger-text' : p.countInStock <= s.lowStockThreshold ? 'warn-text' : ''}>{p.countInStock}</span></td>
                    <td>
                      <button className={`icon-btn star ${p.featured ? 'on' : ''}`} onClick={() => toggleFeatured(p)} aria-label={p.featured ? 'Remove from homepage' : 'Feature on homepage'} aria-pressed={p.featured}>
                        <Icon name="star" size={18} fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <div className="row end">
                        <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Icon name="edit" size={18} /></button>
                        <button className="icon-btn danger-text" onClick={() => del(p)} aria-label={`Delete ${p.name}`}><Icon name="trash" size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={(page) => setQ({ ...q, page })} />
        </div>
      )}

      {editing && (
        <ProductForm initial={editing === 'new' ? null : editing} cats={cats} onClose={() => setEditing(null)}
          onSaved={(p, isNew) => { setEditing(null); toast(isNew ? 'Product added' : 'Changes saved'); load(); }} />
      )}
    </>
  );
}
