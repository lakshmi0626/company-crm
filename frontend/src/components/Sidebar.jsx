import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/leads', label: 'Leads' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/companies', label: 'Companies' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/templates', label: 'Email templates' },
  { to: '/import-export', label: 'Import and export', roles: ['admin', 'manager'] },
  { to: '/team', label: 'Team', roles: ['admin', 'manager'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <div className="brand">Company CRM</div>
      <nav>
        {LINKS.filter((l) => !l.roles || l.roles.includes(user.role)).map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
