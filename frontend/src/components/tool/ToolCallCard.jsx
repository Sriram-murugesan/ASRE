import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Wrench } from 'lucide-react';

function ArgRow({ argKey, argValue }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-mono text-primary w-28 shrink-0 pt-0.5">{argKey}</span>
      <span className="text-xs font-mono text-foreground break-all bg-background px-2 py-1 rounded border border-border flex-1">
        {typeof argValue === 'object' ? JSON.stringify(argValue) : String(argValue)}
      </span>
    </div>
  );
}

export default function ToolCallCard({ tool, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const success = tool.status === 'success';

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      success ? 'border-border hover:border-success/30' : 'border-danger/30 hover:border-danger/60'
    } bg-card`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/5 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          <Wrench size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground font-mono">{tool.name}</span>
            {success
              ? <CheckCircle2 size={14} className="text-success shrink-0" />
              : <XCircle size={14} className="text-danger shrink-0" />
            }
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock size={10} />
              {tool.latency}ms
            </span>
            <span className="text-xs text-muted">{tool.description}</span>
          </div>
        </div>
        <div className="shrink-0 text-muted">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-background/50">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Arguments</h4>
            <div className="divide-y divide-border/50">
              {Object.entries(tool.args).map(([k, v]) => (
                <ArgRow key={k} argKey={k} argValue={v} />
              ))}
            </div>
          </div>

          {tool.result && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Result</h4>
              <pre className={`text-xs font-mono p-3 rounded-lg border overflow-x-auto ${
                success
                  ? 'bg-success/5 border-success/20 text-success/90'
                  : 'bg-danger/5 border-danger/20 text-danger/90'
              }`}>
                {typeof tool.result === 'object'
                  ? JSON.stringify(tool.result, null, 2)
                  : tool.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
