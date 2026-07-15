import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Target, 
  Wrench, 
  Search, 
  Activity,
  Play
} from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import EvaluationTable from '../components/evaluation/EvaluationTable';
import { EvaluationProgressChart } from '../components/evaluation/EvaluationCharts';

const METRICS = [
  { title: 'Overall Score', value: '96.3%', trend: 'up', trendValue: '+3.0%', icon: BarChart2, color: 'primary' },
  { title: 'Routing Acc.', value: '97.0%', trend: 'up', trendValue: '+2.1%', icon: Target, color: 'success' },
  { title: 'Tool Args Acc.', value: '94.5%', trend: 'up', trendValue: '+3.5%', icon: Wrench, color: 'warning' },
  { title: 'Retrieval Recall', value: '98.1%', trend: 'up', trendValue: '+1.2%', icon: Search, color: 'primary' },
  { title: 'Total Runs', value: '24', trend: 'up', trendValue: '+4 this week', icon: Activity, color: 'success' },
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

export default function EvaluationDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Evaluation Dashboard</h1>
          <p className="text-muted mt-1">Track ASRE's performance against the golden dataset.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Play size={16} />
          Run Evaluation
        </button>
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
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <EvaluationProgressChart />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="h-[600px]"
      >
        <EvaluationTable />
      </motion.div>
    </div>
  );
}
