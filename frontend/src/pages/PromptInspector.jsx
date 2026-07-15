import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Hash, Clock, MessageSquare, Bot } from 'lucide-react';
import Card from '../components/ui/Card';
import CodeBlock from '../components/llm/CodeBlock';

const SYSTEM_PROMPT = `You are ASRE (Agentic Support Resolution Engine), a highly capable customer support AI.

Your responsibilities:
1. Accurately classify customer intent into one of: [refund_policy, order_status, escalation, general_inquiry]
2. Retrieve relevant policy documents from the knowledge base to ground your response
3. Execute appropriate tools when action is required (e.g., calculate_refund_amount, get_order_details)
4. Always be concise, empathetic, and factually accurate
5. Escalate to a human agent if confidence falls below 0.75 or if the case involves fraud

Do not fabricate order details. Do not promise refunds outside defined policy windows.
Current date: 2026-07-12. Policy version: 2.1.`;

const USER_PROMPT = `Customer query: "I want to cancel my order ORD-789 and get a full refund."

Retrieved context:
[Chunk 1 | sim=0.94] Refund Policy v2.1 – Section 3: All products are eligible for a refund within the 30-day return window...
[Chunk 2 | sim=0.87] Escalation Handbook: When a customer dispute cannot be resolved within two interactions...

Intent classification result: refund_policy (confidence: 0.98)

Now generate a helpful, grounded response to the customer.`;

const LLM_RESPONSE = `{
  "role": "assistant",
  "content": "I'd be happy to help you cancel order ORD-789 and process your refund. Since your order was delivered 12 days ago, it's within our 30-day return window, making you fully eligible for a refund.\\n\\nHere's what happens next:\\n• Your refund of $49.99 will be initiated immediately\\n• It will appear on your original payment method within 5-7 business days\\n• You'll receive a confirmation email shortly\\n\\nIs there anything else I can help you with?",
  "metadata": {
    "intent": "refund_policy",
    "confidence": 0.98,
    "tools_called": ["get_order_details", "check_return_eligibility", "calculate_refund_amount"],
    "latency_ms": 1325,
    "tokens": { "input": 312, "output": 87, "total": 399 }
  }
}`;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const TOKEN_STATS = [
  { label: 'Input Tokens', value: 312, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Output Tokens', value: 87, icon: Bot, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Total Tokens', value: 399, icon: Hash, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'LLM Latency', value: '1.32s', icon: Clock, color: 'text-muted', bg: 'bg-muted/10' },
];

export default function PromptInspector() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System Prompt', icon: Zap },
    { id: 'user', label: 'User Prompt', icon: MessageSquare },
    { id: 'response', label: 'LLM Response', icon: Bot },
  ];

  const codeMap = {
    system: { code: SYSTEM_PROMPT, lang: 'text', title: 'system_prompt.txt' },
    user: { code: USER_PROMPT, lang: 'text', title: 'user_prompt.txt' },
    response: { code: LLM_RESPONSE, lang: 'json', title: 'llm_response.json' },
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Prompt Inspector</h1>
        <p className="text-muted mt-1">Inspect the full LLM prompt chain, token usage, and raw completions.</p>
      </div>

      {/* Token Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {TOKEN_STATS.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">{stat.label}</div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Token Usage Bar */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Token Distribution</h3>
          <span className="text-xs text-muted">Context limit: 8192 tokens</span>
        </div>
        <div className="h-3 rounded-full bg-background overflow-hidden flex">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${(312 / 8192) * 100}%` }}
            title="Input tokens"
          />
          <div
            className="h-full bg-success transition-all duration-700"
            style={{ width: `${(87 / 8192) * 100}%` }}
            title="Output tokens"
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Input (312)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" />Output (87)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-background border border-border inline-block" />Unused (7793)</span>
        </div>
      </Card>

      {/* Prompt Tabs */}
      <div>
        <div className="flex gap-1 mb-4 bg-card/50 p-1 rounded-xl border border-border w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CodeBlock
            code={codeMap[activeTab].code}
            language={codeMap[activeTab].lang}
            title={codeMap[activeTab].title}
          />
        </motion.div>
      </div>

      {/* Model Info */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Model Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Model', value: 'llama-3.1-8b-instant' },
            { label: 'Temperature', value: '0.1' },
            { label: 'Max Tokens', value: '512' },
            { label: 'Provider', value: 'Groq Cloud' },
          ].map(item => (
            <div key={item.label} className="bg-background rounded-lg p-3 border border-border">
              <div className="text-xs text-muted mb-1">{item.label}</div>
              <div className="font-mono text-foreground font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
