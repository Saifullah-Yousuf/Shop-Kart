import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';
import { Empty, Field } from '../components/Bits';
import { Summary } from './Cart';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { toast } = useUI();
  const nav = useNavigate();
  const [a, setA] = useState({ fullName: user?.name || '', phone: user?.phone || '', address: '', city: '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[0-9+\-\s]{10,15}$/.test(a.phone)) return setError('Enter a valid phone number, e.g. 0300 1234567');
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/orders', { items: cart.map((i) => ({ product: i._id, qty: i.qty })), shippingAddress: a, note });
      clearCart();
      toast('Order placed');
      nav(`/orders/${data._id}`, { state: { justPlaced: true } });
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  if (cart.length === 0)
    return <Empty icon="cart" title="Nothing to check out" action={<Link to="/shop" className="btn">Browse products</Link>} />;

  return (
    <>
      <h1 className="page-title">Checkout</h1>
      <form className="split" onSubmit={submit}>
        <div className="panel">
          <h3>Delivery details</h3>
          {error && <p className="alert error">{error}</p>}
          <div className="grid2">
            <Field label="Full name"><input value={a.fullName} onChange={set('fullName')} required autoComplete="name" /></Field>
            <Field label="Phone"><input value={a.phone} onChange={set('phone')} required inputMode="tel" placeholder="0300 1234567" autoComplete="tel" /></Field>
          </div>
          <Field label="Address"><input value={a.address} onChange={set('address')} required placeholder="House, street, area" autoComplete="street-address" /></Field>
          <Field label="City"><input value={a.city} onChange={set('city')} required list="cities" autoComplete="address-level2" /></Field>
          <datalist id="cities">
            {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot'].map((c) => <option key={c} value={c} />)}
          </datalist>
          <Field label="Note for the rider (optional)"><textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} /></Field>

          <h3>Payment</h3>
          <div className="paybox"><Icon name="cash" /><div><strong>Cash on delivery</strong><span className="muted">Pay the rider when your order arrives.</span></div></div>
        </div>
        <Summary>
          <button className="btn big full" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <small className="muted center">Prices are confirmed by the server when you place the order.</small>
        </Summary>
      </form>
    </>
  );
}
