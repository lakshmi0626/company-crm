import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/Badge.jsx';
import { api } from '../api/client.js';
import { formatDate, isOverdue } from '../utils/format.js';

const TEAM = ['admin', 'manager'];

const columns = [
  { key: 'title', label: 'Task' },
  { key: 'due_date', label: 'Due', render: (r) => (
    <span className={isOverdue(r.due_date, r.status) ? 'overdue' : ''}>{formatDate(r.due_date) || '—'}</span>
  ) },
  { key: 'priority', label: 'Priority', render: (r) => <Badge value={r.priority} /> },
  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
  { key: 'lead_title', label: 'Lead' },
  { key: 'assigned_name', label: 'Assigned to' },
];

const fields = [
  { name: 'title', label: 'Task', required: true },
  { name: 'description', label: 'Details', type: 'textarea', rows: 3 },
  { name: 'due_date', label: 'Due date', type: 'date' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], default: 'medium' },
  { name: 'status', label: 'Status', type: 'select', options: ['open', 'done'], default: 'open' },
  { name: 'lead_id', label: 'Related lead', type: 'select', optionsFrom: { path: '/leads', label: 'title' } },
  { name: 'assigned_to', label: 'Assigned to', type: 'select', optionsFrom: { path: '/users/options', label: 'name' }, visibleTo: TEAM },
];

const filters = [
  { name: 'status', label: 'Any status', options: ['open', 'done'] },
  { name: 'priority', label: 'Any priority', options: ['low', 'medium', 'high'] },
];

const rowActions = (row, reload) => (
  <button
    className="btn btn-ghost"
    onClick={async () => { await api.patch(`/tasks/${row.id}/complete`, { done: row.status !== 'done' }); reload(); }}
  >
    {row.status === 'done' ? 'Reopen' : 'Mark done'}
  </button>
);

export default function Tasks() {
  return (
    <ResourcePage
      title="Tasks" noun="task" path="/tasks"
      columns={columns} fields={fields} filters={filters}
      rowActions={rowActions} canDelete={() => true}
      intro="Follow-ups and reminders. Overdue tasks are shown in red."
    />
  );
}
