import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import Icon from './Icon';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useUI } from '../context/UIContext';
import { money, discount } from '../utils/format';

export default function ProductCard({ p }) {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const { toast } = useUI();
  const off = discount(p.price, p.comparePrice);
  const low = p.countInStock > 0 && p.countInStock <= (settings.lowStockThreshold ?? 5);

  return (
    <article className="pcard">
      <Link to={`/product/${p._id}`} className="pcard-img">
        <ProductImage product={p} />
        {p.countInStock === 0 ? <span className="flag out">Sold out</span>
          : off > 0 ? <span className="flag sale">{off}% off</span>
          : low && <span className="flag low">Only {p.countInStock} left</span>}
      </Link>
      <div className="pcard-body">
        <span className="pcard-cat">{p.category}</span>
        <Link to={`/product/${p._id}`} className="pcard-name">{p.name}</Link>
        <div className="pcard-foot">
          <div className="pcard-price">
            <strong>{money(p.price, settings.currency)}</strong>
            {off > 0 && <s>{money(p.comparePrice, settings.currency)}</s>}
          </div>
          <button className="icon-btn solid" aria-label={`Add ${p.name} to cart`} disabled={p.countInStock === 0}
            onClick={() => { addToCart(p); toast(`${p.name} added to cart`); }}>
            <Icon name="plus" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
