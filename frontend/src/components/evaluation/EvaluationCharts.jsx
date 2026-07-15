import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, Area
} from 'recharts';
import Card from '../ui/Card';

const data = [
  { name: 'Run 1', routing: 85, toolArgs: 80, retrieval: 90, totalScore: 85 },
  { name: 'Run 2', routing: 88, toolArgs: 82, retrieval: 92, totalScore: 87.3 },
  { name: 'Run 3', routing: 92, toolArgs: 85, retrieval: 89, totalScore: 88.6 },
  { name: 'Run 4', routing: 95, toolArgs: 89, retrieval: 94, totalScore: 92.6 },
  { name: 'Run 5', routing: 94, toolArgs: 91, retrieval: 95, totalScore: 93.3 },
  { name: 'Run 6', routing: 98, toolArgs: 95, retrieval: 96, totalScore: 96.3 },
  { name: 'Run 7', routing: 97, toolArgs: 94, retrieval: 98, totalScore: 96.3 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function EvaluationProgressChart() {
  return (
    <Card className="h-[400px] flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Evaluation Progress</h3>
        <p className="text-sm text-muted">Accuracy improvements across evaluation runs.</p>
      </div>
      <div className="flex-1 p-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[70, 100]} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            <Area type="monotone" dataKey="totalScore" name="Overall Score" fill="url(#colorScore)" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="routing" name="Routing" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="toolArgs" name="Tool Args" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="retrieval" name="Retrieval" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
