import React from 'react';

export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`bg-card rounded-xl border border-[#1f2937] overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-[#1f2937] flex justify-between items-center bg-[#111827]">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
