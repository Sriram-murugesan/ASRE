import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Route, Box, ShieldCheck, Activity, Square, AlertTriangle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const iconMap = {
  START: Play,
  Router: Route,
  Knowledge: Box,
  Action: ShieldCheck,
  Generator: Activity,
  Escalation: AlertTriangle,
  END: Square,
};

const CustomNode = ({ data, isConnectable }) => {
  const Icon = iconMap[data.type] || Activity;
  const isEndpoint = data.type === 'START' || data.type === 'END';

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[200px] transition-all
      ${data.isActive ? 'border-primary shadow-primary/20 bg-card/95' : 'border-border bg-card/80'}
      ${data.status === 'error' ? 'border-danger' : ''}
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 bg-muted border-2 border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isEndpoint ? 'bg-primary/20 text-primary' :
          data.status === 'error' ? 'bg-danger/20 text-danger' :
          'bg-muted/20 text-muted-foreground'
        }`}>
          <Icon size={16} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground truncate">{data.label}</div>
          {!isEndpoint && (
            <div className="text-xs text-muted font-mono mt-0.5">{data.latency || '0'}ms</div>
          )}
        </div>
        
        {data.status && data.status !== 'pending' && !isEndpoint && (
          <div className="shrink-0 ml-2">
            <StatusBadge status={data.status} />
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-2.5 h-2.5 bg-muted border-2 border-background"
      />
    </div>
  );
};

export default memo(CustomNode);
