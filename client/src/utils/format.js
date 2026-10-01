export const money = (n, currency = 'Rs.') => `${currency} ${Math.round(Number(n) || 0).toLocaleString('en-PK')}`;

export const shortDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export const dateTime = (d) =>
  new Date(d).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const orderNo = (id) => '#' + String(id).slice(-6).toUpperCase();

export const discount = (price, compare) => (compare > price ? Math.round(((compare - price) / compare) * 100) : 0);

// Pick dark or white text for a given background colour
export const inkFor = (hex) => {
  const h = (hex || '#000').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#14201a' : '#ffffff';
};

export const shippingFor = (subtotal, s) =>
  !subtotal ? 0 : s?.freeShippingOver && subtotal >= s.freeShippingOver ? 0 : Number(s?.shippingFee || 0);

export const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered'];
export const STATUSES = [...STATUS_FLOW, 'Cancelled'];
