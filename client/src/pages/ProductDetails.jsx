import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import { Empty, Loader, QtyStepper } from '../components/Bits';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useUI } from '../context/UIContext';
import { discount, money } from '../utils/format';

export default function ProductDetails() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const { addToCart, cart } = useCart();
  const { settings: s } = useSettings();
  const { toast } = useUI();
  const nav = useNavigate();

  useEffect(() => {
    setP(null); setQty(1); setError('');
    api.get(`/products/${id}`).then((r) => setP(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <Empty icon="alert" title="Product not found" text={error} action={<Link to="/shop" className="btn">Back to shop</Link>} />;
  if (!p) return <Loader label="Loading product" />;

  const off = discount(p.price, p.comparePrice);
  const inCart = cart.find((i) => i._id === p._id)?.qty || 0;
  const canAdd = Math.max(p.countInStock - inCart, 0);

  const add = (go) => {
    const q = Math.min(qty, canAdd);
    addToCart(p, q);
    if (go) nav('/cart'); else toast(`${q} × ${p.name} added to cart`);
  };

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(p.category)}`}>{p.category}</Link><span>/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="detail">
        <div className="detail-media"><ProductImage product={p} /></div>
        <div className="detail-info">
          <span className="pcard-cat">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="detail-price">
            <strong>{money(p.price, s.currency)}</strong>
            {off > 0 && <><s>{money(p.comparePrice, s.currency)}</s><span className="flag sale inline">Save {off}%</span></>}
          </div>
          <p className="detail-desc">{p.description}</p>

          <p className={`stock ${p.countInStock === 0 ? 'none' : p.countInStock <= (s.lowStockThreshold ?? 5) ? 'low' : ''}`}>
            {p.countInStock === 0 ? 'Out of stock' : p.countInStock <= (s.lowStockThreshold ?? 5) ? `Hurry, only ${p.countInStock} left` : 'In stock, ready to ship'}
          </p>

          {canAdd > 0 ? (
            <div className="detail-buy">
              <QtyStepper value={Math.min(qty, canAdd)} max={canAdd} onChange={setQty} />
              <button className="btn big" onClick={() => add(false)}>Add to cart</button>
              <button className="btn big ghost" onClick={() => add(true)}>Buy now</button>
            </div>
          ) : p.countInStock > 0 && <p className="muted">You already have all available stock in your cart.</p>}

          <ul className="detail-perks">
            <li><Icon name="cash" size={18} /> Cash on delivery</li>
            <li><Icon name="truck" size={18} /> {s.freeShippingOver ? `Free delivery over ${money(s.freeShippingOver, s.currency)}` : `Delivery ${money(s.shippingFee, s.currency)}`}</li>
          </ul>
        </div>
      </div>

      {p.related?.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>More in {p.category}</h2></div>
          <div className="pgrid">{p.related.map((r) => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </>
  );
}
