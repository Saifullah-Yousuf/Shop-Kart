import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { Loader } from '../components/Bits';
import { useSettings } from '../context/SettingsContext';
import { money } from '../utils/format';

export default function Home() {
  const { settings: s } = useSettings();
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products', { params: { featured: true, limit: 8 } }),
      api.get('/products', { params: { sort: 'newest', limit: 4 } }),
    ])
      .then(([c, f, l]) => { setCats(c.data); setFeatured(f.data.products); setLatest(l.data.products); })
      .catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>{s.heroTitle}</h1>
          <p>{s.heroSubtitle}</p>
          <div className="row">
            <Link to="/shop" className="btn big">Shop all products</Link>
            {cats[0] && <Link to={`/shop?category=${encodeURIComponent(cats[0].name)}`} className="btn big ghost">Browse {cats[0].name}</Link>}
          </div>
        </div>
        {s.heroImage ? (
          <img className="hero-img" src={s.heroImage} alt="" />
        ) : (
          <div className="shelf">
            {cats.slice(0, 4).map((c, i) => (
              <Link key={c._id} to={`/shop?category=${encodeURIComponent(c.name)}`} className={`shelf-tile t${i}`}>
                <span className="shelf-emoji">{c.icon}</span>
                <span className="shelf-name">{c.name}</span>
                <span className="shelf-count">{c.productCount} items</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ul className="perks">
        <li><Icon name="cash" /><div><strong>Cash on delivery</strong><span>Pay when your parcel arrives</span></div></li>
        <li><Icon name="truck" /><div><strong>{s.freeShippingOver ? `Free delivery over ${money(s.freeShippingOver, s.currency)}` : 'Nationwide delivery'}</strong><span>Flat {money(s.shippingFee, s.currency)} below that</span></div></li>
        <li><Icon name="phone" /><div><strong>Real support</strong><span>{s.contactPhone || 'Call or WhatsApp us'}</span></div></li>
      </ul>

      {error && <p className="alert error">{error}</p>}

      {cats.length > 4 && (
        <section className="section">
          <div className="section-head"><h2>Shop by category</h2></div>
          <div className="catrow">
            {cats.map((c) => (
              <Link key={c._id} to={`/shop?category=${encodeURIComponent(c.name)}`} className="catpill">
                <span>{c.icon}</span>{c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Picked for you</h2>
          <Link to="/shop" className="textlink">See everything</Link>
        </div>
        {!featured ? <Loader /> : featured.length === 0
          ? <p className="muted">Mark products as featured from the dashboard to show them here.</p>
          : <div className="pgrid">{featured.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Just in</h2>
          <Link to="/shop?sort=newest" className="textlink">Newest first</Link>
        </div>
        {!latest ? <Loader /> : <div className="pgrid">{latest.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
      </section>
    </>
  );
}
