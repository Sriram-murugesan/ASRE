import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import ToolCallCard from '../components/tool/ToolCallCard';

const MOCK_TOOLS = [
  {
    name: 'calculate_refund_amount',
    status: 'success',
    latency: 312,
    description: 'Computes refund for a given order',
    args: { order_id: 'ORD-789', refund_type: 'full', reason: 'customer_request' },
    result: { amount: '$49.99', currency: 'USD', eligible: true, processing_days: 5 },
  },
  {
    name: 'get_order_details',
    status: 'success',
    latency: 88,
    description: 'Fetches order metadata from OMS',
    args: { order_id: 'ORD-789', include_items: true },
    result: { order_id: 'ORD-789', status: 'delivered', total: '$49.99', items: 2, placed_at: '2026-06-30' },
  },
  {
    name: 'check_return_eligibility',
    status: 'success',
    latency: 55,
    description: 'Verifies policy compliance for return',
    args: { order_id: 'ORD-789', days_since_delivery: 12 },
    result: { eligible: true, policy: 'standard_30_day', remaining_days: 18 },
  },
  {
    name: 'send_confirmation_email',
    status: 'error',
    latency: 203,
    description: 'Sends refund confirmation email to customer',
    args: { customer_id: 'usr_4521', template: 'refund_initiated', amount: '$49.99' },
    result: { error: 'SMTP_TIMEOUT', message: 'Email gateway did not respond within 200ms. Retry scheduled.' },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ToolInspector() {
  const [filter, setFilter] = useState('all');
  const totalLatency = MOCK_TOOLS.reduce((a, t) => a + t.latency, 0);
  const successCount = MOCK_TOOLS.filter(t => t.status === 'success').length;

  const filtered = MOCK_TOOLS.filter(t =>
    filter === 'all' || t.status === filter
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tool Inspector</h1>
          <p className="text-muted mt-1">Detailed view of all tool calls made during agent execution.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Calls', value: MOCK_TOOLS.length, icon: Wrench, color: 'text-primary' },
          { label: 'Succeeded', value: successCount, icon: CheckCircle2, color: 'text-success' },
          { label: 'Failed', value: MOCK_TOOLS.length - successCount, icon: XCircle, color: 'text-danger' },
          { label: 'Total Latency', value: `${totalLatency}ms`, icon: Clock, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">{stat.label}</div>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted" />
        {['all', 'success', 'error'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-muted border-border hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tool Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filtered.map((tool, i) => (
          <motion.div key={tool.name} variants={itemVariants}>
            <ToolCallCard tool={tool} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
