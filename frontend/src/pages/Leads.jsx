import { Link } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/Badge.jsx';
import { money, formatDate } from '../utils/format.js';

const SOURCES = ['Website', 'Referral', 'Event', 'Cold outreach', 'Partner', 'Social media'];
const TEAM = ['admin', 'manager'];

const columns = [
  { key: 'title', label: 'Lead', render: (r) => <Link to={`/leads/${r.id}`}>{r.title}</Link> },
  { key: 'company_name', label: 'Company' },
  { key: 'value', label: 'Value', render: (r) => money(r.value) },
  { key: 'stage_name', label: 'Stage' },
  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
  { key: 'owner_name', label: 'Owner' },
  { key: 'expected_close', label: 'Expected close', render: (r) => formatDate(r.expected_close) || '—' },
];

const fields = [
  { name: 'title', label: 'Lead title', required: true },
  { name: 'value', label: 'Deal value (₹)', type: 'number', default: 0 },
  { name: 'stage_id', label: 'Stage', type: 'select', optionsFrom: { path: '/pipeline/stages', label: 'name' } },
  { name: 'company_id', label: 'Company', type: 'select', optionsFrom: { path: '/companies', label: 'name' } },
  { name: 'contact_id', label: 'Contact', type: 'select', optionsFrom: { path: '/contacts', label: 'full_name' } },
  { name: 'source', label: 'Source', type: 'select', options: SOURCES },
  { name: 'expected_close', label: 'Expected close date', type: 'date' },
  { name: 'owner_id', label: 'Owner', type: 'select', optionsFrom: { path: '/users/options', label: 'name' }, visibleTo: TEAM },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const filters = [
  { name: 'stage_id', label: 'All stages', optionsFrom: { path: '/pipeline/stages', label: 'name' } },
  { name: 'status', label: 'Any status', options: ['open', 'won', 'lost'] },
  { name: 'source', label: 'Any source', options: SOURCES },
];

export default function Leads() {
  return (
    <ResourcePage
      title="Leads" noun="lead" path="/leads"
      columns={columns} fields={fields} filters={filters}
      intro="Every deal your team is working on, from first contact to close."
    />
  );
}
