const TONES = {
  open: 'blue', won: 'green', lost: 'red', done: 'green',
  low: 'gray', medium: 'amber', high: 'red',
  admin: 'amber', manager: 'blue', sales_rep: 'gray',
  true: 'green', false: 'gray',
};

export default function Badge({ value, label, tone }) {
  const t = tone || TONES[String(value)] || 'gray';
  const text = label || String(value).replace('_', ' ');
  return <span className={`badge badge-${t}`}>{text}</span>;
}
