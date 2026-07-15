import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Wrench, 
  BrainCircuit, 
  Search, 
  ShieldCheck 
} from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import { PerformanceRadar, AccuracyTrend, RouteDistribution } from '../components/dashboard/Charts';
import { RecentRunsTable } from '../components/dashboard/RecentRunsTable';

const METRICS = [
  { title: 'Routing Accuracy', value: '95.2%', trend: 'up', trendValue: '+2.1%', icon: Target, color: 'primary' },
  { title: 'Tool Accuracy', value: '88.4%', trend: 'up', trendValue: '+1.5%', icon: Wrench, color: 'warning' },
  { title: 'Argument Accuracy', value: '82.1%', trend: 'down', trendValue: '-0.8%', icon: BrainCircuit, color: 'danger' },
  { title: 'Retrieval Recall', value: '91.7%', trend: 'up', trendValue: '+4.2%', icon: Search, color: 'primary' },
  { title: 'Escalation Safety', value: '99.9%', trend: 'up', trendValue: '+0.1%', icon: ShieldCheck, color: 'success' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-muted mt-1">Real-time observability and evaluation metrics for ASRE.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {METRICS.map((metric, index) => (
          <motion.div key={index} variants={itemVariants}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <PerformanceRadar />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AccuracyTrend />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <RecentRunsTable />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RouteDistribution />
        </motion.div>
      </motion.div>
    </div>
  );
}
