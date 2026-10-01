import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import Icon from '../../components/Icon';
import ProductImage from '../../components/ProductImage';
import { Loader, StatusBadge } from '../../components/Bits';
import { useSettings } from '../../context/SettingsContext';
import { STATUSES, money, orderNo, shortDate } from '../../utils/format';

function SalesChart({ data, currency }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const W = 640, H = 220, pad = 28, bw = (W - pad) / data.length;
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const shown = hover != null ? data[hover] : null;

  return (
    <div className="chart">
      <div className="chart-head">
        <div>
          <span className="muted">{shown ? shortDate(shown.date) : 'Last 14 days'}</span>
          <strong>{money(shown ? shown.revenue : total, currency)}</strong>
        </div>
        <span className="muted">{shown ? `${shown.orders} order${shown.orders === 1 ? '' : 's'}` : `${data.reduce((s, d) => s + d.orders, 0)} orders`}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue per day for the last 14 days" onMouseLeave={() => setHover(null)}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={W} y1={H - 24 - f * (H - 40)} y2={H - 24 - f * (H - 40)} className="gridline" />
        ))}
        {data.map((d, i) => {
          const h = Math.max((d.revenue / max) * (H - 40), d.revenue ? 4 : 2);
          const x = pad + i * bw + bw * 0.18;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={pad + i * bw} y="0" width={bw} height={H} fill="transparent" />
              <rect x={x} y={H - 24 - h} width={bw * 0.64} height={h} rx="5" className={`bar ${hover === i ? 'on' : ''}`} />
              {(i % 2 === 0 || data.length <= 7) && (
                <text x={x + bw * 0.32} y={H - 6} textAnchor="middle" className="axis">{new Date(d.date).getUTCDate()}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const { settings: s } = useSettings();

  useEffect(() => { api.get('/stats').then((r) => setD(r.data)).catch((e) => setError(errMsg(e))); }, []);

  if (error) return <p className="alert error">{error}</p>;
  if (!d) return <Loader label="Loading dashboard" />;

  const kpis = [
    { label: 'Revenue', value: money(d.revenue, s.currency), icon: 'cash', note: 'Excludes cancelled orders' },
    { label: 'Orders', value: d.orderCount, icon: 'receipt', note: `${d.byStatus.Pending || 0} waiting for you`, to: '/admin/orders' },
    { label: 'Products', value: d.productCount, icon: 'box', note: `${d.lowStock.length} running low`, to: '/admin/products' },
    { label: 'Customers', value: d.customerCount, icon: 'users', note: 'Registered accounts', to: '/admin/customers' },
  ];
  const statusTotal = Object.values(d.byStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="dash">
      <div className="kpis">
        {kpis.map((k) => {
          const body = (<><span className="kpi-icon"><Icon name={k.icon} /></span><span className="muted">{k.label}</span><strong>{k.value}</strong><small>{k.note}</small></>);
          return k.to ? <Link key={k.label} to={k.to} className="kpi">{body}</Link> : <div key={k.label} className="kpi">{body}</div>;
        })}
      </div>

      <div className="dash-row">
        <section className="panel grow2"><h3>Sales</h3><SalesChart data={d.sales} currency={s.currency} /></section>
        <section className="panel">
          <h3>Orders by status</h3>
          <ul className="statusbars">
            {STATUSES.map((st) => (
              <li key={st}>
                <div className="row between"><span>{st}</span><strong>{d.byStatus[st] || 0}</strong></div>
                <div className="statusbar"><span className={`s-${st.toLowerCase()}`} style={{ width: `${((d.byStatus[st] || 0) / statusTotal) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="dash-row">
        <section className="panel grow2">
          <div className="row between"><h3>Recent orders</h3><Link to="/admin/orders" className="textlink">All orders</Link></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {d.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><strong>{orderNo(o._id)}</strong></td><td>{o.user?.name || 'Deleted user'}</td>
                    <td className="muted">{shortDate(o.createdAt)}</td><td>{money(o.totalPrice, s.currency)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <h3>Low stock</h3>
          {d.lowStock.length === 0 ? <p className="muted">Every product has more than {s.lowStockThreshold} in stock.</p> : (
            <ul className="minilist">
              {d.lowStock.map((p) => (
                <li key={p._id}>
                  <ProductImage product={p} />
                  <span className="grow">{p.name}</span>
                  <strong className={p.countInStock === 0 ? 'danger-text' : 'warn-text'}>{p.countInStock === 0 ? 'Out' : `${p.countInStock} left`}</strong>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt">Best sellers</h3>
          <ul className="minilist">
            {d.topProducts.map((p) => (
              <li key={p._id}><ProductImage product={p} /><span className="grow">{p.name}</span><strong>{p.sold} sold</strong></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
