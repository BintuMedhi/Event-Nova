'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket as TicketIcon, Calendar, MapPin, QrCode, Loader2,
  CheckCircle, Download, Search, X,
  TrendingUp, Filter
} from 'lucide-react';
import { DEMO_TICKETS_STORAGE_KEY } from '@/lib/demoConfig';

interface Ticket {
  _id: string;
  bookingId?: string;
  tierName: string;
  quantity: number;
  totalAmount: number;
  qrCodeUrl?: string;
  qrData?: string;
  checkedIn: boolean;
  createdAt: string;
  customerName?: string;
  seats?: Array<{ seatNumber: string; row: string; section: string; sectionLabel?: string; type: string }>;
  eventId: {
    _id: string;
    title: string;
    banner: string;
    date: string;
    venue: { name: string; city: string };
    category?: string;
    artistName?: string;
  };
}

type FilterTab = 'all' | 'upcoming' | 'past' | 'used';

export default function MyTickets() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/my-tickets');
      return;
    }
    fetchMyTickets();
  }, [user]);

  const fetchMyTickets = async () => {
    // Always load demo tickets from localStorage first (saved by SuccessScreen)
    const getDemoTickets = (): Ticket[] => {
      try {
        return JSON.parse(localStorage.getItem(DEMO_TICKETS_STORAGE_KEY) || '[]');
      } catch {
        return [];
      }
    };

    try {
      const response = await fetch('/api/tickets/my', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Merge: backend tickets + any demo tickets from localStorage
        const demoTickets = getDemoTickets();
        const backendIds = new Set(data.tickets.map((t: Ticket) => t._id));
        const uniqueDemoTickets = demoTickets.filter((t: Ticket) => !backendIds.has(t._id));
        setTickets([...uniqueDemoTickets, ...data.tickets]);
      } else {
        throw new Error('Failed to load');
      }
    } catch (err) {
      // Merge demo tickets with fallback mock tickets
      const demoTickets = getDemoTickets();
      const mockTickets: Ticket[] = [
        {
          _id: 't1_mock',
          tierName: 'General Admission',
          quantity: 2,
          totalAmount: 1998,
          qrData: '{"id":"t1_mock"}',
          checkedIn: false,
          createdAt: new Date().toISOString(),
          eventId: {
            _id: 'e1',
            title: 'EDM Pulse Night 2026',
            banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
            date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Main Arena', city: 'Mumbai' },
          },
        },
        {
          _id: 't2_mock',
          tierName: 'VIP Pass',
          quantity: 1,
          totalAmount: 2999,
          qrData: '{"id":"t2_mock"}',
          checkedIn: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          eventId: {
            _id: 'e2',
            title: 'NextGen AI & Tech Summit',
            banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Innovation Lab', city: 'Bangalore' },
          },
        },
        {
          _id: 't3_mock',
          tierName: 'Premium Front Row',
          quantity: 3,
          totalAmount: 7497,
          qrData: '{"id":"t3_mock"}',
          checkedIn: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          eventId: {
            _id: 'e3',
            title: 'Bollywood Beats Live Concert',
            banner: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=800',
            date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'NSCI Dome', city: 'Mumbai' },
          },
        },
      ];
      // Deduplicate: demo tickets take priority over mocks with same ID
      const demoIds = new Set(demoTickets.map((t: Ticket) => t._id));
      const uniqueMocks = mockTickets.filter(t => !demoIds.has(t._id));
      setTickets([...demoTickets, ...uniqueMocks]);
    } finally {
      setLoading(false);
    }
  };

  // Computed filters
  const now = Date.now();

  const filteredTickets = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.eventId.date).getTime();
    const matchesSearch =
      !searchQuery ||
      ticket.eventId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.eventId.venue.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'upcoming': return eventDate > now && !ticket.checkedIn;
      case 'past': return eventDate < now && !ticket.checkedIn;
      case 'used': return ticket.checkedIn;
      default: return true;
    }
  });

  const totalSpent = tickets.reduce((sum, t) => sum + t.totalAmount, 0);
  const upcomingCount = tickets.filter((t) => new Date(t.eventId.date).getTime() > now && !t.checkedIn).length;
  const usedCount = tickets.filter((t) => t.checkedIn).length;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Passes', count: tickets.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'past', label: 'Past', count: tickets.filter((t) => new Date(t.eventId.date).getTime() < now && !t.checkedIn).length },
    { key: 'used', label: 'Used', count: usedCount },
  ];

  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    if (diff === 0) return 'Today!';
    return `in ${diff}d`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:px-8 text-left">
      <div className="mesh-bg" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">My Event Passes</h1>
          <p className="text-text-muted text-sm mt-1.5">
            Access your bookings, QR entry passes, and check-in history.
          </p>
        </div>
        {/* Stats badges */}
        {tickets.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="glass-panel border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <TicketIcon className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs font-bold text-text-primary">{tickets.length} Passes</span>
            </div>
            <div className="glass-panel border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-xs font-bold text-text-primary">₹{totalSpent.toLocaleString()} spent</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            <span className="text-xs text-text-muted animate-pulse">Loading your passes...</span>
          </div>
        </div>
      ) : tickets.length > 0 ? (
        <>
          {/* ── Search + Filter Bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search by event, tier, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/40 rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="flex gap-2 flex-wrap mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.key
                    ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-md'
                    : 'bg-white/5 border border-white/10 text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.key ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Tickets Grid ── */}
          {filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTickets.map((ticket) => {
                const isPast = new Date(ticket.eventId.date).getTime() < now;
                return (
                  <div
                    key={ticket._id}
                    className="glass-panel overflow-hidden border border-white/10 rounded-2xl flex flex-col sm:flex-row group hover:border-accent-purple/20 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Event Banner */}
                    <div className="relative w-full sm:w-44 h-36 overflow-hidden flex-shrink-0">
                      <img
                        src={ticket.eventId.banner}
                        alt={ticket.eventId.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                      {/* Date badge */}
                      <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-1 rounded-full ${
                        isPast
                          ? 'bg-black/60 text-white/70'
                          : ticket.checkedIn
                          ? 'bg-accent-green/80 text-white'
                          : 'bg-accent-purple/80 text-white'
                      }`}>
                        {getDaysUntil(ticket.eventId.date)}
                      </div>
                    </div>

                    {/* Ticket details */}
                    <div className="p-5 flex flex-col justify-between flex-grow text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] text-accent-purple font-bold uppercase tracking-wider">
                          {ticket.tierName} · {ticket.quantity} Seat{ticket.quantity > 1 ? 's' : ''}
                        </span>
                        <h3 className="font-bold text-sm text-text-primary line-clamp-2 leading-snug">
                          {ticket.eventId.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted pt-1">
                          <Calendar className="w-3 h-3 text-accent-pink flex-shrink-0" />
                          <span>
                            {new Date(ticket.eventId.date).toLocaleDateString('en-IN', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <MapPin className="w-3 h-3 text-accent-green flex-shrink-0" />
                          <span>{ticket.eventId.venue.name}, {ticket.eventId.venue.city}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-text-primary">₹{ticket.totalAmount}</span>
                          {ticket.checkedIn ? (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-accent-green/10 border border-accent-green/20 text-accent-green px-2 py-0.5 rounded-full font-bold uppercase">
                              <CheckCircle className="w-2.5 h-2.5" /> Used
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-white/5 hover:bg-accent-purple/10 border border-white/10 hover:border-accent-purple/20 text-text-muted hover:text-accent-purple text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <QrCode className="w-3 h-3" /> View QR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 glass-panel border border-white/10 rounded-2xl">
              <Filter className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="font-bold text-text-primary text-base">No passes match your filter</h3>
              <p className="text-text-muted text-sm mt-1">Try a different category or clear your search.</p>
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="mt-4 text-xs font-bold text-accent-purple bg-accent-purple/10 border border-accent-purple/20 px-4 py-2 rounded-xl cursor-pointer hover:bg-accent-purple/15 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 glass-panel max-w-xl mx-auto border border-white/10 rounded-3xl">
          <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <TicketIcon className="w-8 h-8 text-accent-purple" />
          </div>
          <h3 className="font-bold text-text-primary text-xl">No Tickets Booked Yet</h3>
          <p className="text-text-muted text-sm mt-1.5 max-w-xs mx-auto">
            Discover premium events across India and reserve your slots today!
          </p>
          <button
            onClick={() => router.push('/events')}
            className="mt-6 bg-gradient-to-r from-accent-purple to-accent-pink text-white text-sm font-semibold px-7 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-all"
          >
            Explore Events
          </button>
        </div>
      )}

      {/* ── QR Code Modal ── */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTicket(null); }}
        >
          <div className="glass-panel max-w-sm w-full p-7 border border-white/10 rounded-3xl text-center space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-bold text-base text-text-primary leading-tight line-clamp-1">
                  {selectedTicket.eventId.title}
                </h3>
                <p className="text-text-muted text-[11px] mt-0.5">{selectedTicket.tierName} Entry Pass</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Card */}
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center mx-auto border border-white/10 relative group">
              {selectedTicket.qrData ? (
                <QRCodeSVG
                  value={selectedTicket.qrData}
                  size={152}
                  level="H"
                  includeMargin={false}
                />
              ) : selectedTicket.qrCodeUrl ? (
                <img src={selectedTicket.qrCodeUrl} alt="QR Code Ticket" className="w-36 h-36" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center bg-white/5 rounded-xl">
                  <QrCode className="w-10 h-10 text-text-muted" />
                </div>
              )}
              <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-accent-purple/80 rounded-full flex items-center justify-center">
                <QrCode className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div className="py-3 border-t border-b border-white/10 space-y-2 text-left">
              {[
                ...(selectedTicket.bookingId ? [{ label: 'Booking ID', value: selectedTicket.bookingId, mono: true }] : []),
                { label: 'Ticket ID', value: selectedTicket._id, mono: true },
                ...(selectedTicket.customerName ? [{ label: 'Customer', value: selectedTicket.customerName }] : []),
                { label: 'Seats Reserved', value: `${selectedTicket.quantity} Seat${selectedTicket.quantity > 1 ? 's' : ''}` },
                ...(selectedTicket.seats?.[0]?.sectionLabel ? [{ label: 'Section', value: selectedTicket.seats[0].sectionLabel }] : []),
                { label: 'Total Paid', value: `₹${selectedTicket.totalAmount.toLocaleString('en-IN')}`, bold: true },
                { label: 'Booked On', value: new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                {
                  label: 'Status',
                  value: selectedTicket.checkedIn ? 'Checked In ✓' : 'Active',
                  colorClass: selectedTicket.checkedIn ? 'text-accent-green' : 'text-accent-purple',
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span className="text-text-muted">{row.label}:</span>
                  <span className={`font-bold ${(row as any).colorClass || 'text-text-primary'} ${(row as any).mono ? 'font-mono text-[10px]' : ''} max-w-[60%] truncate text-right`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white/5 hover:bg-accent-purple/5 border border-white/10 text-text-muted hover:text-accent-purple text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save PDF
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-semibold py-3 rounded-xl hover:opacity-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
