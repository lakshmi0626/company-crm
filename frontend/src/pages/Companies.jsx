import ResourcePage from '../components/ResourcePage.jsx';

const TEAM = ['admin', 'manager'];

const columns = [
  { key: 'name', label: 'Company' },
  { key: 'industry', label: 'Industry' },
  { key: 'size', label: 'Employees' },
  { key: 'website', label: 'Website' },
  { key: 'phone', label: 'Phone' },
  { key: 'owner_name', label: 'Owner' },
];

const fields = [
  { name: 'name', label: 'Company name', required: true },
  { name: 'industry', label: 'Industry' },
  { name: 'size', label: 'Employees', type: 'select', options: ['1-10', '10-40', '40-100', '100-500', '500+'] },
  { name: 'website', label: 'Website' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'address', label: 'Address', type: 'textarea', rows: 3 },
  { name: 'owner_id', label: 'Owner', type: 'select', optionsFrom: { path: '/users/options', label: 'name' }, visibleTo: TEAM },
];

export default function Companies() {
  return (
    <ResourcePage
      title="Companies" noun="company" path="/companies"
      columns={columns} fields={fields}
      intro="Accounts your team sells to. Link contacts and leads to a company to keep history together."
    />
  );
}
