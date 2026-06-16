'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AiSearchBarProps {
  onOpenChat: (initialQuery?: string) => void;
}

export default function AiSearchBar({ onOpenChat }: AiSearchBarProps) {
  const [query, setQuery] = useState('');
  
  const placeholders = [
    "Find premium concerts in Mumbai...",
    "What tech conferences are happening?",
    "Show me luxury experiences near me...",
    "Best networking events this month...",
  ];
  
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onOpenChat(query);
      setQuery('');
    }
  };

  const suggestions = [
    "Trending events this week",
    "Upcoming tech summits",
    "Weekend live music",
    "Curated luxury experiences",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20 group">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="relative flex items-center"
      >
        <div className="absolute left-6 text-[#A67B5B]">
          <Sparkles className="w-6 h-6" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[placeholderIdx]}
          className="w-full bg-white/90 backdrop-blur-md border border-[#D6D3D1] rounded-[32px] text-[#1C1917] text-lg py-5 pl-16 pr-44 placeholder-[#78716C] outline-none transition-all duration-300 focus:border-[#A67B5B] focus:bg-white shadow-[0_8px_32px_rgba(28,25,23,0.06)] hover:shadow-[0_12px_40px_rgba(28,25,23,0.08)]"
        />
        
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 btn-accent py-3 px-6 shadow-none hover:shadow-[0_4px_16px_rgba(166,123,91,0.25)] flex items-center gap-2"
        >
          Ask Concierge <ArrowRight className="w-4 h-4" />
        </button>
      </motion.form>

      {/* Suggestions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 flex flex-wrap justify-center gap-3"
      >
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onOpenChat(suggestion)}
            className="text-xs sm:text-sm px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[#D6D3D1] hover:border-[#A67B5B] hover:bg-white text-[#57534E] hover:text-[#A67B5B] transition-all duration-300 shadow-sm whitespace-nowrap"
          >
            {suggestion}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
