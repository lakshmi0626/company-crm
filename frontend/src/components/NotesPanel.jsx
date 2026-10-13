import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime } from '../utils/format.js';
import EmptyState from './EmptyState.jsx';

export default function NotesPanel({ leadId }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/notes', { lead_id: leadId }).then(setNotes).catch((e) => setError(e.message));
  }, [leadId]);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notes', { body, lead_id: leadId });
      setBody('');
      setError('');
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    try { await api.del(`/notes/${id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="panel">
      <h2>Notes</h2>
      <form onSubmit={add} className="inline-form">
        <textarea className="input" rows={2} value={body} placeholder="Add a note about this lead" onChange={(e) => setBody(e.target.value)} />
        <button className="btn btn-primary" disabled={!body.trim()}>Save note</button>
      </form>
      {error && <div className="alert">{error}</div>}
      {notes.length === 0 && <EmptyState title="No notes yet">Record calls, decisions and next steps here.</EmptyState>}
      <ul className="notes">
        {notes.map((n) => (
          <li key={n.id}>
            <p>{n.body}</p>
            <div className="muted note-meta">
              {n.author_name || 'Unknown'} · {formatDateTime(n.created_at)}
              {(user.role !== 'sales_rep' || n.author_id === user.id) && (
                <button className="link-btn danger" onClick={() => remove(n.id)}>Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
