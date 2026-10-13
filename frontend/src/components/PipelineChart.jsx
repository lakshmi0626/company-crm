import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { compactMoney, money } from '../utils/format.js';

export default function PipelineChart({ data }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#DCE3DF" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickFormatter={compactMoney} tickLine={false} axisLine={false} fontSize={12} width={64} />
          <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#EEF2F0' }} />
          <Bar dataKey="value" name="Value" fill="#1B4A43" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
