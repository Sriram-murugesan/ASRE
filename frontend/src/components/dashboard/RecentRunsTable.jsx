import React from 'react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const RECENT_RUNS = [
  { id: 'RUN-001', query: 'How do I reset my password?', route: 'Knowledge', latency: '1.2s', status: 'success' },
  { id: 'RUN-002', query: 'Issue refund for order #1234', route: 'Action', latency: '3.4s', status: 'success' },
  { id: 'RUN-003', query: 'My account is blocked', route: 'Escalation', latency: '0.8s', status: 'success' },
  { id: 'RUN-004', query: 'Cancel subscription immediately', route: 'Action', latency: '4.1s', status: 'error' },
  { id: 'RUN-005', query: 'What is the pricing for pro?', route: 'Knowledge', latency: '1.5s', status: 'success' },
];

export function RecentRunsTable() {
  return (
    <Card title="Recent Evaluations" action={<Link to="/evaluation" className="text-sm text-primary hover:underline">View All</Link>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted">
          <thead className="text-xs text-white uppercase bg-[#0B1220] border-b border-[#1f2937]">
            <tr>
              <th className="px-6 py-4 font-medium rounded-tl-lg">Run ID</th>
              <th className="px-6 py-4 font-medium">Query</th>
              <th className="px-6 py-4 font-medium">Predicted Route</th>
              <th className="px-6 py-4 font-medium">Latency</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_RUNS.map((run, i) => (
              <tr key={run.id} className={`border-b border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors ${i === RECENT_RUNS.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-6 py-4 font-medium text-white">{run.id}</td>
                <td className="px-6 py-4 truncate max-w-[250px]">{run.query}</td>
                <td className="px-6 py-4">{run.route}</td>
                <td className="px-6 py-4">{run.latency}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-6 py-4">
                  <Link to={`/evaluation/${run.id}`} className="text-primary hover:text-blue-400 transition-colors p-2 hover:bg-primary/10 rounded-md inline-block">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
