import { useState } from 'react';
import LeadCard from './LeadCard.jsx';
import { compactMoney } from '../utils/format.js';

export default function KanbanColumn({ stage, color, draggingId, onDragStart, onDragEnd, onDropLead }) {
  const [over, setOver] = useState(false);
  const total = stage.leads.reduce((sum, l) => sum + Number(l.value || 0), 0);

  return (
    <section
      className={over ? 'column over' : 'column'}
      style={{ '--stage': color }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = Number(e.dataTransfer.getData('text/plain'));
        if (id) onDropLead(id, stage.id);
      }}
    >
      <header className="column-head">
        <h2>{stage.name}</h2>
        <div className="muted">{stage.leads.length} {stage.leads.length === 1 ? 'lead' : 'leads'} · {compactMoney(total)}</div>
      </header>
      <div className="column-body">
        {stage.leads.map((l) => (
          <LeadCard key={l.id} lead={l} dragging={draggingId === l.id} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
        {!stage.leads.length && <div className="column-empty muted">Drop a lead here</div>}
      </div>
    </section>
  );
}
