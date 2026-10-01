import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';
import { Empty, Loader, StatusBadge } from '../components/Bits';
import { useSettings } from '../context/SettingsContext';
import { useUI } from '../context/UIContext';
import { STATUS_FLOW, dateTime, money, orderNo } from '../utils/format';

export default function OrderDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  const { settings: s } = useSettings();
  const { toast, confirm } = useUI();

  useEffect(() => { api.get(`/orders/${id}`).then((r) => setO(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  const cancel = async () => {
    if (!(await confirm({ title: 'Cancel this order?', message: 'Items go back into stock and the order cannot be reopened.', confirmText: 'Cancel order', danger: true }))) return;
    try { setO((await api.put(`/orders/${id}/cancel`)).data); toast('Order cancelled'); } catch (e) { toast(errMsg(e), 'error'); }
  };

  if (error) return <Empty icon="alert" title="Order not available" text={error} action={<Link to="/orders" className="btn">My orders</Link>} />;
  if (!o) return <Loader label="Loading order" />;

  const step = STATUS_FLOW.indexOf(o.status);

  return (
    <>
      {state?.justPlaced && (
        <div className="success-banner">
          <Icon name="check" size={22} />
          <div><strong>Thank you, your order is placed.</strong><span>We will call {o.shippingAddress.phone} to confirm before dispatch.</span></div>
        </div>
      )}
      <div className="order-head">
        <div>
          <Link to="/orders" className="textlink"><Icon name="left" size={16} /> My orders</Link>
          <h1 className="page-title">Order {orderNo(o._id)}</h1>
          <p className="muted">Placed {dateTime(o.createdAt)}</p>
        </div>
        <StatusBadge status={o.status} />
      </div>

      {o.status !== 'Cancelled' && (
        <ol className="track">
          {STATUS_FLOW.map((st, i) => (
            <li key={st} className={i <= step ? 'done' : ''}><span className="dot">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>{st}</li>
          ))}
        </ol>
      )}

      <div className="split">
        <div className="panel">
          <h3>Items</h3>
          <ul className="lines compact">
            {o.items.map((i) => (
              <li className="line" key={i._id}>
                <div className="line-img"><ProductImage product={i} /></div>
                <div className="line-info"><strong>{i.name}</strong><span className="muted">{i.qty} × {money(i.price, s.currency)}</span></div>
                <strong className="line-total">{money(i.qty * i.price, s.currency)}</strong>
              </li>
            ))}
          </ul>
          <h3>Delivery to</h3>
          <p>{o.shippingAddress.fullName}<br />{o.shippingAddress.address}, {o.shippingAddress.city}<br />{o.shippingAddress.phone}</p>
          {o.note && <p className="muted">Note: {o.note}</p>}
        </div>
        <aside className="summary">
          <h3>Payment</h3>
          <dl>
            <div><dt>Items</dt><dd>{money(o.itemsPrice, s.currency)}</dd></div>
            <div><dt>Delivery</dt><dd>{o.shippingFee ? money(o.shippingFee, s.currency) : 'Free'}</dd></div>
            <div className="total"><dt>Total</dt><dd>{money(o.totalPrice, s.currency)}</dd></div>
          </dl>
          <p className="muted">Cash on delivery</p>
          {o.status === 'Pending' && <button className="btn ghost danger-text full" onClick={cancel}>Cancel order</button>}
        </aside>
      </div>
    </>
  );
}
