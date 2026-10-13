import { Link } from 'react-router-dom';
import { compactMoney, formatDate } from '../utils/format.js';

export default function LeadCard({ lead, dragging, onDragStart, onDragEnd }) {
  return (
    <article
      className={dragging ? 'lead-card dragging' : 'lead-card'}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(lead.id)); onDragStart(lead.id); }}
      onDragEnd={onDragEnd}
    >
      <Link to={`/leads/${lead.id}`} className="lead-title">{lead.title}</Link>
      <div className="muted">{lead.company_name || lead.contact_name || 'No company'}</div>
      <div className="lead-meta">
        <strong>{compactMoney(lead.value)}</strong>
        {lead.expected_close && <span className="muted">Close {formatDate(lead.expected_close)}</span>}
      </div>
    </article>
  );
}
