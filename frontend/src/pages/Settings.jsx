import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Server, Sliders, Palette, Bell, ShieldCheck, Save, RotateCcw
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-muted/30'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? 'left-5' : 'left-1'
        }`}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon size={18} />
          </div>
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        <div className="p-5 space-y-5">{children}</div>
      </Card>
    </motion.div>
  );
}

function InputRow({ label, description, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const toast = useToast();
  const [config, setConfig] = useState({
    apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
    maxTokens: 512,
    confidenceThreshold: 0.75,
    streamingEnabled: true,
    notifyOnFailure: true,
    notifyOnCompletion: false,
    showLatency: true,
    showConfidence: true,
    primaryColor: '#3B82F6',
  });

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('asre_config', JSON.stringify(config));
    toast.success('Settings saved successfully.', 'Saved');
  };

  const handleReset = () => {
    setConfig({
      apiUrl: 'http://localhost:8000',
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      maxTokens: 512,
      confidenceThreshold: 0.75,
      streamingEnabled: true,
      notifyOnFailure: true,
      notifyOnCompletion: false,
      showLatency: true,
      showConfidence: true,
      primaryColor: '#3B82F6',
    });
    toast.info('Settings reset to defaults.', 'Reset');
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-muted mt-1">Configure your ASRE platform preferences.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/30"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        {/* Backend */}
        <Section title="Backend Connection" icon={Server}>
          <InputRow label="API Base URL" description="The ASRE FastAPI backend endpoint.">
            <input
              type="text"
              value={config.apiUrl}
              onChange={e => set('apiUrl', e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </InputRow>
          <InputRow label="Enable Streaming" description="Stream tokens from the LLM as they arrive.">
            <Toggle checked={config.streamingEnabled} onChange={v => set('streamingEnabled', v)} />
          </InputRow>
        </Section>

        {/* Model */}
        <Section title="Model Configuration" icon={Sliders}>
          <InputRow label="LLM Model" description="The model identifier sent to the Groq API.">
            <select
              value={config.model}
              onChange={e => set('model', e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              <option value="gemma2-9b-it">gemma2-9b-it</option>
            </select>
          </InputRow>
          <InputRow label="Temperature" description={`Controls response randomness. Current: ${config.temperature}`}>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={config.temperature}
              onChange={e => set('temperature', parseFloat(e.target.value))}
              className="w-48 accent-primary"
            />
          </InputRow>
          <InputRow label="Max Output Tokens" description="Maximum tokens in the LLM response.">
            <input
              type="number"
              value={config.maxTokens}
              onChange={e => set('maxTokens', parseInt(e.target.value))}
              min={64} max={4096}
              className="w-32 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </InputRow>
          <InputRow label="Confidence Threshold" description={`Escalate if confidence < ${config.confidenceThreshold}`}>
            <input
              type="range"
              min="0.5" max="0.99" step="0.01"
              value={config.confidenceThreshold}
              onChange={e => set('confidenceThreshold', parseFloat(e.target.value))}
              className="w-48 accent-primary"
            />
          </InputRow>
        </Section>

        {/* UI Preferences */}
        <Section title="UI Preferences" icon={Palette}>
          <InputRow label="Show Latency" description="Display execution latency in the chat panel.">
            <Toggle checked={config.showLatency} onChange={v => set('showLatency', v)} />
          </InputRow>
          <InputRow label="Show Confidence Score" description="Display the confidence score for each response.">
            <Toggle checked={config.showConfidence} onChange={v => set('showConfidence', v)} />
          </InputRow>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <InputRow label="Notify on Evaluation Failure" description="Show a toast when an evaluation run has failures.">
            <Toggle checked={config.notifyOnFailure} onChange={v => set('notifyOnFailure', v)} />
          </InputRow>
          <InputRow label="Notify on Evaluation Completion" description="Show a toast when a run completes successfully.">
            <Toggle checked={config.notifyOnCompletion} onChange={v => set('notifyOnCompletion', v)} />
          </InputRow>
        </Section>

        {/* System Info */}
        <Section title="System Information" icon={ShieldCheck}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Frontend Version', value: '1.0.0' },
              { label: 'React Version', value: '19' },
              { label: 'Build Tool', value: 'Vite' },
              { label: 'State Management', value: 'Context API' },
            ].map(item => (
              <div key={item.label} className="bg-background rounded-xl p-3 border border-border">
                <div className="text-xs text-muted mb-1">{item.label}</div>
                <div className="font-mono text-foreground font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </Section>
      </motion.div>
    </div>
  );
}
