import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create the admin account</h1>
        <p className="muted">This first account manages the team. Everyone else is added by an admin.</p>
        {error && <div className="alert">{error}</div>}
        <div className="field"><label htmlFor="name">Full name</label>
          <input id="name" className="input" value={form.name} required onChange={set('name')} /></div>
        <div className="field"><label htmlFor="email">Work email</label>
          <input id="email" className="input" type="email" value={form.email} required onChange={set('email')} /></div>
        <div className="field"><label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" minLength={8} value={form.password} required onChange={set('password')} />
          <small className="muted">At least 8 characters</small></div>
        <button className="btn btn-primary wide" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted"><Link to="/login">Back to sign in</Link></p>
      </form>
    </div>
  );
}
