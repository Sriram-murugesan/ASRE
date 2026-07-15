import React from 'react';
import { Activity, Clock, ShieldCheck, Box, Route, Zap, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { motion } from 'framer-motion';

const ROUTE_ICON_MAP = {
  knowledge: Box,
  action: ShieldCheck,
  escalation: AlertCircle,
};

const ROUTE_LABEL_MAP = {
  knowledge: 'Knowledge',
  action: 'Action',
  escalation: 'Escalation',
  unknown: 'Unknown',
};

const ExecutionStep = ({ step, index, isLast }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex gap-3 mb-4 last:mb-0 relative"
  >
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
        step.status === 'success' ? 'border-success text-success bg-success/10' :
        step.status === 'error'   ? 'border-danger  text-danger  bg-danger/10'  :
                                    'border-primary text-primary bg-primary/10'
      }`}>
        <step.icon size={14} />
      </div>
      {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
    </div>

    <div className="flex-1 pb-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
        {step.latency != null && (
          <span className="text-xs text-muted font-mono">{step.latency}ms</span>
        )}
      </div>
      <p className="text-xs text-muted mb-2">{step.description}</p>
      {step.details && (
        <div className="bg-card border border-border rounded-md p-2 text-xs font-mono text-muted overflow-x-auto whitespace-pre-wrap break-all">
          {step.details}
        </div>
      )}
    </div>
  </motion.div>
);

/**
 * Build step list from the real execution object returned by POST /chat.
 * Shape: { route, route_confidence, nodes_visited, answer,
 *           tool_called, tool_args, tool_result,
 *           retrieval: { chunks }, tools: { tools } }
 */
function buildSteps(exec) {
  const steps = [];

  // ── Step 1: Router / Intent Classification ─────────────────────────
  steps.push({
    title: 'Intent Classification',
    description: `Routed to ${ROUTE_LABEL_MAP[exec.route] ?? exec.route} handler`,
    status: 'success',
    icon: Route,
    details: JSON.stringify({ route: exec.route, confidence: exec.route_confidence }, null, 2),
  });

  // ── Step 2: Knowledge Retrieval (only for knowledge route) ─────────
  if (exec.route === 'knowledge') {
    const chunks = exec.retrieval?.chunks ?? [];
    steps.push({
      title: 'Knowledge Retrieval',
      description: chunks.length > 0
        ? `Retrieved ${chunks.length} relevant chunk${chunks.length !== 1 ? 's' : ''} from knowledge base`
        : 'No relevant documents found in knowledge base',
      status: chunks.length > 0 ? 'success' : 'error',
      icon: Box,
      details: chunks.length > 0
        ? chunks.map(c => `[${c.id}]\n${c.content}`).join('\n\n---\n\n')
        : 'Retriever returned 0 results for this query.',
    });
  }

  // ── Step 3: Tool Execution (only for action route) ─────────────────
  if (exec.route === 'action') {
    const toolList = exec.tools?.tools ?? [];
    const tool = toolList[0];
    steps.push({
      title: 'Tool Execution',
      description: tool ? tool.name : 'No tool called',
      status: tool ? 'success' : 'error',
      icon: ShieldCheck,
      details: tool
        ? JSON.stringify({ args: tool.args, result: tool.result }, null, 2)
        : 'No tool was executed.',
    });
  }

  // ── Step 4: Escalation ─────────────────────────────────────────────
  if (exec.route === 'escalation') {
    steps.push({
      title: 'Escalation',
      description: 'Case routed to human agent',
      status: 'success',
      icon: AlertCircle,
      details: 'This query required human review and has been escalated.',
    });
  }

  // ── Step 5: Response Generation ────────────────────────────────────
  steps.push({
    title: 'Response Generation',
    description: 'Synthesized final response',
    status: 'success',
    icon: Activity,
    details: exec.answer
      ? `Answer: ${exec.answer.slice(0, 200)}${exec.answer.length > 200 ? '…' : ''}`
      : undefined,
  });

  return steps;
}

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

  const steps = buildSteps(executionData);
  // Compute displayed latency from timestamp if available (else show N/A)
  const latencyDisplay = executionData.latency != null
    ? `${(executionData.latency / 1000).toFixed(2)}s`
    : 'N/A';
  const confidenceDisplay = executionData.route_confidence === 'high'
    ? 'High'
    : executionData.route_confidence === 'low'
    ? 'Low'
    : executionData.route_confidence ?? '—';

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
            <Clock size={12} /> Route
          </span>
          <span className="text-sm font-semibold text-foreground capitalize">
            {ROUTE_LABEL_MAP[executionData.route] ?? executionData.route ?? '—'}
          </span>
        </div>
        <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
          <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
            <ShieldCheck size={12} /> Confidence
          </span>
          <span className={`text-sm font-semibold ${
            executionData.route_confidence === 'high' ? 'text-success' :
            executionData.route_confidence === 'low'  ? 'text-danger'  : 'text-foreground'
          }`}>
            {confidenceDisplay}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Step-by-Step Breakdown
        </h3>
        <div className="mt-2">
          {steps.map((step, idx) => (
            <ExecutionStep
              key={idx}
              step={step}
              index={idx}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
