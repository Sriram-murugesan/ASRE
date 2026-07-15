import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import RetrievalChunk from '../components/retrieval/RetrievalChunk';

const MOCK_CHUNKS = [
  {
    id: 'chunk-001',
    source: 'Refund Policy v2.1 – Section 3',
    type: 'Policy',
    similarity: 0.94,
    tokens: 142,
    page: 'Page 3',
    highlight: '30-day return window',
    text: 'All products are eligible for a refund within the 30-day return window from the date of purchase. The customer must provide proof of purchase and the item must be in its original condition. Digital products and service subscriptions are non-refundable after 48 hours of activation. Partial refunds may be issued at our discretion for items showing signs of use.',
  },
  {
    id: 'chunk-002',
    source: 'Customer Support Handbook – Escalation',
    type: 'Handbook',
    similarity: 0.87,
    tokens: 98,
    page: 'Page 12',
    highlight: 'escalate to Tier 2',
    text: 'When a customer dispute cannot be resolved within two interactions, the support agent must escalate to Tier 2 within 4 business hours. Document all prior attempts in the CRM before handoff. Include the full conversation thread, the specific unresolved issue, and any refund or credit amounts already discussed.',
  },
  {
    id: 'chunk-003',
    source: 'Order Management FAQ – Returns',
    type: 'FAQ',
    similarity: 0.81,
    tokens: 76,
    page: 'Page 5',
    highlight: 'original payment method',
    text: 'Approved refunds are returned to the original payment method within 5-7 business days. Store credit is applied immediately. If the original payment method is no longer valid (expired card, closed account), the customer must provide an alternative. Refunds to gift cards are processed instantly.',
  },
  {
    id: 'chunk-004',
    source: 'Terms of Service – Section 8',
    type: 'Legal',
    similarity: 0.73,
    tokens: 123,
    page: 'Page 18',
    highlight: 'waive your right',
    text: 'By accepting a store credit in lieu of a refund, you agree to waive your right to dispute the original charge with your payment provider. This agreement is binding and cannot be reversed after the credit is applied to your account. You retain the right to use the store credit indefinitely as it does not expire.',
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

export default function RetrievalViewer() {
  const [query, setQuery] = useState('');
  const filtered = MOCK_CHUNKS.filter(c =>
    query === '' ||
    c.source.toLowerCase().includes(query.toLowerCase()) ||
    c.type.toLowerCase().includes(query.toLowerCase())
  );

  const avgSim = (filtered.reduce((a, c) => a + c.similarity, 0) / (filtered.length || 1) * 100).toFixed(1);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Retrieval Viewer</h1>
          <p className="text-muted mt-1">Inspect the knowledge chunks retrieved for each query.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm">
            <span className="text-muted">Avg Similarity: </span>
            <span className="font-bold text-primary">{avgSim}%</span>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm">
            <span className="text-muted">Chunks: </span>
            <span className="font-bold text-foreground">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Query Context */}
      <Card>
        <div className="p-5">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">User Query</div>
          <div className="text-foreground text-base border-l-2 border-primary pl-4 py-1 italic">
            "I want to cancel my order ORD-789 and get a full refund."
          </div>
        </div>
      </Card>

      {/* Search / Filter */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Filter by source or type..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-foreground"
          />
        </div>
        <button className="p-2.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted/10 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Chunks */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Database size={40} className="opacity-20" />
            <p className="text-sm">No chunks match your filter.</p>
          </div>
        ) : (
          filtered.map((chunk, i) => (
            <motion.div key={chunk.id} variants={itemVariants}>
              <RetrievalChunk chunk={chunk} index={i} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
