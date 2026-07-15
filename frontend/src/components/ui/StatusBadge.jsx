import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function StatusBadge({ status, text }) {
  const config = {
    success: { icon: CheckCircle2, colors: 'bg-success/10 text-success border-success/20' },
    warning: { icon: AlertCircle, colors: 'bg-warning/10 text-warning border-warning/20' },
    error: { icon: XCircle, colors: 'bg-danger/10 text-danger border-danger/20' },
    pending: { icon: Clock, colors: 'bg-muted/10 text-muted border-muted/20' },
  };

  const { icon: Icon, colors } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors}`}>
      <Icon className="w-3.5 h-3.5" />
      {text || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
