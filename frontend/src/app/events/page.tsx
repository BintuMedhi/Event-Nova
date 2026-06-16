'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, MapPin, Tag, ArrowRight, Loader2, Sparkles, TrendingUp, BrainCircuit } from 'lucide-react';
import { CSV_EVENTS, DEFAULT_BANNER } from '@/data/csvEventService';
// Alias for backward compat
const MOCK_EVENTS = CSV_EVENTS;

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  banner: string;
  date: string;
  venue: { name: string; city: string; address?: string };
  ticketTiers: Array<{ price: number }>;
  featured?: boolean;
  popularityScore?: number;
  tags?: string[];
}

function EventsList() {
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  const categories = ['All', 'Music Concert', 'Hackathon', 'Festival', 'Business', 'Workshop', 'Tech Conference', 'Gaming', 'College Fest'];

  // Sync initial query params
  useEffect(() => {
    const searchParam = searchParams?.get('search');
    const catParam = searchParams?.get('category');
    
    if (searchParam) setSearch(searchParam);
    if (catParam) setSelectedCategory(catParam);
    
    fetchEvents({
      search: searchParam || '',
      category: catParam || 'All',
      city: '',
      minPrice: '',
      maxPrice: '',
      sort: ''
    });
  }, [searchParams]);

  const fetchEvents = async (filters: any) => {
    setLoading(true);
    try {
      // Primary: load from CSV dataset (async, re-parses /events.csv)
      const { loadEventsFromCSV } = await import('@/data/csvEventService');
      let allEvents = await loadEventsFromCSV();

      // Apply filters client-side on CSV data
      if (filters.category && filters.category !== 'All') {
        const catQ = filters.category.toLowerCase();
        allEvents = allEvents.filter(e => e.category.toLowerCase().includes(catQ));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        allEvents = allEvents.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.city.toLowerCase().includes(q) ||
          e.organizerId.name.toLowerCase().includes(q)
        );
      }
      if (filters.city) {
        allEvents = allEvents.filter(e => e.venue.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
      if (filters.minPrice) {
        allEvents = allEvents.filter(e => (e.ticketTiers[0]?.price ?? 0) >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        allEvents = allEvents.filter(e => (e.ticketTiers[0]?.price ?? 0) <= parseInt(filters.maxPrice));
      }
      if (filters.sort === 'popularity') allEvents.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
      else if (filters.sort === 'price_asc') allEvents.sort((a, b) => (a.ticketTiers[0]?.price ?? 0) - (b.ticketTiers[0]?.price ?? 0));
      else if (filters.sort === 'price_desc') allEvents.sort((a, b) => (b.ticketTiers[0]?.price ?? 0) - (a.ticketTiers[0]?.price ?? 0));
      else allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(allEvents as any[]);
    } catch (error) {
      console.error('CSV load error, using static fallback:', error);
      // Static fallback
      let fallback = [...MOCK_EVENTS] as any[];
      if (filters.category && filters.category !== 'All') {
        const catQ = filters.category.toLowerCase();
        fallback = fallback.filter(e => e.category.toLowerCase().includes(catQ));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        fallback = fallback.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
      }
      if (filters.city) {
        fallback = fallback.filter(e => e.venue.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
      if (filters.minPrice) {
        fallback = fallback.filter(e => (e.ticketTiers[0]?.price ?? 0) >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        fallback = fallback.filter(e => (e.ticketTiers[0]?.price ?? 0) <= parseInt(filters.maxPrice));
      }
      if (filters.sort === 'popularity') fallback.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
      else if (filters.sort === 'price_asc') fallback.sort((a, b) => (a.ticketTiers[0]?.price ?? 0) - (b.ticketTiers[0]?.price ?? 0));
      else if (filters.sort === 'price_desc') fallback.sort((a, b) => (b.ticketTiers[0]?.price ?? 0) - (a.ticketTiers[0]?.price ?? 0));
      else fallback.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchEvents({ search, category: selectedCategory, city, minPrice, maxPrice, sort });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    fetchEvents({ search, category, city, minPrice, maxPrice, sort });
  };
  
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    fetchEvents({ search, category: selectedCategory, city, minPrice, maxPrice, sort: newSort });
  };

  const isFiltering = search || selectedCategory !== 'All' || city || minPrice || maxPrice || sort;

  const EventCard = ({ event }: { event: Event }) => {
    // Dynamic mock compatibility score
    const compatibilityScore = 85 + (event.title.length % 12);
    const startingPrice = event.ticketTiers?.length > 0 
      ? event.ticketTiers.reduce((min, t) => (t.price < min ? t.price : min), event.ticketTiers[0].price) 
      : 0;

    const [imgError, setImgError] = React.useState(false);

    return (
      <div className="glass-panel overflow-hidden flex flex-col h-full group hover:shadow-[0_8px_30px_rgba(108,99,255,0.15)] text-left relative">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imgError ? DEFAULT_BANNER : event.banner}
            alt={event.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ aspectRatio: '16/9' }}
          />
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[70%]">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-accent-purple border border-white/10">
              {event.category}
            </div>
            {event.featured && (
              <div className="bg-accent-pink/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Trending
              </div>
            )}
          </div>
          
          {/* AI Compatibility Score Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#1C1917] shadow-sm flex items-center gap-1.5 border border-[#22C55E]/30">
            <BrainCircuit className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#22C55E]" />
            <span className="text-[#22C55E]">{compatibilityScore}% Match</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
            <Calendar className="w-3.5 h-3.5 text-accent-pink" />
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-accent-purple transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-text-muted text-xs mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Venue and price */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-1 text-xs text-text-muted flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1 truncate w-full">
                <MapPin className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                <span className="truncate">{event.venue?.name || 'Unknown'}</span>
              </div>
              <span className="pl-4.5 text-[10px] truncate w-full block">{event.venue?.city || 'Unknown'}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-text-muted block font-medium">Starting from</span>
              <span className="text-sm font-bold text-white">
                {startingPrice === 0 ? 'FREE' : `₹${startingPrice}`}
              </span>
            </div>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="mt-4 w-full bg-white/5 border border-white/10 group-hover:bg-accent-purple text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, sectionEvents: Event[]) => {
    if (sectionEvents.length === 0) return null;
    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          <span className="text-sm font-medium text-text-muted">{sectionEvents.length} Events</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sectionEvents.slice(0, 6).map(e => <EventCard key={e._id} event={e} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mesh-bg" />

      {/* Header */}
      <div className="text-left mb-10 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Discover Events</h1>
        <p className="text-text-muted text-sm mt-1.5">
          Find college fests, workshops, gaming nights, and music events around you.
        </p>
      </div>

      {/* Extended Filters Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-1 md:col-span-2">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1 block">Search</label>
            <form onSubmit={handleApplyFilters} className="flex p-1.5 rounded-xl bg-bg-secondary border border-white/10 focus-within:border-accent-purple/50 transition-all">
              <Search className="w-4 h-4 text-accent-purple ml-2 mt-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Event title or keyword..."
                className="w-full bg-transparent border-0 outline-none text-white placeholder-text-muted text-sm py-1.5 px-2"
              />
            </form>
          </div>
          
          <div>
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1 block">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl outline-none text-white placeholder-text-muted text-sm py-2 px-3 focus:border-accent-purple/50 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1 block">Sort By</label>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl outline-none text-white text-sm py-2 px-3 focus:border-accent-purple/50 transition-all appearance-none"
            >
              <option value="">Recommended</option>
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="upcoming">Upcoming</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Price Range:</span>
              <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-20 bg-bg-secondary border border-white/10 rounded-lg outline-none text-white text-xs py-1.5 px-2" />
              <span className="text-text-muted">-</span>
              <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-20 bg-bg-secondary border border-white/10 rounded-lg outline-none text-white text-xs py-1.5 px-2" />
            </div>
          </div>
          
          <button onClick={() => handleApplyFilters()} className="bg-accent-purple hover:bg-accent-purple/80 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-accent-purple/20">
            Apply Filters
          </button>
        </div>
        
        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10 max-w-full overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent-purple border-accent-purple text-white-actual shadow-lg shadow-accent-purple/25'
                  : 'bg-bg-secondary border-transparent text-text-muted hover:bg-accent-purple/5 hover:text-accent-purple'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / Sections */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-panel h-80 animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          isFiltering ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          ) : (
            <div>
              {renderSection("🔥 Featured Events", events.filter(e => e.featured))}
              {renderSection("🎵 Music Concerts", events.filter(e => e.category === 'Music Concert'))}
              {renderSection("💻 Hackathons & HackFests", events.filter(e => e.category === 'Hackathon'))}
              {renderSection("🖥️ Tech Conferences & Summits", events.filter(e => e.category === 'Tech Conference'))}
              {renderSection("💼 Business & Startup Events", events.filter(e => e.category === 'Business' || e.category === 'Startup Meet'))}
              {renderSection("🎓 Workshops", events.filter(e => e.category === 'Workshop'))}
              {renderSection("🎪 Festivals", events.filter(e => e.category === 'Festival' || e.category === 'College Fest'))}
              {renderSection("✨ Other Events", events.filter(e => !['Music Concert','Hackathon','Business','Startup Meet','Tech Conference','Workshop','Festival','College Fest'].includes(e.category)))}
            </div>
          )
        ) : (
          <div className="text-center py-16 glass-panel max-w-xl mx-auto border border-white/10 rounded-2xl">
            <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-bold text-white text-lg">No Events Found</h3>
            <p className="text-text-muted text-sm mt-1">Try relaxing your search query or choosing another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent-purple w-8 h-8" /></div>}>
      <EventsList />
    </Suspense>
  );
}
