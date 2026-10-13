import ResourcePage from '../components/ResourcePage.jsx';

const columns = [
  { key: 'name', label: 'Template' },
  { key: 'subject', label: 'Subject' },
  { key: 'created_by_name', label: 'Created by' },
];

const fields = [
  { name: 'name', label: 'Template name', required: true },
  { name: 'subject', label: 'Subject', required: true },
  {
    name: 'body', label: 'Message', type: 'textarea', rows: 9, required: true,
    hint: 'Placeholders: {{first_name}}, {{last_name}}, {{company}}, {{lead_title}}, {{deal_value}}, {{sender_name}}',
  },
];

export default function Templates() {
  return (
    <ResourcePage
      title="Email templates" noun="template" path="/templates"
      columns={columns} fields={fields}
      intro="Reusable messages. Open a lead and choose a template to fill in the details automatically."
    />
  );
}
