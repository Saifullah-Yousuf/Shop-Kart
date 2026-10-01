import { useState } from 'react';
import api, { errMsg } from '../api';
import Icon from './Icon';

// Paste an image URL or upload a file (admin only). Shows a preview either way.
export default function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd);
      onChange(data.url);
    } catch (e) { setError(errMsg(e)); }
    setBusy(false);
  };

  return (
    <div className="imagefield">
      <div className="imagefield-preview">
        {value ? <img src={value} alt="Preview" /> : <Icon name="upload" size={26} />}
      </div>
      <div className="imagefield-controls">
        <input placeholder="https://… or upload a file" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        <div className="row">
          <label className="btn ghost small">
            <Icon name="upload" size={16} /> {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
          </label>
          {value && <button type="button" className="btn ghost small" onClick={() => onChange('')}>Remove</button>}
        </div>
        {error && <span className="field-error">{error}</span>}
      </div>
    </div>
  );
}
