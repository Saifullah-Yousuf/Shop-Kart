import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { Empty, Loader, Pagination, Toggle } from '../components/Bits';

const SORTS = [
  ['newest', 'Newest'], ['popular', 'Best selling'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['name', 'Name A–Z'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keyword, setKeyword] = useState(params.get('keyword') || '');

  const get = (k) => params.get(k) || '';
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  const urlKeyword = get('keyword');
  useEffect(() => { setKeyword(urlKeyword); }, [urlKeyword]);

  // Debounce typing in the search box
  useEffect(() => {
    if (keyword === get('keyword')) return;
    const t = setTimeout(() => update({ keyword }), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  const queryString = params.toString();
  useEffect(() => {
    setData(null);
    const q = Object.fromEntries(new URLSearchParams(queryString));
    api.get('/products', { params: { ...q, limit: 12 } })
      .then((r) => { setData(r.data); setError(''); })
      .catch((e) => { setError(errMsg(e)); setData({ products: [], page: 1, pages: 1, total: 0 }); });
  }, [queryString]);

  const active = ['keyword', 'category', 'minPrice', 'maxPrice', 'inStock'].some((k) => get(k));

  return (
    <div className="shop">
      <div className="shop-head">
        <div>
          <h1>{get('category') || (get('keyword') ? `Results for “${get('keyword')}”` : 'All products')}</h1>
          {data && <p className="muted">{data.total} product{data.total === 1 ? '' : 's'}</p>}
        </div>
        <div className="row">
          <button className="btn ghost only-mobile" onClick={() => setFiltersOpen(true)}><Icon name="filter" size={16} /> Filters</button>
          <select value={get('sort') || 'newest'} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort products">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="shop-body">
        {filtersOpen && <div className="drawer-scrim" onClick={() => setFiltersOpen(false)} />}
        <aside className={`filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-head only-mobile">
            <h3>Filters</h3>
            <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><Icon name="x" /></button>
          </div>
          <div className="filter-group">
            <label className="field-label" htmlFor="kw">Search</label>
            <input id="kw" placeholder="Product name" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="filter-group">
            <span className="field-label">Category</span>
            <button className={`catopt ${!get('category') ? 'on' : ''}`} onClick={() => update({ category: '' })}>All categories</button>
            {cats.map((c) => (
              <button key={c._id} className={`catopt ${get('category') === c.name ? 'on' : ''}`} onClick={() => update({ category: c.name })}>
                <span>{c.icon} {c.name}</span><small>{c.productCount}</small>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="field-label">Price (Rs.)</span>
            <div className="row">
              <input type="number" min="0" placeholder="Min" defaultValue={get('minPrice')} key={'min' + get('minPrice')}
                onBlur={(e) => update({ minPrice: e.target.value })} aria-label="Minimum price" />
              <input type="number" min="0" placeholder="Max" defaultValue={get('maxPrice')} key={'max' + get('maxPrice')}
                onBlur={(e) => update({ maxPrice: e.target.value })} aria-label="Maximum price" />
            </div>
          </div>
          <div className="filter-group">
            <Toggle checked={get('inStock') === 'true'} onChange={(v) => update({ inStock: v ? 'true' : '' })} label="In stock only" />
          </div>
          {active && <button className="btn ghost full" onClick={() => { setKeyword(''); setParams({}); }}>Clear filters</button>}
          <button className="btn full only-mobile" onClick={() => setFiltersOpen(false)}>Show results</button>
        </aside>

        <div className="shop-results">
          {error && <p className="alert error">{error}</p>}
          {!data ? <Loader label="Loading products" /> : data.products.length === 0 ? (
            <Empty icon="search" title="Nothing matches those filters" text="Try another search term or clear the filters."
              action={<button className="btn" onClick={() => { setKeyword(''); setParams({}); }}>Clear filters</button>} />
          ) : (
            <>
              <div className="pgrid">{data.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
              <Pagination page={data.page} pages={data.pages} onChange={(page) => update({ page: String(page) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
