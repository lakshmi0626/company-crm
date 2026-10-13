import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';
import NotesPanel from '../components/NotesPanel.jsx';
import TasksPanel from '../components/TasksPanel.jsx';
import EmailPanel from '../components/EmailPanel.jsx';
import { money, formatDate } from '../utils/format.js';

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [stages, setStages] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get(`/leads/${id}`).then(setLead).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
    api.get('/pipeline/stages').then(setStages).catch(() => {});
  }, [load]);

  const changeStage = async (e) => {
    try { setLead(await api.patch(`/leads/${id}/stage`, { stage_id: e.target.value })); setError(''); }
    catch (err) { setError(err.message); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this lead along with its notes and tasks?')) return;
    try { await api.del(`/leads/${id}`); navigate('/leads'); } catch (err) { setError(err.message); }
  };

  if (!lead) return error ? <div className="alert">{error}</div> : <p className="muted">Loading lead…</p>;

  return (
    <section>
      <p><Link to="/leads">← All leads</Link></p>
      <div className="page-head">
        <div>
          <h1>{lead.title}</h1>
          <p className="muted">{[lead.company_name, lead.contact_name].filter(Boolean).join(' · ') || 'No company or contact linked'}</p>
        </div>
        {user.role !== 'sales_rep' && <button className="btn btn-ghost danger" onClick={remove}>Delete lead</button>}
      </div>
      {error && <div className="alert">{error}</div>}

      <div className="panel facts">
        <div><span className="muted">Value</span><strong>{money(lead.value)}</strong></div>
        <div><span className="muted">Status</span><Badge value={lead.status} /></div>
        <div>
          <label className="muted" htmlFor="stage">Stage</label>
          <select id="stage" className="input" value={lead.stage_id} onChange={changeStage}>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><span className="muted">Owner</span><strong>{lead.owner_name || '—'}</strong></div>
        <div><span className="muted">Source</span><strong>{lead.source || '—'}</strong></div>
        <div><span className="muted">Expected close</span><strong>{formatDate(lead.expected_close) || '—'}</strong></div>
      </div>
      {lead.description && <div className="panel"><h2>Description</h2><p>{lead.description}</p></div>}

      <div className="grid-2">
        <TasksPanel leadId={lead.id} />
        <NotesPanel leadId={lead.id} />
      </div>
      <EmailPanel leadId={lead.id} />
    </section>
  );
}
