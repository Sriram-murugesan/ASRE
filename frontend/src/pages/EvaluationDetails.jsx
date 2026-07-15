import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bug, Database } from 'lucide-react';
import FailureExplorer from '../components/evaluation/FailureExplorer';
import GoldenDatasetTable from '../components/evaluation/GoldenDatasetTable';

export default function EvaluationDetails() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState('failure');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/evaluation" className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Evaluation Details
            <span className="text-sm font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-md border border-primary/30">
              {caseId || 'eval-case-42'}
            </span>
          </h1>
          <p className="text-muted mt-1 text-sm">Analyze failure points and manage golden dataset references.</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'failure' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted hover:text-foreground hover:border-border'
          }`}
          onClick={() => setActiveTab('failure')}
        >
          <Bug size={16} />
          Failure Explorer
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dataset' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted hover:text-foreground hover:border-border'
          }`}
          onClick={() => setActiveTab('dataset')}
        >
          <Database size={16} />
          Golden Dataset
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'failure' ? (
          <div className="space-y-6">
            <FailureExplorer />
          </div>
        ) : (
          <GoldenDatasetTable />
        )}
      </div>
    </div>
  );
}
