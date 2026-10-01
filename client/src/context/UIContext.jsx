import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from '../components/Icon';

const UIContext = createContext();
export const useUI = () => useContext(UIContext);

// Toast messages and a promise-based confirm dialog, available everywhere
export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const confirm = useCallback((opts) => new Promise((resolve) => { resolver.current = resolve; setDialog(opts); }), []);
  const close = (answer) => { resolver.current?.(answer); setDialog(null); };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon name={t.type === 'error' ? 'alert' : 'check'} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      {dialog && (
        <div className="overlay" onClick={() => close(false)}>
          <div className="modal small" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            {dialog.message && <p className="muted">{dialog.message}</p>}
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => close(false)}>Keep it</button>
              <button className={`btn ${dialog.danger ? 'danger' : ''}`} onClick={() => close(true)} autoFocus>
                {dialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
