import { useEffect } from 'react';
import Icon from './Icon';

export function Loader({ label = 'Loading' }) {
  return <div className="loader" role="status"><span className="spinner" />{label}…</div>;
}

export function Empty({ icon = 'box', title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge s-${String(status).toLowerCase()}`}>{status}</span>;
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><Icon name="left" /></button>
      <span>Page {page} of {pages}</span>
      <button className="icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><Icon name="right" /></button>
    </nav>
  );
}

export function QtyStepper({ value, max, onChange }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button>
      <input type="number" min="1" max={max} value={value} aria-label="Quantity"
        onChange={(e) => onChange(Math.min(max, Math.max(1, Number(e.target.value) || 1)))} />
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity"><Icon name="plus" size={16} /></button>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track"><span /></span>
      <span>{label}</span>
    </label>
  );
}
