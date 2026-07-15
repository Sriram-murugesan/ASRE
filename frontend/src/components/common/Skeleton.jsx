import React from 'react';

function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-card rounded-xl ${className}`} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 bg-background rounded-full" />
        <div className="w-8 h-8 bg-background rounded-lg" />
      </div>
      <div className="h-8 w-20 bg-background rounded-full mb-2" />
      <div className="h-3 w-16 bg-background rounded-full" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 bg-card rounded-full" style={{ width: `${40 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ height = 'h-48' }) {
  return (
    <div className={`bg-card border border-border rounded-xl ${height} animate-pulse`}>
      <div className="p-4 border-b border-border">
        <div className="h-4 w-40 bg-background rounded-full mb-2" />
        <div className="h-3 w-60 bg-background rounded-full" />
      </div>
    </div>
  );
}

export default SkeletonBlock;
