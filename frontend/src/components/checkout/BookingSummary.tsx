'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Ticket, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface BookingSummaryProps {
  event: {
    title: string;
    date: string;
    time: string;
    venue: string;
    image: string;
    category?: string;
  };
  tickets: Array<{ type: string; price: number; quantity: number }>;
  onSuccess?: boolean;
}

export const BookingSummary = ({ event, tickets, onSuccess }: BookingSummaryProps) => {
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [expanded, setExpanded] = useState(true);
  const isExpiring = timeLeft < 120;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const ss = (timeLeft % 60).toString().padStart(2, '0');

  const subtotal        = tickets.reduce((a, t) => a + t.price * t.quantity, 0);
  const convenienceFee  = Math.round(subtotal * 0.05);
  const taxes           = Math.round(subtotal * 0.18);
  const total           = subtotal + convenienceFee + taxes;

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col gap-6">
      {/* Timer card */}
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
          isExpiring
            ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]'
            : 'bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]'
        }`}
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">
          {isExpiring ? 'Booking expiring soon!' : 'Hold time remaining'}
        </span>
        <span className="font-mono font-bold text-base bg-white px-2 py-0.5 rounded-md shadow-sm border border-black/5">
          {mm}:{ss}
        </span>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-[#D6D3D1] rounded-[24px] overflow-hidden shadow-sm">
        {/* Event banner */}
        <div className="relative h-48">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-[#1C1917]/30 to-transparent" />
          {event.category && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              {event.category}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-bold text-white text-2xl tracking-tight leading-tight drop-shadow-md" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>{event.title}</h3>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Event meta */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-[#57534E] text-xs font-semibold">
              <Calendar className="w-4 h-4 flex-shrink-0 text-[#A67B5B]" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-[#57534E] text-xs font-semibold">
              <Clock className="w-4 h-4 flex-shrink-0 text-[#A67B5B]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-[#57534E] text-xs font-semibold">
              <MapPin className="w-4 h-4 flex-shrink-0 text-[#A67B5B]" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>

          <div className="h-px bg-[#F5F5F4] w-full" />

          {/* Tickets */}
          <div className="flex flex-col gap-4">
            {tickets.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-4 bg-[#FAF7F5] p-3.5 rounded-2xl border border-[#F5F5F4]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-[#E7E5E4]">
                    <Ticket className="w-5 h-5 text-[#A67B5B]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1917]">{t.type}</p>
                    <p className="text-xs text-[#78716C] font-semibold mt-0.5">Quantity: {t.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-[#1C1917]">₹{fmt(t.price * t.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Price breakdown toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#78716C] hover:text-[#1C1917] transition-colors py-2"
          >
            <span>View Price Breakdown</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="flex flex-col gap-3 pb-2 px-2">
              <div className="flex justify-between text-xs font-medium text-[#57534E]">
                <span>Ticket Value</span>
                <span>₹{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-[#57534E]">
                <span>Convenience Fee (5%)</span>
                <span>₹{fmt(convenienceFee)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-[#57534E]">
                <span>GST (18%)</span>
                <span>₹{fmt(taxes)}</span>
              </div>
            </div>
          )}

          <div className="h-px bg-[#F5F5F4] w-full" />

          {/* Total */}
          <div className="flex items-end justify-between">
            <span className="font-semibold text-sm text-[#78716C]">Total Payable</span>
            <div className="text-right">
              <p className="text-3xl font-black text-[#1C1917] tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                ₹{fmt(total)}
              </p>
              <p className="text-[10px] text-[#A67B5B] font-semibold mt-1">Inclusive of all taxes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo code input */}
      <div className="bg-white border border-[#D6D3D1] rounded-[24px] p-6 shadow-sm">
        <p className="text-xs font-bold text-[#1C1917] mb-3">Apply Promo Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 px-4 py-3 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] text-sm transition-all"
          />
          <button className="px-6 py-3 rounded-xl bg-[#1C1917] text-white text-sm font-semibold hover:bg-[#44403C] transition-colors shadow-sm">
            Apply
          </button>
        </div>
      </div>

      <p className="text-[11px] text-[#78716C] text-center font-medium leading-relaxed max-w-sm mx-auto">
        By completing this purchase you agree to our{' '}
        <a href="#" className="text-[#A67B5B] hover:underline">Terms & Conditions</a>{' '}
        and{' '}
        <a href="#" className="text-[#A67B5B] hover:underline">Cancellation Policy</a>.
      </p>
    </div>
  );
};
