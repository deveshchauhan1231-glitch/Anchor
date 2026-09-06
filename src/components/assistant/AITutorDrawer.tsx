'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { aiBotClient } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Message { id: string; sender: 'ai' | 'user'; text: string; timestamp: string; }
interface AITutorDrawerProps { isOpen: boolean; onClose: () => void; }

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({ isOpen, onClose }) => {
  const { userId } = useAuth();
  const params = useParams<{ subjectId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // The AI service calls this value `lecture_id`, but this app indexes all
  // videos and notes in a subject together. The subject UUID is therefore the
  // retrieval namespace and must be present for both indexing and chat.
  const retrievalScopeId = typeof params.subjectId === 'string' ? params.subjectId : '';

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    if (!retrievalScopeId) {
      toast.error('Open a subject workspace before asking the AI Tutor.');
      return;
    }

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: userText, timestamp: 'Just now' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiBotClient<{ answer?: string; response?: string; message?: string }>('/botHelp', {
        question: userText,
        user_id: userId || '',
        lecture_id: retrievalScopeId,
      });
      const answer = response.answer || response.response || response.message;
      if (!answer) throw new Error('The AI Tutor returned an empty response.');
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: answer, timestamp: 'Just now' }]);
    } catch {
      toast.error('Unable to reach AI Tutor. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-surface-border bg-surface shadow-2xl sm:w-[420px] lg:static lg:z-10 lg:w-[380px] xl:w-[420px]">
        <div className="flex h-16 items-center justify-between border-b border-surface-border px-5">
          <div className="flex items-center gap-2.5 text-brand-400"><Bot className="h-6 w-6" /><h2 className="text-lg font-bold tracking-tight text-brand-500">AI Tutor</h2></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-foreground/60 transition-colors hover:bg-surface-light hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((msg) => <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}><div className={msg.sender === 'user' ? 'max-w-[85%] rounded-2xl rounded-tr-none bg-brand-600 px-4 py-3 text-sm font-medium !text-white shadow-md shadow-brand-900/30' : 'max-w-[90%] rounded-2xl rounded-tl-none border border-surface-border bg-surface-light px-4 py-3.5 text-sm leading-relaxed text-foreground/80 shadow-sm'}>{msg.sender === 'ai' ? <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.text}</ReactMarkdown> : msg.text}</div></div>)}
          {isTyping && <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-surface-border bg-surface-light px-4 py-3 text-sm text-foreground/60"><Sparkles className="h-4 w-4 animate-spin text-brand-400" /><span className="text-xs">AI Tutor is thinking...</span></div>}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-surface-border p-4"><form onSubmit={handleSend} className="relative flex items-center"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask AI..." className="w-full rounded-xl border border-surface-border bg-background py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /><button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 !text-white transition-opacity hover:bg-brand-500 disabled:opacity-30"><Send className="h-4 w-4" /></button></form></div>
      </div>
    </>
  );
};
