import React from 'react';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatBubble({ message, isUser, timestamp }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-white' : 'bg-card border border-border text-primary'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2 rounded-2xl ${
            isUser 
              ? 'bg-primary text-white rounded-tr-sm' 
              : 'bg-card border border-border text-foreground rounded-tl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        <span className="text-[10px] text-muted mt-1 px-1">
          {new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
