import ResourcePage from '../components/ResourcePage.jsx';

const TEAM = ['admin', 'manager'];

const columns = [
  { key: 'full_name', label: 'Name' },
  { key: 'job_title', label: 'Job title' },
  { key: 'company_name', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'owner_name', label: 'Owner' },
];

const fields = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'job_title', label: 'Job title' },
  { name: 'company_id', label: 'Company', type: 'select', optionsFrom: { path: '/companies', label: 'name' } },
  { name: 'owner_id', label: 'Owner', type: 'select', optionsFrom: { path: '/users/options', label: 'name' }, visibleTo: TEAM },
];

const filters = [
  { name: 'company_id', label: 'All companies', optionsFrom: { path: '/companies', label: 'name' } },
];

export default function Contacts() {
  return (
    <ResourcePage
      title="Contacts" noun="contact" path="/contacts"
      columns={columns} fields={fields} filters={filters}
      intro="People at the companies you sell to."
    />
  );
}
