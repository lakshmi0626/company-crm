import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function EmailPanel({ leadId }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/templates', { limit: 100 }).then((r) => setTemplates(r.data)).catch((e) => setError(e.message));
  }, []);

  const choose = async (id) => {
    setTemplateId(id);
    setDraft(null);
    if (!id) return;
    try { setDraft(await api.post(`/templates/${id}/render`, { lead_id: leadId })); setError(''); }
    catch (err) { setError(err.message); }
  };

  const mailto = draft && draft.to
    ? `mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
    : null;

  const copy = async () => {
    await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="panel">
      <h2>Draft an email</h2>
      <select className="input" value={templateId} onChange={(e) => choose(e.target.value)} aria-label="Email template">
        <option value="">Choose a template</option>
        {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      {error && <div className="alert">{error}</div>}
      {draft && (
        <div className="draft">
          <input className="input" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} aria-label="Subject" />
          <textarea className="input" rows={8} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} aria-label="Message" />
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={copy}>{copied ? 'Copied' : 'Copy text'}</button>
            {mailto
              ? <a className="btn btn-primary" href={mailto}>Open in email app</a>
              : <span className="muted">Add a contact with an email to this lead to send directly.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
