import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/Badge.jsx';
import { roleLabel } from '../utils/format.js';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (r) => <Badge value={r.role} label={roleLabel(r.role)} /> },
  { key: 'active', label: 'Access', render: (r) => <Badge value={r.active} label={r.active ? 'Active' : 'Disabled'} /> },
];

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  {
    name: 'role', label: 'Role', type: 'select', required: true, default: 'sales_rep',
    options: [
      { value: 'sales_rep', label: 'Sales rep' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' },
    ],
  },
  { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, hint: 'At least 8 characters. Leave blank to keep the current password.' },
  { name: 'active', label: 'Can sign in', type: 'checkbox' },
];

export default function Users() {
  return (
    <ResourcePage
      title="Team" noun="user" path="/users"
      columns={columns} fields={fields}
      canDelete={(u) => u.role === 'admin'}
      intro="Admins manage accounts. Managers can view the team. Sales reps only see their own leads and tasks."
    />
  );
}
