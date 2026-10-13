import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formatDate, isOverdue } from '../utils/format.js';
import Badge from './Badge.jsx';
import EmptyState from './EmptyState.jsx';

export default function TasksPanel({ leadId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/tasks', { lead_id: leadId, limit: 50 }).then((r) => setTasks(r.data)).catch((e) => setError(e.message));
  }, [leadId]);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, due_date: due, lead_id: leadId });
      setTitle(''); setDue(''); setError('');
      load();
    } catch (err) { setError(err.message); }
  };

  const toggle = async (t) => {
    try { await api.patch(`/tasks/${t.id}/complete`, { done: t.status !== 'done' }); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="panel">
      <h2>Tasks</h2>
      <form onSubmit={add} className="inline-form row">
        <input className="input" value={title} placeholder="What needs to happen next?" onChange={(e) => setTitle(e.target.value)} />
        <input className="input date" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <button className="btn btn-primary" disabled={!title.trim()}>Add task</button>
      </form>
      {error && <div className="alert">{error}</div>}
      {tasks.length === 0 && <EmptyState title="No tasks for this lead">Add a follow-up so nothing slips.</EmptyState>}
      <ul className="tasks">
        {tasks.map((t) => (
          <li key={t.id} className={t.status === 'done' ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} />
              <span>{t.title}</span>
            </label>
            <span className={isOverdue(t.due_date, t.status) ? 'overdue' : 'muted'}>{formatDate(t.due_date)}</span>
            <Badge value={t.priority} />
          </li>
        ))}
      </ul>
    </div>
  );
}
