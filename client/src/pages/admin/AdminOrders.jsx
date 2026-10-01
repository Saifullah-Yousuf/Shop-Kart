import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import ProductImage from '../../components/ProductImage';
import { Empty, Loader, Modal, Pagination, StatusBadge } from '../../components/Bits';
import { useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';
import { STATUSES, dateTime, money, orderNo, shortDate } from '../../utils/format';

function OrderModal({ order, onClose, onChange }) {
  const { settings: s } = useSettings();
  const { toast, confirm } = useUI();
  const [busy, setBusy] = useState(false);

  const setStatus = async (status) => {
    if (status === 'Cancelled' && !(await confirm({ title: 'Cancel this order?', message: 'Stock is returned and the order cannot be reopened.', confirmText: 'Cancel order', danger: true }))) return;
    setBusy(true);
    try { const { data } = await api.put(`/orders/${order._id}/status`, { status }); onChange({ ...order, status: data.status }); toast(`Marked as ${status}`); }
    catch (e) { toast(errMsg(e), 'error'); }
    setBusy(false);
  };

  return (
    <Modal title={`Order ${orderNo(order._id)}`} onClose={onClose} wide>
      <div className="order-modal">
        <div className="row between wrap">
          <span className="muted">{dateTime(order.createdAt)}</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="grid2">
          <div><h4>Customer</h4><p>{order.user?.name || 'Deleted user'}<br /><span className="muted">{order.user?.email}</span></p></div>
          <div><h4>Deliver to</h4><p>{order.shippingAddress.fullName}<br />{order.shippingAddress.address}, {order.shippingAddress.city}<br />
            <a href={`tel:${order.shippingAddress.phone}`} className="textlink">{order.shippingAddress.phone}</a></p></div>
        </div>
        {order.note && <p className="alert">Note: {order.note}</p>}
        <ul className="lines compact">
          {order.items.map((i) => (
            <li className="line" key={i._id}>
              <div className="line-img"><ProductImage product={i} /></div>
              <div className="line-info"><strong>{i.name}</strong><span className="muted">{i.qty} × {money(i.price, s.currency)}</span></div>
              <strong className="line-total">{money(i.qty * i.price, s.currency)}</strong>
            </li>
          ))}
        </ul>
        <dl className="summary-dl">
          <div><dt>Items</dt><dd>{money(order.itemsPrice, s.currency)}</dd></div>
          <div><dt>Delivery</dt><dd>{order.shippingFee ? money(order.shippingFee, s.currency) : 'Free'}</dd></div>
          <div className="total"><dt>Total (COD)</dt><dd>{money(order.totalPrice, s.currency)}</dd></div>
        </dl>
        {order.status !== 'Cancelled' ? (
          <div>
            <h4>Update status</h4>
            <div className="statuspick">
              {STATUSES.map((st) => (
                <button key={st} disabled={busy || st === order.status}
                  className={`btn small ${st === order.status ? '' : 'ghost'} ${st === 'Cancelled' ? 'danger-text' : ''}`} onClick={() => setStatus(st)}>{st}</button>
              ))}
            </div>
          </div>
        ) : <p className="muted">This order was cancelled and its stock was returned.</p>}
      </div>
    </Modal>
  );
}

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { settings: s } = useSettings();
  const { toast } = useUI();

  useEffect(() => {
    setData(null);
    api.get('/orders', { params: { status, page } }).then((r) => setData(r.data)).catch((e) => toast(errMsg(e), 'error'));
  }, [status, page]);

  const replace = (o) => { setOpen(o); setData((d) => ({ ...d, orders: d.orders.map((x) => (x._id === o._id ? o : x)) })); };

  return (
    <>
      <div className="tabs" role="tablist">
        {['', ...STATUSES].map((st) => (
          <button key={st || 'all'} role="tab" aria-selected={status === st} className={status === st ? 'on' : ''} onClick={() => { setStatus(st); setPage(1); }}>
            {st || 'All'}
          </button>
        ))}
      </div>
      {!data ? <Loader /> : data.orders.length === 0 ? <Empty icon="receipt" title={status ? `No ${status.toLowerCase()} orders` : 'No orders yet'} /> : (
        <div className="panel flush">
          <div className="table-wrap">
            <table className="clickable">
              <thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o._id} onClick={() => setOpen(o)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(o)}>
                    <td><strong>{orderNo(o._id)}</strong></td>
                    <td>{o.user?.name || 'Deleted user'}</td>
                    <td>{o.shippingAddress.city}</td>
                    <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                    <td>{money(o.totalPrice, s.currency)}</td>
                    <td className="muted nowrap">{shortDate(o.createdAt)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}
      {open && <OrderModal order={open} onClose={() => setOpen(null)} onChange={replace} />}
    </>
  );
}
