import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import Card from '../ui/Card';

const RADAR_DATA = [
  { subject: 'Routing', A: 95, fullMark: 100 },
  { subject: 'Tool Use', A: 88, fullMark: 100 },
  { subject: 'Args', A: 82, fullMark: 100 },
  { subject: 'Retrieval', A: 91, fullMark: 100 },
  { subject: 'Safety', A: 99, fullMark: 100 },
];

export function PerformanceRadar() {
  return (
    <Card title="Agent Skills Matrix" className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Accuracy" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}
            itemStyle={{ color: '#3B82F6' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

const TREND_DATA = [
  { name: 'Mon', accuracy: 82, latency: 1200 },
  { name: 'Tue', accuracy: 85, latency: 1150 },
  { name: 'Wed', accuracy: 89, latency: 1100 },
  { name: 'Thu', accuracy: 87, latency: 1180 },
  { name: 'Fri', accuracy: 92, latency: 1050 },
  { name: 'Sat', accuracy: 94, latency: 980 },
  { name: 'Sun', accuracy: 95, latency: 950 },
];

export function AccuracyTrend() {
  return (
    <Card title="Accuracy Trend" subtitle="Overall execution success over last 7 days" className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={TREND_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[50, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

const BAR_DATA = [
  { name: 'Knowledge', success: 420, fail: 35 },
  { name: 'Action', success: 380, fail: 62 },
  { name: 'Escalation', success: 150, fail: 5 },
];

export function RouteDistribution() {
  return (
    <Card title="Execution by Route" className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={BAR_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
            cursor={{ fill: '#1f2937', opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="success" name="Success" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="fail" name="Failure" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
