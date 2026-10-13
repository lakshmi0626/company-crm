import { formatDateTime } from '../utils/format.js';
import EmptyState from './EmptyState.jsx';

const sentence = (a) => {
  const what = a.details && (a.details.label || a.details.stage) ? ` “${a.details.label || ''}”` : '';
  const stage = a.action === 'moved' && a.details.stage ? ` to ${a.details.stage}` : '';
  return `${a.user_name || 'Someone'} ${a.action} a ${a.entity}${what}${stage}`;
};

export default function ActivityFeed({ items }) {
  if (!items.length) return <EmptyState title="No activity yet">Actions your team takes will show up here.</EmptyState>;
  return (
    <ul className="feed">
      {items.map((a) => (
        <li key={a.id}>
          <span>{sentence(a)}</span>
          <span className="muted">{formatDateTime(a.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
