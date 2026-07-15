import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus } from 'lucide-react';
import Card from '../ui/Card';

const mockDataset = [
  {
    id: 'gd-001',
    query: 'Can you cancel my order #99281?',
    expectedRoute: 'cancel_order',
    expectedTool: 'execute_cancellation',
    expectedArgs: '{"order_id": "99281"}',
    retrievalKeywords: 'cancellation policy, refund timeframe'
  },
  {
    id: 'gd-002',
    query: 'How much does shipping cost for a 5lb package?',
    expectedRoute: 'shipping_inquiry',
    expectedTool: 'calculate_shipping',
    expectedArgs: '{"weight_lbs": 5}',
    retrievalKeywords: 'shipping rates, weight calculation'
  },
  {
    id: 'gd-003',
    query: 'The app keeps crashing when I open the settings menu.',
    expectedRoute: 'tech_support',
    expectedTool: 'log_bug_ticket',
    expectedArgs: '{"category": "app_crash", "location": "settings_menu"}',
    retrievalKeywords: 'known issues, troubleshooting steps'
  }
];

export default function GoldenDatasetTable() {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Golden Dataset</h3>
          <p className="text-sm text-muted">Manage the reference cases used for evaluation.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors text-sm">
          <Plus size={16} />
          Add Case
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase bg-card/50 border-b border-border">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-6 py-3 font-medium">Case ID</th>
              <th className="px-6 py-3 font-medium">Query</th>
              <th className="px-6 py-3 font-medium">Expected Route</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockDataset.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleRow(item.id)}>
                    {expandedRows[item.id] ? (
                      <ChevronUp size={16} className="text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-muted" />
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">{item.id}</td>
                  <td className="px-6 py-4 text-foreground font-medium truncate max-w-md">{item.query}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted/10 text-muted rounded text-xs">{item.expectedRoute}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-muted hover:text-primary transition-colors p-1"><Edit2 size={16} /></button>
                      <button className="text-muted hover:text-danger transition-colors p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                {expandedRows[item.id] && (
                  <tr className="bg-muted/5 border-t-0">
                    <td colSpan="5" className="px-14 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs text-muted uppercase tracking-wider mb-1">Expected Tool</div>
                          <div className="font-mono text-sm bg-background border border-border p-2 rounded">{item.expectedTool}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase tracking-wider mb-1">Expected Arguments</div>
                          <div className="font-mono text-sm bg-background border border-border p-2 rounded">{item.expectedArgs}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted uppercase tracking-wider mb-1">Retrieval Keywords</div>
                          <div className="text-sm bg-background border border-border p-2 rounded">{item.retrievalKeywords}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
