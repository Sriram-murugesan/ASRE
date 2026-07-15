import React, { createContext, useContext, useState, useCallback } from 'react';
import { sendMessage } from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am ASRE, your AI-powered support agent. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionData, setExecutionData] = useState(null);
  const [error, setError] = useState(null);

  const chat = useCallback(async (userMessage) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await sendMessage(userMessage, history);

      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (response.execution) {
        setExecutionData(response.execution);
      }
    } catch (err) {
      setError(err.message);
      // Add a friendly error message to the chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: `I'm having trouble connecting to the backend right now. (${err.message})`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am ASRE, your AI-powered support agent. How can I help you today?',
      timestamp: new Date().toISOString(),
    }]);
    setExecutionData(null);
    setError(null);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, executionData, error, chat, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
