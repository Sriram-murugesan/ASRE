import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 85 ? 'bg-success' : pct >= 70 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-10 text-right ${
        pct >= 85 ? 'text-success' : pct >= 70 ? 'text-warning' : 'text-danger'
      }`}>{pct}%</span>
    </div>
  );
}

export default function RetrievalChunk({ chunk, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/5 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground truncate">{chunk.source}</span>
            <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full border border-border shrink-0">{chunk.type}</span>
          </div>
          <ScoreBar score={chunk.similarity} />
        </div>
        <div className="shrink-0 text-muted">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 bg-background/50">
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <Database size={12} />
            Retrieved Content
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {chunk.text.split(chunk.highlight).map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <mark className="bg-primary/20 text-primary rounded px-0.5 not-italic">
                    {chunk.highlight}
                  </mark>
                )}
              </React.Fragment>
            ))}
          </p>
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted">
            <span>Chunk ID: <span className="font-mono text-foreground">{chunk.id}</span></span>
            <span>Tokens: <span className="font-mono text-foreground">{chunk.tokens}</span></span>
            <span>Source Page: <span className="font-mono text-foreground">{chunk.page}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
