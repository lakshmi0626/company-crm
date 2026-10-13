import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">That address doesn't match anything in the CRM.</p>
      <Link className="btn btn-primary" to="/">Go to dashboard</Link>
    </section>
  );
}
