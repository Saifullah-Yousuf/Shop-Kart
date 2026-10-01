import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { inkFor } from '../utils/format';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

// Used until the real settings arrive from the API
const FALLBACK = {
  storeName: 'ShopKart', tagline: '', logoEmoji: '🛒', brandColor: '#146c54', accentColor: '#f2a93b',
  currency: 'Rs.', shippingFee: 250, freeShippingOver: 5000, lowStockThreshold: 5, defaultTheme: 'system',
  showDemoLogins: true, announcementOn: false, announcement: '', heroTitle: '', heroSubtitle: '', heroImage: '',
  contactEmail: '', contactPhone: '', address: '', whatsapp: '', instagram: '', facebook: '', footerText: '',
};

// Push brand colours into CSS variables so the whole UI re-themes instantly
export const applyColors = (brand, accent) => {
  const root = document.documentElement.style;
  if (brand) { root.setProperty('--brand', brand); root.setProperty('--brand-ink', inkFor(brand)); }
  if (accent) { root.setProperty('--accent', accent); root.setProperty('--accent-ink', inkFor(accent)); }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() =>
    api.get('/settings').then((r) => setSettings({ ...FALLBACK, ...r.data })).catch(() => {}).finally(() => setReady(true)), []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    applyColors(settings.brandColor, settings.accentColor);
    document.title = settings.tagline ? `${settings.storeName} | ${settings.tagline}` : settings.storeName;
  }, [settings]);

  return <SettingsContext.Provider value={{ settings, setSettings, refresh, ready }}>{children}</SettingsContext.Provider>;
}
