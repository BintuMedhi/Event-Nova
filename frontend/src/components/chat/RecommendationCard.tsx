import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface EventRecommendation {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  banner: string;
  date: string;
  venue: { name: string; city: string };
  ticketTiers: Array<{ price: number }>;
}

interface RecommendationCardProps {
  event: EventRecommendation;
}

export default function RecommendationCard({ event }: RecommendationCardProps) {
  const minPrice = event.ticketTiers?.reduce((min, t) => (t.price < min ? t.price : min), event.ticketTiers[0]?.price || 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgba(108,99,255,0.15)] rounded-2xl border border-white/10 bg-white/5 w-full sm:w-[280px] flex-shrink-0"
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-accent-purple border border-white/10">
          {event.category}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow text-left">
        <h3 className="font-bold text-sm text-white group-hover:text-accent-purple transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-text-muted text-[11px] mt-1 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <Calendar className="w-3 h-3 text-accent-pink" />
              {new Date(event.date || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <MapPin className="w-3 h-3 text-accent-green" />
              <span>{event.venue?.city || 'Virtual'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-text-muted block font-medium">From</span>
            <span className="text-xs font-bold text-white">
              ₹{minPrice}
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/events/${event.slug || event._id}`}
            className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white text-center py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300"
          >
            Details
          </Link>
          <Link
            href={`/checkout?eventId=${event._id}`}
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 text-white text-center py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300"
          >
            Book Now
          </Link>
          <button
            title="Save Event"
            className="px-2.5 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-300 hover:text-accent-pink"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            title="Share Event"
            className="px-2.5 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-300 hover:text-accent-purple"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
