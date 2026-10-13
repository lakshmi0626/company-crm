export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className={accent ? 'stat stat-accent' : 'stat'}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
