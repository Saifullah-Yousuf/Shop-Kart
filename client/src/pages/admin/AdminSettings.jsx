import { useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../../api';
import ImageField from '../../components/ImageField';
import { Field, Toggle } from '../../components/Bits';
import { applyColors, useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';

const PRESETS = [
  ['Bottle green', '#146c54', '#f2a93b'], ['Indigo', '#4338ca', '#f59e0b'], ['Plum', '#7e2f6b', '#f4b860'],
  ['Ocean', '#0e6ba8', '#f97362'], ['Charcoal', '#2b3a42', '#e8b04b'], ['Crimson', '#b4232c', '#2f6f73'],
];

function Section({ title, text, children }) {
  return (
    <section className="settings-sec">
      <div className="settings-intro"><h3>{title}</h3>{text && <p className="muted">{text}</p>}</div>
      <div className="panel stack">{children}</div>
    </section>
  );
}

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const { toast } = useUI();
  const [f, setF] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => setF(settings), [settings]);
  // Live preview of colours while editing; put the saved ones back when leaving
  useEffect(() => { applyColors(f.brandColor, f.accentColor); }, [f.brandColor, f.accentColor]);
  const saved = useRef(settings);
  saved.current = settings;
  useEffect(() => () => applyColors(saved.current.brandColor, saved.current.accentColor), []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const dirty = JSON.stringify(f) !== JSON.stringify(settings);

  const save = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try { const { data } = await api.put('/settings', f); setSettings({ ...f, ...data }); toast('Settings saved'); }
    catch (err) { toast(errMsg(err), 'error'); }
    setBusy(false);
  };

  return (
    <form className="settings" onSubmit={save}>
      <Section title="Store identity" text="Shown in the header, footer, browser tab and login page.">
        <div className="grid2">
          <Field label="Store name"><input value={f.storeName} onChange={set('storeName')} required /></Field>
          <Field label="Logo emoji" hint="Any single emoji"><input value={f.logoEmoji} onChange={set('logoEmoji')} maxLength={4} /></Field>
        </div>
        <Field label="Tagline"><input value={f.tagline} onChange={set('tagline')} /></Field>
      </Section>

      <Section title="Colours and theme" text="Changes preview instantly. Visitors can still switch light or dark mode themselves.">
        <div className="presets">
          {PRESETS.map(([name, b, a]) => (
            <button type="button" key={name} className={`preset ${f.brandColor === b ? 'on' : ''}`} onClick={() => setF({ ...f, brandColor: b, accentColor: a })}>
              <span style={{ background: b }} /><span style={{ background: a }} />{name}
            </button>
          ))}
        </div>
        <div className="grid2">
          <Field label="Brand colour" hint="Buttons, links, highlights">
            <div className="colorin"><input type="color" value={f.brandColor} onChange={set('brandColor')} /><input value={f.brandColor} onChange={set('brandColor')} pattern="#[0-9a-fA-F]{6}" /></div>
          </Field>
          <Field label="Accent colour" hint="Sale tags and small highlights">
            <div className="colorin"><input type="color" value={f.accentColor} onChange={set('accentColor')} /><input value={f.accentColor} onChange={set('accentColor')} pattern="#[0-9a-fA-F]{6}" /></div>
          </Field>
        </div>
        <Field label="Default theme for new visitors">
          <div className="segmented">
            {['light', 'dark', 'system'].map((t) => (
              <button type="button" key={t} className={f.defaultTheme === t ? 'on' : ''} onClick={() => setF({ ...f, defaultTheme: t })}>
                {t === 'system' ? 'Match device' : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Homepage" text="The first thing customers see.">
        <Toggle checked={f.announcementOn} onChange={(v) => setF({ ...f, announcementOn: v })} label="Show announcement bar" />
        {f.announcementOn && <Field label="Announcement"><input value={f.announcement} onChange={set('announcement')} /></Field>}
        <Field label="Headline"><input value={f.heroTitle} onChange={set('heroTitle')} /></Field>
        <Field label="Intro text"><textarea rows="2" value={f.heroSubtitle} onChange={set('heroSubtitle')} /></Field>
        <Field label="Banner image" hint="Leave empty to show category tiles instead">
          <ImageField value={f.heroImage} onChange={(heroImage) => setF({ ...f, heroImage })} />
        </Field>
      </Section>

      <Section title="Delivery and stock" text="Used at checkout. The server applies the same rules when an order is placed.">
        <div className="grid2">
          <Field label="Currency label"><input value={f.currency} onChange={set('currency')} /></Field>
          <Field label="Delivery fee"><input type="number" min="0" value={f.shippingFee} onChange={set('shippingFee')} /></Field>
          <Field label="Free delivery above" hint="0 turns free delivery off"><input type="number" min="0" value={f.freeShippingOver} onChange={set('freeShippingOver')} /></Field>
          <Field label="Low stock warning at"><input type="number" min="0" value={f.lowStockThreshold} onChange={set('lowStockThreshold')} /></Field>
        </div>
      </Section>

      <Section title="Contact and social" text="Shown in the footer. Leave social links empty to hide them.">
        <div className="grid2">
          <Field label="Phone"><input value={f.contactPhone} onChange={set('contactPhone')} /></Field>
          <Field label="Email"><input type="email" value={f.contactEmail} onChange={set('contactEmail')} /></Field>
          <Field label="WhatsApp number"><input value={f.whatsapp} onChange={set('whatsapp')} placeholder="923001234567" /></Field>
          <Field label="Address"><input value={f.address} onChange={set('address')} /></Field>
          <Field label="Instagram URL"><input value={f.instagram} onChange={set('instagram')} /></Field>
          <Field label="Facebook URL"><input value={f.facebook} onChange={set('facebook')} /></Field>
        </div>
        <Field label="Footer note"><input value={f.footerText} onChange={set('footerText')} /></Field>
      </Section>

      <Section title="Login page">
        <Toggle checked={f.showDemoLogins} onChange={(v) => setF({ ...f, showDemoLogins: v })} label="Show one-click demo login buttons" />
        <p className="muted">Useful while presenting the project. Turn it off for a real store.</p>
      </Section>

      <div className={`savebar ${dirty ? 'show' : ''}`}>
        <span>You have unsaved changes</span>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => setF(settings)}>Discard</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>
    </form>
  );
}
