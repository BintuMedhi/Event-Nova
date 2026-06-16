'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Tag, TrendingUp, Sparkles, Award, ArrowRight, Zap, ChevronRight, Play } from 'lucide-react';
import AiSearchBar from '@/components/chat/AiSearchBar';
import AiChatInterface from '@/components/chat/AiChatInterface';
import { CSV_EVENTS, FEATURED_EVENTS, DEFAULT_BANNER, type EventRecord } from '@/data/csvEventService';


interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  banner: string;
  date: string;
  venue: { name: string; city: string };
  ticketTiers: Array<{ price: number }>;
  featured?: boolean;
  popularityScore?: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState('');

  const handleOpenChat = (query?: string) => {
    setInitialChatQuery(query || '');
    setIsChatOpen(true);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Always use CSV dataset as primary source
      const { loadEventsFromCSV } = await import('@/data/csvEventService');
      const csvData = await loadEventsFromCSV();
      if (csvData.length > 0) {
        setEvents(csvData);
        setLoading(false);
        return;
      }
    } catch {
      // fall through to static data
    }
    setEvents(CSV_EVENTS);
    setLoading(false);
  };

  const categories = [
    { name: 'Music Concert', count: `${CSV_EVENTS.filter(e => e.category === 'Music Concert').length} Events` },
    { name: 'Festival', count: `${CSV_EVENTS.filter(e => e.category === 'Festival' || e.category === 'College Fest').length} Events` },
    { name: 'Workshop', count: `${CSV_EVENTS.filter(e => e.category === 'Workshop').length} Events` },
    { name: 'Business', count: `${CSV_EVENTS.filter(e => e.category === 'Business').length} Events` },
    { name: 'Hackathon', count: `${CSV_EVENTS.filter(e => e.category === 'Hackathon').length} Events` },
    { name: 'Tech Conference', count: `${CSV_EVENTS.filter(e => e.category === 'Tech Conference').length} Events` },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* Warm Ambient Background */}
      <div className="mesh-bg" />

      {/* Hero Section */}
      <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 lg:px-8 relative pt-24 pb-20">
        
        <div className="mb-12 animate-fade-in delay-100">
          <div className="category-pill shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Event Concierge Live</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#1C1917] max-w-5xl mx-auto leading-[1.05]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          <div className="animate-in delay-200">The Future of</div>
          <div className="animate-in delay-300 text-transparent bg-clip-text bg-gradient-to-r from-[#A67B5B] to-[#D4956A]">
            Event Discovery
          </div>
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-[#57534E] max-w-2xl mx-auto font-medium animate-in delay-400">
          Discover, evaluate, and book extraordinary events using intelligent recommendations, predictive pricing, and interactive seat mapping.
        </p>

        {/* AI Powered Search Bar */}
        <div className="mt-12 w-full max-w-3xl animate-in delay-500">
          <AiSearchBar onOpenChat={handleOpenChat} />
        </div>

        {/* Real-time Stats */}
        <dl className="mt-24 grid grid-cols-3 gap-8 sm:gap-24 animate-in delay-500">
          <div className="flex flex-col items-center">
            <dd className="text-4xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>120+</dd>
            <dt className="text-xs font-semibold text-[#78716C] mt-2 uppercase tracking-widest">Live Events</dt>
          </div>
          <div className="flex flex-col items-center">
            <dd className="text-4xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>15K+</dd>
            <dt className="text-xs font-semibold text-[#78716C] mt-2 uppercase tracking-widest">Tickets Sold</dt>
          </div>
          <div className="flex flex-col items-center">
            <dd className="text-4xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>₹4.5L+</dd>
            <dt className="text-xs font-semibold text-[#78716C] mt-2 uppercase tracking-widest">Commission</dt>
          </div>
        </dl>
      </div>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Featured Event Hero - Showroom Style */}
      {!loading && events.find(e => e.featured) && (
        <div className="mx-auto max-w-7xl py-24 px-6">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Featured Experience</h2>
            <Link href="/events" className="text-sm font-semibold text-[#A67B5B] hover:text-[#8B6448] transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {(() => {
            const featuredEvent = events.find(e => e.featured)!;
            return (
              <div className="showroom-card overflow-hidden group cursor-pointer relative bg-white">
                <div className="flex flex-col lg:flex-row h-full">
                  
                  {/* Image Side */}
                  <div className="lg:w-3/5 relative h-[400px] lg:h-[600px] overflow-hidden">
                    <img 
                      src={featuredEvent.banner} 
                      alt={featuredEvent.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-6 left-6 flex gap-3">
                      <div className="bg-white/90 backdrop-blur-md text-[#1C1917] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        Showcase
                      </div>
                      <div className="bg-[#A67B5B]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> {featuredEvent.popularityScore} Trending
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white relative z-10">
                    <div className="flex items-center gap-3 text-[#A67B5B] font-semibold text-sm mb-6">
                      <Calendar className="w-4.5 h-4.5" />
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <h2 className="text-4xl lg:text-5xl font-black text-[#1C1917] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                      {featuredEvent.title}
                    </h2>
                    
                    <div className="space-y-4 mb-10 text-[#57534E] font-medium text-sm lg:text-base">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#D6D3D1]" /> {featuredEvent.venue.name}, {featuredEvent.venue.city}
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-[#D6D3D1]" /> {featuredEvent.category}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-8 border-t border-[#F5F5F4] flex items-center justify-between">
                      <div>
                        <div className="text-[#78716C] text-xs font-semibold uppercase tracking-widest mb-1">Starting from</div>
                        <div className="text-3xl font-bold text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>₹{featuredEvent.ticketTiers[0]?.price}</div>
                      </div>
                      <Link
                        href={`/events/${featuredEvent.slug}`}
                        className="btn-accent flex items-center gap-2"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl py-12 px-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] mb-8" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Browse Collections</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/events?category=${encodeURIComponent(cat.name)}`}
              className="bg-white border border-[#D6D3D1] rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-[#A67B5B] hover:shadow-md hover:-translate-y-1 group"
            >
              <span className="font-semibold text-[#1C1917] text-sm sm:text-base group-hover:text-[#A67B5B] transition-colors">{cat.name}</span>
              <span className="text-xs text-[#78716C] mt-1.5 font-medium">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>



      {/* Categorized Events Sections */}
      <div className="mx-auto max-w-7xl py-12 px-6 space-y-20">
        {[
          { id: 'music', title: '🎵 Live Music & Concerts', filter: (e: any) => e.category === 'Music Concert' },
          { id: 'hackathons', title: '💻 Tech & Hackathons', filter: (e: any) => e.category === 'Hackathon' || e.category === 'Tech Conference' },
          { id: 'festivals', title: '🎪 Festivals & Cultural Events', filter: (e: any) => e.category === 'Festival' || e.category === 'College Fest' },
        ].map((section) => {
          const sectionEvents = events.filter(section.filter);
          if (sectionEvents.length === 0 && !loading) return null;

          return (
            <div key={section.id}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>{section.title}</h2>
                <Link
                  href="/events"
                  className="text-sm font-semibold text-[#A67B5B] hover:text-[#8B6448] transition-colors flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white border border-[#D6D3D1] rounded-2xl h-[380px] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sectionEvents.slice(0, 4).map((event) => (
                    <Link href={`/events/${event.slug}`} key={event._id} className="showroom-card flex flex-col h-full group">
                      {/* Image Area */}
                      <div className="relative h-56 w-full p-2 pb-0">
                        <div className="showroom-image-wrap w-full h-full relative">
                          <img
                            src={event.banner}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                          {/* Soft overlay on hover */}
                          <div className="absolute inset-0 bg-[#A67B5B]/0 group-hover:bg-[#A67B5B]/10 transition-colors duration-300 rounded-[24px]" />
                        </div>
                        {/* Price Badge */}
                        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#1C1917] shadow-sm">
                          ₹{event.ticketTiers[0]?.price || 0}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#A67B5B] mb-3">
                          <span>{event.category}</span>
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        
                        <h3 className="font-bold text-lg text-[#1C1917] leading-tight mb-2 group-hover:text-[#A67B5B] transition-colors line-clamp-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                          {event.title}
                        </h3>
                        
                        <div className="mt-auto pt-4 flex items-center text-sm text-[#57534E] font-medium">
                          <MapPin className="w-4 h-4 mr-1.5 text-[#D6D3D1]" />
                          {event.venue.city}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="section-divider max-w-7xl mx-auto my-12" />

      {/* Promoter Promo - Warm Showroom Layout */}
      <div className="mx-auto max-w-7xl py-12 px-6 mb-24">
        <div className="showroom-card overflow-hidden bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F5] to-white z-0" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 p-10 lg:p-16">
              <div className="category-pill mb-6">
                <Award className="w-3.5 h-3.5" />
                <span>Promoter Program</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-[#1C1917] mb-6 leading-[1.1]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Turn Your Influence Into Earnings
              </h2>
              <p className="text-lg text-[#57534E] font-medium leading-relaxed mb-10">
                Join our premium affiliate network. Share unique referral links, track your performance with advanced visual analytics, and earn commissions on every ticket sold.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register?role=affiliate"
                  className="btn-accent"
                >
                  Become a Promoter
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 p-10 lg:p-16 flex items-center justify-center bg-[#F5F5F4] w-full h-full min-h-[400px]">
               {/* Abstract elegant graphic representation of analytics */}
               <div className="w-full max-w-md bg-white border border-[#D6D3D1] rounded-[24px] shadow-lg p-6 relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#A67B5B] opacity-[0.05] rounded-full blur-2xl" />
                 
                 <div className="flex items-center justify-between mb-8 border-b border-[#F5F5F4] pb-4">
                   <div>
                     <div className="text-xs text-[#78716C] font-semibold uppercase tracking-wider mb-1">Total Earnings</div>
                     <div className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>₹42,500</div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#22C55E] flex items-center justify-center">
                     <TrendingUp className="w-5 h-5" />
                   </div>
                 </div>

                 <div className="space-y-4">
                   {[
                     { label: 'Conversion Rate', value: '12.4%', color: 'bg-[#A67B5B]', width: 'w-[75%]' },
                     { label: 'Link Clicks', value: '1,240', color: 'bg-[#D6D3D1]', width: 'w-[45%]' },
                   ].map((stat, i) => (
                     <div key={i}>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-[#57534E] font-medium">{stat.label}</span>
                         <span className="font-semibold text-[#1C1917]">{stat.value}</span>
                       </div>
                       <div className="w-full h-2.5 bg-[#F5F5F4] rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${stat.color} ${stat.width}`} />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <AiChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        initialQuery={initialChatQuery}
      />
    </div>
  );
}
