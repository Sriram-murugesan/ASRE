import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';

const ComparisonRow = ({ label, expected, actual, isMatch }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/5 transition-colors">
    <div className="font-medium text-foreground flex items-center gap-2">
      {isMatch ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-danger" />}
      {label}
    </div>
    <div>
      <div className="text-xs text-muted mb-1 uppercase tracking-wider">Expected (Golden)</div>
      <div className="font-mono text-sm bg-success/10 text-success/90 p-2 rounded border border-success/20 overflow-x-auto">
        {expected}
      </div>
    </div>
    <div>
      <div className="text-xs text-muted mb-1 uppercase tracking-wider">Actual (Execution)</div>
      <div className={`font-mono text-sm p-2 rounded border overflow-x-auto ${isMatch ? 'bg-success/10 text-success/90 border-success/20' : 'bg-danger/10 text-danger/90 border-danger/20'}`}>
        {actual}
      </div>
    </div>
  </div>
);

export default function FailureExplorer({ data }) {
  // Using some mock data if none provided
  const testData = data || {
    id: "eval-case-42",
    query: "I want to cancel my order ORD-789 and get a full refund.",
    routing: { expected: "refund_policy", actual: "order_status", isMatch: false },
    tool: { expected: "calculate_refund", actual: "check_status", isMatch: false },
    toolArgs: { expected: '{"order_id":"ORD-789"}', actual: '{"order_id":"ORD-789"}', isMatch: true },
    retrieval: { expected: "Refund Policy v2", actual: "Cancellation Policy v1", isMatch: false }
  };

  return (
    <Card className="flex flex-col">
      <div className="p-5 border-b border-border bg-card/50">
        <h3 className="font-semibold text-lg text-foreground mb-1">Failure Explorer</h3>
        <p className="text-sm text-muted">Detailed breakdown of expected vs. actual execution states.</p>
      </div>
      
      <div className="p-5 border-b border-border bg-background">
        <div className="text-sm text-muted mb-2 uppercase tracking-wider font-semibold">User Query</div>
        <div className="text-foreground text-lg border-l-2 border-primary pl-4 py-1">
          "{testData.query}"
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        <ComparisonRow 
          label="Intent Routing" 
          expected={testData.routing.expected} 
          actual={testData.routing.actual} 
          isMatch={testData.routing.isMatch} 
        />
        <ComparisonRow 
          label="Tool Selection" 
          expected={testData.tool.expected} 
          actual={testData.tool.actual} 
          isMatch={testData.tool.isMatch} 
        />
        <ComparisonRow 
          label="Tool Arguments" 
          expected={testData.toolArgs.expected} 
          actual={testData.toolArgs.actual} 
          isMatch={testData.toolArgs.isMatch} 
        />
        <ComparisonRow 
          label="Knowledge Retrieval" 
          expected={testData.retrieval.expected} 
          actual={testData.retrieval.actual} 
          isMatch={testData.retrieval.isMatch} 
        />
      </div>
    </Card>
  );
}
