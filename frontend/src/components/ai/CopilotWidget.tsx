'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Minimize2, Maximize2, Sparkles, Loader2,
  MapPin, Ticket, Star, TrendingUp, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FEATURED_EVENTS, searchEvents } from '@/data/csvEventService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: "What's trending nearby?", label: 'Trending' },
  { icon: Ticket, text: 'Help me find the best seats', label: 'Best Seats' },
  { icon: Star, text: 'Recommend events for me', label: 'Recommend' },
  { icon: MapPin, text: 'Find events this weekend', label: 'This Weekend' },
];

export default function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      // Build context string from top featured events
      const topEvents = FEATURED_EVENTS.slice(0, 3)
        .map(e => `**${e.title}** (${e.venue.city}, ₹${e.ticketTiers[0]?.price ?? 0})`)
        .join(', ');
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your **EventNova AI Concierge**. I can help you discover curated events, find premium seats, or answer anything about what's happening near you.\n\n🔥 Currently trending: ${topEvents}\n\nWhat can I help you with today?`
      }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });
      const data = await res.json();
      const reply = data.success ? data.message : "I'm having trouble connecting right now. Try again in a moment!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      // Build intelligent offline response from CSV data (dynamically loaded)
      try {
        const { loadEventsFromCSV, searchEvents: csvSearch } = await import('@/data/csvEventService');
        const allEvents = await loadEventsFromCSV();
        const q = text.toLowerCase();
        const matches = csvSearch(q, allEvents).slice(0, 3);
        const eventList = matches.length > 0
          ? matches.map(e => `**${e.title}** at ${e.venue.city} on ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — from ₹${e.ticketTiers[0]?.price ?? 0}`).join('\n- ')
          : FEATURED_EVENTS.slice(0, 2).map(e => `**${e.title}** — ${e.venue.city}`).join(' & ');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: matches.length > 0
            ? `Here are some events matching your query:\n\n- ${eventList}\n\n[View all events →](/events)`
            : `I'm currently in offline mode, but here are some trending picks: ${eventList}! 🎉 [Browse all →](/events)`
        }]);
      } catch {
        // Final fallback using static data
        const matches = searchEvents(text).slice(0, 2);
        const eventList = matches.length > 0
          ? matches.map(e => `**${e.title}** at ${e.venue.city} on ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — from ₹${e.ticketTiers[0]?.price ?? 0}`).join('\n- ')
          : FEATURED_EVENTS.slice(0, 2).map(e => `**${e.title}** — ${e.venue.city}`).join(' & ');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: matches.length > 0
            ? `Here are some events matching your query:\n\n- ${eventList}\n\n[View all events →](/events)`
            : `I'm currently in offline mode, but here are some trending picks: ${eventList}! 🎉 [Browse all →](/events)`
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="copilot-toggle-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer group shadow-lg transition-transform hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}
            aria-label="Open AI Concierge"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="copilot-panel"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-24px)] flex flex-col showroom-card overflow-hidden"
            style={{
              height: isMinimized ? 'auto' : '600px',
              maxHeight: 'calc(100vh - 48px)',
            }}
          >
            {/* Panel Container */}
            <div className="flex flex-col h-full bg-[#FAF7F5]">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#D6D3D1] bg-white flex-shrink-0 relative">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#A67B5B]/30 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[#1C1917] font-bold text-sm" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>AI Concierge</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
                      <p className="text-[10px] text-[#78716C] font-semibold uppercase tracking-wider">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                    aria-label={isMinimized ? "Expand" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                    aria-label="Close Concierge"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col flex-1 min-h-0 bg-[#FAF7F5]"
                  >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] text-sm leading-relaxed p-3.5 rounded-2xl ${msg.role === 'user'
                              ? 'bg-[#1C1917] text-white rounded-tr-sm shadow-md'
                              : 'bg-white text-[#1C1917] rounded-tl-sm border border-[#D6D3D1] shadow-sm [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>strong]:font-semibold'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                            <Bot className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <div className="bg-white border border-[#D6D3D1] rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex items-center gap-2">
                            <span className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {messages.length <= 1 && (
                      <div className="px-5 pb-4 flex gap-2 flex-wrap">
                        {QUICK_PROMPTS.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(p.text)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#57534E] px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-full hover:border-[#A67B5B] hover:text-[#A67B5B] transition-colors shadow-sm"
                          >
                            <p.icon className="w-3 h-3" />
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-[#D6D3D1] flex-shrink-0">
                      <div className="flex items-center gap-3 bg-[#F5F5F4] border border-[#D6D3D1] rounded-full p-1.5 focus-within:border-[#A67B5B] focus-within:ring-1 focus-within:ring-[#A67B5B] transition-all">
                        <input
                          type="text"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                          placeholder="Ask your concierge..."
                          className="flex-1 bg-transparent px-4 py-2 text-[#1C1917] text-sm outline-none placeholder-[#78716C]"
                          id="copilot-input"
                        />
                        <button
                          onClick={() => sendMessage(input)}
                          disabled={!input.trim() || isLoading}
                          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors bg-[#1C1917] text-white hover:bg-[#44403C]"
                          aria-label="Send message"
                        >
                          <Send className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
