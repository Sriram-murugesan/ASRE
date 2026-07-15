import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import ExecutionPanel from '../components/chat/ExecutionPanel';
import { Bot, AlertCircle } from 'lucide-react';
import { sendMessage } from '../services/chatService';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm the ASRE Support Agent. How can I help you today?", isUser: false, timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [executionData, setExecutionData] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    // Add user message
    const newUserMsg = { id: Date.now(), text, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);
    setExecutionData(null);
    setError(null);

    try {
      // ── Real API call to the ASRE backend ──────────────────────────────
      const data = await sendMessage(text);
      // data shape: { run_id, reply, route, execution }

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.reply,
        isUser: false,
        timestamp: Date.now(),
      }]);

      // Pass real execution data to the panel
      setExecutionData(data.execution ?? null);
    } catch (err) {
      const errMsg = err?.message || 'Unknown error';
      setError(errMsg);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `⚠️ Could not reach the ASRE backend: ${errMsg}. Please make sure the backend is running on port 8000.`,
        isUser: false,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full max-h-screen">
      {/* Chat Interface (Left Pane) */}
      <div className="flex-1 flex flex-col bg-background relative border-r border-border min-w-0">
        <div className="p-4 border-b border-border bg-card/50 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">ASRE Assistant</h2>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span> Online
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-xs text-danger">
            <AlertCircle size={14} />
            <span>Backend error: {error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                <Bot size={16} />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-[36px]">
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>

      {/* Execution Panel (Right Pane) */}
      <div className="hidden lg:block w-96 shrink-0 bg-background/50">
        <ExecutionPanel executionData={executionData} />
      </div>
    </div>
  );
}
