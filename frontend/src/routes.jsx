import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import EvaluationDashboard from './pages/EvaluationDashboard';
import EvaluationDetails from './pages/EvaluationDetails';
import ExecutionGraph from './pages/ExecutionGraph';
import RetrievalViewer from './pages/RetrievalViewer';
import ToolInspector from './pages/ToolInspector';
import PromptInspector from './pages/PromptInspector';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="evaluation" element={<EvaluationDashboard />} />
        <Route path="evaluation/:caseId" element={<EvaluationDetails />} />
        <Route path="graph" element={<ExecutionGraph />} />
        <Route path="retrieval" element={<RetrievalViewer />} />
        <Route path="tool" element={<ToolInspector />} />
        <Route path="prompts" element={<PromptInspector />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
