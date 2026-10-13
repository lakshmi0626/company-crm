import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import KanbanColumn from '../components/KanbanColumn.jsx';

const PALETTE = ['#6B7F78', '#2E7D6B', '#1B4A43', '#D98E04', '#B87A00'];

const stageColor = (stage, index) =>
  stage.is_won ? '#1F7A4D' : stage.is_lost ? '#B4322A' : PALETTE[index % PALETTE.length];

export default function Pipeline() {
  const [stages, setStages] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/pipeline/board');
      setStages(res.stages);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const moveLead = async (leadId, stageId) => {
    setDraggingId(null);
    const from = stages.find((s) => s.leads.some((l) => l.id === leadId));
    if (!from || from.id === stageId) return;

    // Update the board immediately, then confirm with the server.
    const lead = from.leads.find((l) => l.id === leadId);
    setStages((prev) => prev.map((s) => {
      if (s.id === from.id) return { ...s, leads: s.leads.filter((l) => l.id !== leadId) };
      if (s.id === stageId) return { ...s, leads: [{ ...lead, stage_id: stageId }, ...s.leads] };
      return s;
    }));
    try {
      await api.patch(`/leads/${leadId}/stage`, { stage_id: stageId });
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <p className="muted">Drag a lead to another column to move it forward.</p>
        </div>
        <Link className="btn btn-primary" to="/leads">Add lead</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? <p className="muted">Loading pipeline…</p> : (
        <div className="board">
          {stages.map((s, i) => (
            <KanbanColumn
              key={s.id}
              stage={s}
              color={stageColor(s, i)}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDropLead={moveLead}
            />
          ))}
        </div>
      )}
    </section>
  );
}
