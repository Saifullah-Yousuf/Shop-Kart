import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import ProductImage from '../components/ProductImage';
import { Empty, Loader, StatusBadge } from '../components/Bits';
import { useSettings } from '../context/SettingsContext';
import { money, orderNo, shortDate } from '../utils/format';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const { settings: s } = useSettings();

  useEffect(() => { api.get('/orders/my').then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e))); }, []);

  if (error) return <p className="alert error">{error}</p>;
  if (!orders) return <Loader label="Loading your orders" />;
  if (!orders.length)
    return <Empty icon="receipt" title="No orders yet" text="When you place an order you can track it here."
      action={<Link to="/shop" className="btn">Start shopping</Link>} />;

  return (
    <>
      <h1 className="page-title">My orders</h1>
      <ul className="orderlist">
        {orders.map((o) => (
          <li key={o._id}>
            <Link to={`/orders/${o._id}`} className="ordercard">
              <div className="thumbs">
                {o.items.slice(0, 3).map((i) => <ProductImage key={i._id} product={i} />)}
                {o.items.length > 3 && <span className="more">+{o.items.length - 3}</span>}
              </div>
              <div className="ordercard-info">
                <strong>Order {orderNo(o._id)}</strong>
                <span className="muted">{shortDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items</span>
              </div>
              <StatusBadge status={o.status} />
              <strong className="ordercard-total">{money(o.totalPrice, s.currency)}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
