import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';
import { Empty, QtyStepper } from '../components/Bits';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { money } from '../utils/format';

export function Summary({ children }) {
  const { subtotal, shipping, total, count } = useCart();
  const { settings: s } = useSettings();
  const left = s.freeShippingOver - subtotal;
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      {s.freeShippingOver > 0 && (
        <div className="freebar">
          <div className="freebar-track"><span style={{ width: `${Math.min(100, (subtotal / s.freeShippingOver) * 100)}%` }} /></div>
          <small>{left > 0 ? `Add ${money(left, s.currency)} more for free delivery` : 'You get free delivery'}</small>
        </div>
      )}
      <dl>
        <div><dt>Items ({count})</dt><dd>{money(subtotal, s.currency)}</dd></div>
        <div><dt>Delivery</dt><dd>{shipping ? money(shipping, s.currency) : 'Free'}</dd></div>
        <div className="total"><dt>Total</dt><dd>{money(total, s.currency)}</dd></div>
      </dl>
      {children}
    </aside>
  );
}

export default function Cart() {
  const { cart, setQty, removeFromCart } = useCart();
  const { settings: s } = useSettings();
  const nav = useNavigate();

  if (cart.length === 0)
    return <Empty icon="cart" title="Your cart is empty" text="Products you add will show up here."
      action={<Link to="/shop" className="btn">Start shopping</Link>} />;

  return (
    <>
      <h1 className="page-title">Your cart</h1>
      <div className="split">
        <ul className="lines">
          {cart.map((i) => (
            <li className="line" key={i._id}>
              <Link to={`/product/${i._id}`} className="line-img"><ProductImage product={i} /></Link>
              <div className="line-info">
                <Link to={`/product/${i._id}`}><strong>{i.name}</strong></Link>
                <span className="muted">{money(i.price, s.currency)} each</span>
              </div>
              <QtyStepper value={i.qty} max={i.countInStock} onChange={(q) => setQty(i._id, q)} />
              <strong className="line-total">{money(i.price * i.qty, s.currency)}</strong>
              <button className="icon-btn" onClick={() => removeFromCart(i._id)} aria-label={`Remove ${i.name}`}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
        <Summary>
          <button className="btn big full" onClick={() => nav('/checkout')}>Go to checkout</button>
          <Link to="/shop" className="textlink center">Keep shopping</Link>
        </Summary>
      </div>
    </>
  );
}
