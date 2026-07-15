import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ code, language = 'json', title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-danger/50" />
            <div className="w-3 h-3 rounded-full bg-warning/50" />
            <div className="w-3 h-3 rounded-full bg-success/50" />
          </div>
          {title && <span className="text-xs text-muted ml-2">{title}</span>}
          {language && (
            <span className="text-xs font-mono text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/10"
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="text-xs text-foreground/90 font-mono p-4 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}
