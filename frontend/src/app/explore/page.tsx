'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Map, Sparkles, TrendingUp, Flame, ArrowRight, Search,
  Calendar, MapPin, BrainCircuit, Tag, Filter, X, Music,
  Code2, Briefcase, Wrench, PartyPopper, Globe, SlidersHorizontal, Loader2
} from 'lucide-react';
import {
  CSV_EVENTS,
  DEFAULT_BANNER,
  type EventRecord,
} from '@/data/csvEventService';

// Dynamically import HeatMap with SSR disabled to prevent Leaflet window errors
const EventHeatMap = dynamic(() => import('@/components/map/EventHeatMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] rounded-3xl border border-[#D6D3D1] bg-[#FAF7F5]/50 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#A67B5B] animate-spin mb-2" />
      <span className="text-sm font-semibold text-[#78716C]">Loading Map...</span>
    </div>
  )
});

// Category Configuration for Filters
const CATEGORIES = [
  { id: 'All',           label: 'All Events',      icon: Globe,        accent: '#A67B5B' },
  { id: 'Music Concert', label: 'Music Concerts',   icon: Music,        accent: '#D4956A' },
  { id: 'Hackathon',     label: 'Hackathons',       icon: Code2,        accent: '#7C6FE5' },
  { id: 'Business',      label: 'Business Events',  icon: Briefcase,    accent: '#22C55E' },
  { id: 'Workshop',      label: 'Workshops',        icon: Wrench,       accent: '#F59E0B' },
  { id: 'Festival',      label: 'Festivals',        icon: PartyPopper,  accent: '#EC4899' },
];

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event }: { event: EventRecord }) {
  const startingPrice = event.ticketTiers[0]?.price ?? 0;
  const [imgError, setImgError] = useState(false);

  // Dynamic compatibility fallback if not provided
  const compatibilityScore = event.compatibilityScore ?? (75 + (event.title.length % 20));

  return (
    <div className="showroom-card overflow-hidden flex flex-col h-full group text-left relative">
      {/* Banner */}
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={imgError ? DEFAULT_BANNER : event.banner}
          alt={event.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          style={{ aspectRatio: '16/9' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[70%]">
          <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#A67B5B] shadow-sm border border-white/40">
            {event.category}
          </span>
          {event.featured && (
            <span className="bg-[#A67B5B]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
        </div>

        {/* AI Compatibility Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-[#1C1917] shadow-sm flex items-center gap-1 border border-[#22C55E]/20">
          <BrainCircuit className="w-3 h-3 text-[#22C55E]" />
          <span className="text-[#22C55E]">{compatibilityScore}% Match</span>
        </div>

        {/* Date chip on image */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-[#D4956A]" />
          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-[#1C1917] group-hover:text-[#A67B5B] transition-colors line-clamp-1 mb-1" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {event.title}
        </h3>
        <p className="text-[#78716C] text-xs mt-1 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Venue & Price row */}
        <div className="mt-auto pt-4 border-t border-[#F5F5F4] flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#57534E] truncate">
              <MapPin className="w-3 h-3 text-[#A67B5B] flex-shrink-0" />
              <span className="truncate font-medium">{event.venue.name}</span>
            </div>
            <span className="text-[10px] text-[#78716C] pl-4.5">{event.venue.city}{event.venue.state ? `, ${event.venue.state}` : ''}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[10px] text-[#78716C] block font-medium">From</span>
            <span className="text-sm font-bold text-[#1C1917]">
              {startingPrice === 0 ? 'FREE' : `₹${startingPrice.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="mt-4 w-full bg-[#A67B5B] hover:bg-[#8B6448] text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-[0_4px_16px_rgba(166,123,91,0.3)]"
        >
          Book Now <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Featured Event Hero Card ─────────────────────────────────────────────────
function FeaturedHeroCard({ event }: { event: EventRecord }) {
  const [imgError, setImgError] = useState(false);
  const price = event.ticketTiers[0]?.price ?? 0;
  return (
    <Link href={`/events/${event.slug}`} className="showroom-card overflow-hidden group flex flex-col h-full relative cursor-pointer block">
      {/* Banner */}
      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={imgError ? DEFAULT_BANNER : event.banner}
          alt={event.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-[#A67B5B] text-white px-3 py-1 rounded-full text-xs font-bold shadow">Showcase</span>
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {event.popularityScore} score
          </span>
        </div>
        {/* Title overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{event.category}</span>
          <h3 className="text-white font-black text-xl leading-tight mt-1 line-clamp-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            {event.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-white/80 text-xs font-medium">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue.city}</span>
          </div>
        </div>
      </div>
      {/* Price footer */}
      <div className="px-5 py-4 flex items-center justify-between bg-white border-t border-[#F5F5F4]">
        <div>
          <span className="text-[10px] text-[#78716C] font-semibold uppercase tracking-wider">From</span>
          <div className="text-xl font-black text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            {price === 0 ? 'FREE' : `₹${price.toLocaleString('en-IN')}`}
          </div>
        </div>
        <span className="bg-[#A67B5B] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 group-hover:bg-[#8B6448] transition-colors">
          Book Now <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function Section({ title, events, viewAllHref }: { title: string; events: EventRecord[]; viewAllHref?: string }) {
  if (events.length === 0) return null;
  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-[#1C1917] tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {title}
          <span className="ml-3 text-sm font-semibold text-[#78716C]">({events.length})</span>
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-semibold text-[#A67B5B] hover:text-[#8B6448] flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.slice(0, 8).map(e => <EventCard key={e._id} event={e} />)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');

  useEffect(() => {
    async function loadEvents() {
      try {
        // Always load from CSV dataset first (primary source of truth)
        const { loadEventsFromCSV } = await import('@/data/csvEventService');
        const csvData = await loadEventsFromCSV();
        if (csvData.length > 0) {
          setEvents(csvData);
          setLoading(false);
          return;
        }
      } catch {
        // If dynamic CSV load fails, fall through to static data
      }
      // Static fallback — always available
      setEvents(CSV_EVENTS);
      setLoading(false);
    }
    loadEvents();
  }, []);

  // Compute stats dynamically from loaded events
  const stats = useMemo(() => {
    const citiesCount = new Set(events.map(e => e.venue.city.trim())).size;
    const hotCategoriesCount = new Set(events.map(e => e.category)).size;
    const featuredCount = events.filter(e => e.featured).length;
    return [
      { label: 'Cities Covered',   value: `${citiesCount}+`,   icon: Map },
      { label: 'Events This Season', value: `${events.length}`,  icon: Sparkles },
      { label: 'Trending Events',  value: `${featuredCount}`, icon: TrendingUp },
      { label: 'Hot Categories',   value: `${hotCategoriesCount}`,    icon: Flame },
    ];
  }, [events]);

  // Sort and filter events dynamically
  const displayedEvents = useMemo<EventRecord[]>(() => {
    let results = [...events];

    // Filter by Category
    if (activeCategory !== 'All') {
      results = results.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.city.toLowerCase().includes(q) ||
        e.venue.name.toLowerCase().includes(q) ||
        e.organizerId.name.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price_asc') {
      results.sort((a, b) => (a.ticketTiers[0]?.price ?? 0) - (b.ticketTiers[0]?.price ?? 0));
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => (b.ticketTiers[0]?.price ?? 0) - (a.ticketTiers[0]?.price ?? 0));
    } else if (sortBy === 'newest') {
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'popular') {
      results.sort((a, b) => b.popularityScore - a.popularityScore);
    } else {
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return results;
  }, [events, activeCategory, searchQuery, sortBy]);

  const isFiltering = searchQuery.trim() || activeCategory !== 'All';

  // Group events by target categories for dynamic sections
  const musicEvents = useMemo(() => events.filter(e => e.category === 'Music Concert'), [events]);
  const hackathonEvents = useMemo(() => events.filter(e => e.category === 'Hackathon'), [events]);
  const businessEvents = useMemo(() => events.filter(e => e.category === 'Business'), [events]);
  const workshopEvents = useMemo(() => events.filter(e => e.category === 'Workshop'), [events]);
  const festivalEvents = useMemo(() => events.filter(e => e.category === 'Festival'), [events]);
  const otherEvents = useMemo(() => events.filter(e => !['Music Concert', 'Hackathon', 'Business', 'Workshop', 'Festival'].includes(e.category)), [events]);

  const featuredEvents = useMemo(() => {
    return events.filter(e => e.featured).sort((a, b) => b.popularityScore - a.popularityScore);
  }, [events]);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <div className="mesh-bg" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28">

        {/* ── Page Header ── */}
        <div className="mb-12 text-center lg:text-left">
          <div className="inline-flex mb-5 category-pill shadow-sm">
            <Map className="w-3.5 h-3.5 text-[#A67B5B]" />
            <span>Live Event Intelligence · {events.length} Events</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1C1917] tracking-tight leading-[1.05]"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            Discover Events
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium text-[#57534E] leading-relaxed mx-auto lg:mx-0">
            Explore trending events, AI-powered recommendations, and the hottest experiences happening near you — all from our dynamically synced calendar.
          </p>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map(stat => (
            <div key={stat.label} className="showroom-card p-5 flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-2xl bg-[#F5EDE5] flex items-center justify-center text-[#A67B5B] mb-3 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-[#1C1917] tracking-tight mb-0.5" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>{stat.value}</p>
              <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Featured Events Hero ── */}
        {!loading && featuredEvents.length > 0 && viewMode === 'card' && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#1C1917] tracking-tight flex items-center gap-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                <Flame className="w-5 h-5 text-[#D4956A]" />
                Featured Experiences
                <span className="text-sm font-semibold text-[#78716C]">({featuredEvents.length})</span>
              </h2>
              <Link href="/events?sort=popularity" className="text-sm font-semibold text-[#A67B5B] hover:text-[#8B6448] flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 6).map(e => (
                <FeaturedHeroCard key={e._id} event={e} />
              ))}
            </div>
          </div>
        )}

        {/* ── Search, Filter & View Toggle Bar ── */}
        <div className="showroom-card p-5 mb-10 bg-white">
          <div className="flex flex-col lg:flex-row gap-4 mb-5 items-stretch lg:items-center">
            {/* Search */}
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A67B5B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events, organizers, venues, cities..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F5F4] border border-[#D6D3D1] text-[#1C1917] text-sm font-medium placeholder-[#78716C] focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/15 outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Toggle Row */}
            <div className="flex flex-wrap items-center gap-4 justify-between sm:justify-start">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#78716C] flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl text-sm font-medium text-[#1C1917] py-3 px-4 focus:border-[#A67B5B] outline-none transition-all appearance-none min-w-[160px]"
                >
                  <option value="featured">Featured First</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Upcoming First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-white text-[#1C1917] shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  Card View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-white text-[#1C1917] shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id && !searchQuery
                    ? 'border-[#A67B5B] bg-[#A67B5B] text-white shadow-[0_4px_16px_rgba(166,123,91,0.25)]'
                    : 'border-[#D6D3D1] bg-white text-[#57534E] hover:border-[#A67B5B] hover:text-[#A67B5B]'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
            {isFiltering && (
              <button
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Event Loading & Rendering Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="showroom-card h-[380px] animate-pulse bg-white/5 border border-white/10" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          /* Heat Map View */
          <div className="animate-fade-in">
            <div className="mb-4 text-left">
              <h2 className="text-xl font-black text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Interactive Heat Map ({displayedEvents.length} Events)
              </h2>
              <p className="text-[#78716C] text-xs mt-0.5">Explore geographic distribution and browse live events by city.</p>
            </div>
            <EventHeatMap events={displayedEvents} />
          </div>
        ) : isFiltering ? (
          /* Filtered / Search results Card View */
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-[#57534E]">
                {displayedEvents.length === 0 ? 'No events found' : `${displayedEvents.length} event${displayedEvents.length === 1 ? '' : 's'} found`}
                {searchQuery ? ` for "${searchQuery}"` : ''}
              </p>
            </div>
            {displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedEvents.map(e => <EventCard key={e._id} event={e} />)}
              </div>
            ) : (
              <div className="text-center py-20 showroom-card max-w-lg mx-auto bg-white">
                <Sparkles className="w-12 h-12 text-[#D6D3D1] mx-auto mb-4" />
                <h3 className="font-bold text-[#1C1917] text-lg mb-2">No Events Found</h3>
                <p className="text-[#78716C] text-sm">Try a different search term or explore another category.</p>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-6 btn-accent inline-flex items-center gap-2 cursor-pointer">
                  Show All Events <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Sectioned Card View */
          <div className="animate-fade-in">
            <Section
              title="🎵 Music Concerts"
              events={musicEvents}
              viewAllHref="/events?category=Music+Concert"
            />
            <Section
              title="💻 Hackathons"
              events={hackathonEvents}
              viewAllHref="/events?category=Hackathon"
            />
            <Section
              title="💼 Business Events"
              events={businessEvents}
              viewAllHref="/events?category=Business"
            />
            <Section
              title="🛠️ Workshops"
              events={workshopEvents}
              viewAllHref="/events?category=Workshop"
            />
            <Section
              title="🎪 Festivals"
              events={festivalEvents}
              viewAllHref="/events?category=Festival"
            />
            {otherEvents.length > 0 && (
              <Section
                title="✨ Other Experiences"
                events={otherEvents}
                viewAllHref="/events"
              />
            )}
          </div>
        )}

        {/* ── CTA Strip ── */}
        <div className="mt-16 text-center showroom-card p-12 bg-gradient-to-br from-[#FAF7F5] to-[#F5EDE5] relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#A67B5B] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 text-[#A67B5B] mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#1C1917] mb-2 tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Find Your Next Experience
            </h2>
            <p className="text-[#57534E] font-medium mb-6 max-w-md mx-auto">
              Browse our complete collection of dynamic events with AI-powered recommendations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/events" className="btn-accent flex items-center gap-2">
                Browse All Events <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => {
                const element = document.getElementById('copilot-button');
                if (element) (element as any).click();
              }} className="btn-ghost flex items-center gap-2 cursor-pointer">
                Ask AI Concierge <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
