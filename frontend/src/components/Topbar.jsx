import { useAuth } from '../context/AuthContext.jsx';
import { roleLabel } from '../utils/format.js';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-user">
        <strong>{user.name}</strong>
        <span className="muted">{roleLabel(user.role)}</span>
      </div>
      <button className="btn btn-ghost" onClick={logout}>Sign out</button>
    </header>
  );
}
