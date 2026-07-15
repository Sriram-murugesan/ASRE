import React from 'react';
import { Activity, Clock, ShieldCheck, Box, Route } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { motion } from 'framer-motion';

const ExecutionStep = ({ step, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex gap-3 mb-4 last:mb-0 relative"
  >
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
        step.status === 'success' ? 'border-success text-success bg-success/10' :
        step.status === 'error' ? 'border-danger text-danger bg-danger/10' :
        'border-primary text-primary bg-primary/10'
      }`}>
        <step.icon size={14} />
      </div>
      {index !== 4 && <div className="w-px h-full bg-border mt-2" />}
    </div>
    
    <div className="flex-1 pb-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
        <span className="text-xs text-muted font-mono">{step.latency}ms</span>
      </div>
      <p className="text-xs text-muted mb-2">{step.description}</p>
      
      {step.details && (
        <div className="bg-card border border-border rounded-md p-2 text-xs font-mono text-muted overflow-x-auto">
          {step.details}
        </div>
      )}
    </div>
  </motion.div>
);

export default function ExecutionPanel({ executionData }) {
  if (!executionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted p-6 text-center">
        <Activity size={48} className="mb-4 opacity-20" />
        <p>No execution data available.</p>
        <p className="text-sm mt-2">Send a message to view the agent's thought process.</p>
      </div>
    );
  }

  const steps = [
    { title: 'Intent Classification', description: 'Routed to Policy Handler', latency: 45, status: 'success', icon: Route, details: '{"route": "refund_policy", "confidence": 0.98}' },
    { title: 'Knowledge Retrieval', description: 'Queried ASRE Vector Store', latency: 120, status: 'success', icon: Box, details: 'Found 3 relevant chunks with avg sim 0.85' },
    { title: 'Tool Execution', description: 'calculate_refund_amount', latency: 310, status: 'success', icon: ShieldCheck, details: '{"amount": "$45.99", "order_id": "ORD-123"}' },
    { title: 'Response Generation', description: 'Synthesized final response', latency: 850, status: 'success', icon: Activity, details: 'Token count: 124 input, 45 output' }
  ];

  return (
    <div className="h-full flex flex-col bg-background/50 border-l border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Activity size={18} className="text-primary" />
          Execution Trace
        </div>
        <StatusBadge status="success" text="Completed" />
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-border bg-card/30">
        <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
          <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
            <Clock size={12} /> Total Latency
          </span>
          <span className="text-lg font-semibold text-foreground">1.32s</span>
        </div>
        <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
          <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
            <ShieldCheck size={12} /> Confidence
          </span>
          <span className="text-lg font-semibold text-success">98.5%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Step-by-Step Breakdown</h3>
        <div className="mt-2">
          {steps.map((step, idx) => (
            <ExecutionStep key={idx} step={step} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
