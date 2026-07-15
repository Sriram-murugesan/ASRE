import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';

const mockData = Array.from({ length: 25 }, (_, i) => ({
  id: `eval-run-${1000 + i}`,
  date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
  dataset: 'Golden Set - Phase 1',
  routing: Math.floor(Math.random() * 20) + 80,
  toolArgs: Math.floor(Math.random() * 25) + 75,
  retrieval: Math.floor(Math.random() * 15) + 85,
  status: Math.random() > 0.8 ? 'failed' : 'passed',
}));

export default function EvaluationTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockData.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dataset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Evaluations</h3>
          <p className="text-sm text-muted">Detailed view of all automated test runs.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search runs..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-foreground w-full sm:w-64"
            />
          </div>
          <button className="p-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted/10 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase bg-card/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Run ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Dataset</th>
              <th className="px-6 py-4 font-medium">Routing Acc.</th>
              <th className="px-6 py-4 font-medium">Tool Args Acc.</th>
              <th className="px-6 py-4 font-medium">Retrieval</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((run) => (
              <tr key={run.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-6 py-4 font-mono text-primary">{run.id}</td>
                <td className="px-6 py-4 text-muted">{run.date}</td>
                <td className="px-6 py-4 text-foreground">{run.dataset}</td>
                <td className="px-6 py-4">
                  <span className={run.routing > 90 ? 'text-success' : 'text-warning'}>{run.routing}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className={run.toolArgs > 90 ? 'text-success' : 'text-warning'}>{run.toolArgs}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className={run.retrieval > 90 ? 'text-success' : 'text-warning'}>{run.retrieval}%</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge 
                    status={run.status === 'passed' ? 'success' : 'error'} 
                    text={run.status.toUpperCase()} 
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted hover:text-primary transition-colors p-1">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-muted">
                  No evaluation runs found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between text-sm">
        <div className="text-muted">
          Showing {Math.min(filteredData.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, page * itemsPerPage)} of {filteredData.length} entries
        </div>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 border border-border rounded-md hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 border border-border rounded-md hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
