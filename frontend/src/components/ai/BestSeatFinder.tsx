'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, Target, Eye, Users, Zap, Star, ChevronDown } from 'lucide-react';

interface BestSeatFinderProps {
  eventId: string;
  onSeatsRecommended?: (seatIds: string[], reason: string) => void;
}

const PREFERENCES = [
  { key: 'Best View', icon: Eye, label: 'Best View', desc: 'Optimal sightlines to stage' },
  { key: 'Best Value', icon: Star, label: 'Best Value', desc: 'Most affordable quality seats' },
  { key: 'VIP Experience', icon: Zap, label: 'VIP Experience', desc: 'Premium front-row luxury' },
  { key: 'Closest To Stage', icon: Target, label: 'Closest To Stage', desc: 'Nearest proximity to performers' },
  { key: 'Group Seating', icon: Users, label: 'Group Seating', desc: 'Adjacent seats for a group' },
];

interface RecommendationResult {
  recommendedSection: string;
  recommendedRow: string;
  recommendedSeats: string[];
  totalPrice: number;
  reason: string;
  matchScore: number;
}

export default function BestSeatFinder({ eventId, onSeatsRecommended }: BestSeatFinderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [budget, setBudget] = useState('');
  const [numTickets, setNumTickets] = useState(2);
  const [preference, setPreference] = useState('Best View');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const handleFind = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/ai/best-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          budget: budget ? Number(budget) : undefined,
          numTickets,
          preference,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        onSeatsRecommended?.(data.data.recommendedSeats, data.data.reason);
      }
    } catch {
      // Mock fallback
      const mockResult: RecommendationResult = {
        recommendedSection: 'Section B',
        recommendedRow: 'Row 6',
        recommendedSeats: ['B6-12', 'B6-13'],
        totalPrice: budget ? Math.min(Number(budget), 3000) : 2998,
        reason: `Section B, Row 6 provides the best balance between price and stage visibility for your "${preference}" preference. These center-aligned seats give you an unobstructed view at ₹1499 each.`,
        matchScore: 94,
      };
      setResult(mockResult);
      onSeatsRecommended?.(mockResult.recommendedSeats, mockResult.reason);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <motion.button
        id="ai-seat-finder-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-[#5c3df5]/30 bg-gradient-to-r from-[#5c3df5]/10 to-[#ec4899]/5 text-white font-semibold text-sm transition-all hover:border-[#5c3df5]/60 hover:shadow-[0_0_20px_rgba(92,61,245,0.2)] group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5c3df5] to-[#ec4899] flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span>Find Best Seats For Me</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#5c3df5]/20 text-[#a78bfa] border border-[#5c3df5]/20">AI Powered</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[#a78bfa]" />
        </motion.div>
      </motion.button>

      {/* Expandable Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-5 rounded-2xl border border-white/10 bg-[#0d0c18] space-y-5">

              {/* Inputs Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block mb-1.5">Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#5c3df5]/60 transition-all placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block mb-1.5">Number of Tickets</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all font-bold">−</button>
                    <span className="text-white font-bold text-sm w-6 text-center">{numTickets}</span>
                    <button onClick={() => setNumTickets(Math.min(10, numTickets + 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all font-bold">+</button>
                  </div>
                </div>
              </div>

              {/* Preference Selection */}
              <div>
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block mb-2">Preference</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PREFERENCES.map(p => (
                    <button
                      key={p.key}
                      onClick={() => setPreference(p.key)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${preference === p.key
                        ? 'border-[#5c3df5] bg-[#5c3df5]/10 shadow-[0_0_12px_rgba(92,61,245,0.2)]'
                        : 'border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20'
                        }`}
                    >
                      <p.icon className={`w-3.5 h-3.5 ${preference === p.key ? 'text-[#a78bfa]' : 'text-white/30'}`} />
                      <span className={`text-[11px] font-semibold ${preference === p.key ? 'text-white' : 'text-white/60'}`}>{p.label}</span>
                      <span className="text-[9px] text-white/30 leading-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Find Button */}
              <motion.button
                onClick={handleFind}
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#5c3df5] to-[#ec4899] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(92,61,245,0.3)] hover:shadow-[0_0_30px_rgba(92,61,245,0.5)] transition-all"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing venue layout...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Find My Perfect Seats</>
                )}
              </motion.button>

              {/* Result Card */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    className="p-4 rounded-2xl border border-[#10b981]/30 bg-[#10b981]/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span className="text-white font-bold text-sm">AI Recommendation</span>
                      </div>
                      {/* Match score ring */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                            <motion.circle
                              cx="18" cy="18" r="15.9" fill="none"
                              stroke="#10b981" strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="100"
                              initial={{ strokeDashoffset: 100 }}
                              animate={{ strokeDashoffset: 100 - result.matchScore }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-[#10b981]">{result.matchScore}%</span>
                        </div>
                        <span className="text-[10px] text-white/40">Match</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-[#5c3df5]/20 border border-[#5c3df5]/30">
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">Section</p>
                        <p className="text-white font-bold text-sm">{result.recommendedSection}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-[#5c3df5]/20 border border-[#5c3df5]/30">
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">Row</p>
                        <p className="text-white font-bold text-sm">{result.recommendedRow}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20">
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">Total</p>
                        <p className="text-[#ec4899] font-bold text-sm">₹{result.totalPrice}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/60 leading-relaxed italic border-t border-white/5 pt-3">
                      💡 {result.reason}
                    </p>

                    {/* Seat tags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {result.recommendedSeats.map(s => (
                        <motion.span
                          key={s}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[10px] px-2 py-1 rounded-md bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] font-bold"
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
