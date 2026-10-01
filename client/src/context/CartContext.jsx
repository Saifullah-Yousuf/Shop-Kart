import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';
import { shippingFor } from '../utils/format';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { settings } = useSettings();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const addToCart = (p, qty = 1) =>
    setCart((c) => {
      const ex = c.find((i) => i._id === p._id);
      const q = Math.min((ex ? ex.qty : 0) + qty, p.countInStock);
      const item = { _id: p._id, name: p.name, price: p.price, image: p.image, category: p.category, countInStock: p.countInStock, qty: q };
      return ex ? c.map((i) => (i._id === p._id ? item : i)) : [...c, item];
    });
  const setQty = (id, qty) =>
    setCart((c) => c.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(qty || 1, i.countInStock)) } : i)));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i._id !== id));
  const clearCart = () => setCart([]);

  // Display only. The server recalculates every price when the order is placed.
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = shippingFor(subtotal, settings);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, setQty, removeFromCart, clearCart, subtotal, shipping, total: subtotal + shipping, count }}>
      {children}
    </CartContext.Provider>
  );
}
