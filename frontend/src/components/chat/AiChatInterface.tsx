'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RecommendationCard, { EventRecommendation } from './RecommendationCard';
import { CSV_EVENTS, searchEvents, FEATURED_EVENTS, DEFAULT_BANNER, type EventRecord } from '@/data/csvEventService';

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  recommendedEvents?: EventRecommendation[];
}

interface AiChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

/** Convert EventRecord → EventRecommendation shape */
function toRecommendation(e: EventRecord): EventRecommendation {
  return {
    _id: e._id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    category: e.category,
    banner: e.banner,
    date: e.date,
    venue: { name: e.venue.name, city: e.venue.city },
    ticketTiers: e.ticketTiers.map(t => ({ price: t.price })),
  };
}

/** Pick AI-recommended events based on the AI's text reply + user query */
function pickRecommendations(aiReply: string, userQuery: string, events: EventRecord[] = CSV_EVENTS): EventRecommendation[] {
  const combined = (aiReply + ' ' + userQuery).toLowerCase();

  // Search events from the provided dataset
  let matches: EventRecord[] = [];

  if (combined.includes('music') || combined.includes('concert') || combined.includes('song') ||
      combined.includes('arijit') || combined.includes('rahman') || combined.includes('taylor') ||
      combined.includes('shreya') || combined.includes('sonu') || combined.includes('armaan') ||
      combined.includes('guns') || combined.includes('nilesh') || combined.includes('armaan')) {
    matches.push(...events.filter(e => e.category === 'Music Concert'));
  }
  if (combined.includes('hack') || combined.includes('coding') || combined.includes('tech') || combined.includes('developer')) {
    matches.push(...events.filter(e => e.category === 'Hackathon' || e.category === 'Tech Conference'));
  }
  if (combined.includes('festival') || combined.includes('food') || combined.includes('cultural') || combined.includes('carnival') || combined.includes('winter')) {
    matches.push(...events.filter(e => e.category === 'Festival' || e.category === 'College Fest'));
  }
  if (combined.includes('business') || combined.includes('startup') || combined.includes('network') || combined.includes('workshop') || combined.includes('masterclass')) {
    matches.push(...events.filter(e => e.category === 'Business' || e.category === 'Workshop'));
  }
  if (combined.includes('recommend') || combined.includes('suggest') || combined.includes('best') || combined.includes('show me') || combined.includes('trending')) {
    // Use featured events as default recommendations
    matches.push(...events.filter(e => e.featured));
  }

  // Fuzzy search as fallback
  if (matches.length === 0) {
    matches = searchEvents(userQuery, events);
  }
  // Final fallback: use all events
  if (matches.length === 0) {
    matches = events.slice(0, 3);
  }

  // Deduplicate by _id and limit
  const seen = new Set<string>();
  const unique = matches.filter(e => {
    if (seen.has(e._id)) return false;
    seen.add(e._id);
    return true;
  });

  return unique.slice(0, 3).map(toRecommendation);
}

export default function AiChatInterface({ isOpen, onClose, initialQuery }: AiChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Load fresh CSV events for recommendations
    let allEvents: EventRecord[] = CSV_EVENTS;
    try {
      const { loadEventsFromCSV } = await import('@/data/csvEventService');
      allEvents = await loadEventsFromCSV();
    } catch { /* use static fallback */ }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();
      const aiResponseText = data.success ? data.message : 'Sorry, I encountered an error communicating with the server.';
      const recommendedEvents: EventRecommendation[] = pickRecommendations(aiResponseText, text, allEvents);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponseText,
        recommendedEvents: recommendedEvents.length > 0 ? recommendedEvents : undefined
      }]);
    } catch (error) {
      // Offline fallback: search CSV data and return results
      const q = text.toLowerCase();
      const matches = searchEvents(q, allEvents).slice(0, 3);
      const eventSummary = matches.length > 0
        ? matches.map(e => `- **${e.title}** at ${e.venue.city} — ₹${e.ticketTiers[0]?.price ?? 0}`).join('\n')
        : FEATURED_EVENTS.slice(0, 2).map(e => `- **${e.title}** — ${e.venue.city}`).join('\n');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: matches.length > 0
          ? `Here are some matching events from our dataset:\n\n${eventSummary}\n\n[Browse all events →](/events)`
          : `I'm operating in offline mode. Here are some featured events you might enjoy:\n\n${eventSummary}\n\n[Discover all events →](/explore)`,
        recommendedEvents: matches.length > 0
          ? matches.slice(0, 3).map(toRecommendation)
          : FEATURED_EVENTS.slice(0, 3).map(toRecommendation)
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Chat Modal */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-[#FAF7F5] rounded-[32px] flex flex-col overflow-hidden shadow-2xl"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white border-b border-[#D6D3D1]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>EventNova Concierge</h2>
                  <p className="text-xs text-[#78716C] font-semibold mt-0.5">Intelligent Event Discovery</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#FAF7F5] custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-[32px] bg-white border border-[#D6D3D1] shadow-sm flex items-center justify-center">
                    <Bot className="w-10 h-10 text-[#A67B5B]" />
                  </div>
                  <p className="max-w-md text-[#57534E] font-medium leading-relaxed">
                    Welcome. I am your personal event concierge. Describe the type of experience you're looking for, and I will curate a personalized list for you.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-4 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`p-5 text-sm leading-relaxed rounded-[24px] shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#1C1917] text-white rounded-tr-sm' 
                            : 'bg-white text-[#1C1917] rounded-tl-sm border border-[#D6D3D1] [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul>li]:mb-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol>li]:mb-1 [&>h3]:font-bold [&>h3]:text-base [&>h3]:mt-4 [&>h3]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>a]:underline'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {msg.recommendedEvents && msg.recommendedEvents.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 w-full max-w-full custom-scrollbar">
                          {msg.recommendedEvents.map(event => (
                            <RecommendationCard key={event._id} event={event} />
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-full border border-[#D6D3D1] bg-white shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-5 h-5 text-[#1C1917]" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}>
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border border-[#D6D3D1] rounded-[24px] rounded-tl-sm text-[#1C1917] p-5 shadow-sm flex items-center gap-3">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#A67B5B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-[#D6D3D1]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                className="relative flex items-center gap-3 bg-[#F5F5F4] border border-[#D6D3D1] rounded-[24px] p-2 focus-within:border-[#A67B5B] focus-within:ring-1 focus-within:ring-[#A67B5B] transition-all shadow-sm"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent py-3 px-5 text-[#1C1917] outline-none placeholder-[#78716C] text-sm font-medium transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[#1C1917] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#44403C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
