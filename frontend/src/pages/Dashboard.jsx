import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import PipelineChart from '../components/PipelineChart.jsx';
import SourceChart from '../components/SourceChart.jsx';
import WonChart from '../components/WonChart.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { compactMoney } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p className="muted">Loading dashboard…</p>;

  const t = data.totals;
  const closed = t.won_count + t.lost_count;
  const winRate = closed ? Math.round((t.won_count / closed) * 100) : 0;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="muted">
            {user.role === 'sales_rep' ? 'Figures below cover your own leads and tasks.' : 'Figures below cover the whole team.'}
          </p>
        </div>
      </div>

      <div className="stats">
        <StatCard accent label="Open pipeline value" value={compactMoney(t.pipeline_value)} hint={`${t.open_leads} open leads`} />
        <StatCard label="Won value" value={compactMoney(t.won_value)} hint={`${t.won_count} deals won`} />
        <StatCard label="Win rate" value={`${winRate}%`} hint={closed ? `${closed} closed deals` : 'No closed deals yet'} />
        <StatCard label="Tasks due" value={t.tasks_due} hint="Due today or overdue" />
        <StatCard label="Contacts" value={t.contacts} hint={`${t.companies} companies`} />
      </div>

      <div className="grid-2">
        <div className="panel"><h2>Pipeline value by stage</h2><PipelineChart data={data.byStage} /></div>
        <div className="panel"><h2>Leads by source</h2>
          {data.bySource.length ? <SourceChart data={data.bySource} /> : <EmptyState title="No leads yet">Add a lead to see where they come from.</EmptyState>}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel"><h2>Won value, last 6 months</h2>
          {data.monthlyWon.length ? <WonChart data={data.monthlyWon} /> : <EmptyState title="No won deals yet">Move a lead to Won to start this chart.</EmptyState>}
        </div>
        <div className="panel"><h2>Recent activity</h2><ActivityFeed items={data.recentActivity} /></div>
      </div>
    </section>
  );
}
