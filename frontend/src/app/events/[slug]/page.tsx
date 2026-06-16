'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, MapPin, Tag, Award, Share2, Sparkles, Loader2, Plus, Minus, ArrowLeft, Ticket, Check, Copy, LayoutGrid } from 'lucide-react';
import CompatibilityBadge from '@/components/ai/CompatibilityBadge';
import PricePredictionWidget from '@/components/ai/PricePredictionWidget';
import { InteractiveSeatMap, type Seat } from '@/components/checkout/InteractiveSeatMap';
import { CSV_EVENTS, DEFAULT_BANNER, getEventBySlug } from '@/data/csvEventService';
// Alias for compat
const MOCK_EVENTS = CSV_EVENTS;

interface TicketTier {
  _id: string;
  name: string;
  price: number;
  totalSeats: number;
  soldSeats: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
}

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  banner: string;
  date: string;
  endDate: string;
  venue: { name: string; address: string; city: string };
  ticketTiers: TicketTier[];
  organizerId: { _id: string; name: string; email: string; referralCode: string };
}

/** Banner image with error fallback */
function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);
  return (
    <img
      src={error ? DEFAULT_BANNER : src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
    />
  );
}

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  // Seat map state
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const handleSeatSelection = useCallback((seats: Seat[]) => setSelectedSeats(seats), []);

  // Referral link params
  const [referralCode, setReferralCode] = useState<string>('');

  // AI captions
  const [aiCaption, setAiCaption] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Clipboard copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  useEffect(() => {
    // Read ref parameter from URL
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
    fetchEventDetails();
  }, [params, searchParams]);

  const fetchEventDetails = async () => {
    try {
      // Primary: look up event from CSV dataset (dynamically loaded)
      const { loadEventsFromCSV, getEventBySlug: csvGetBySlug } = await import('@/data/csvEventService');
      const allEvents = await loadEventsFromCSV();
      const csvEvent = csvGetBySlug(params.slug as string, allEvents);
      if (csvEvent) {
        setEvent(csvEvent as any);
        if (csvEvent.ticketTiers.length > 0) {
          setSelectedTier(csvEvent.ticketTiers[0]._id);
        }
        setLoading(false);
        return;
      }
      // Try backend as secondary source
      const response = await fetch(`/api/events/slug/${params.slug}`);
      const data = await response.json();
      if (data.success && data.event) {
        setEvent(data.event);
        if (data.event.ticketTiers.length > 0) {
          setSelectedTier(data.event.ticketTiers[0]._id);
        }
      } else {
        throw new Error('Not found');
      }
    } catch (error) {
      // Static CSV fallback: look up by slug
      const mockEvent = getEventBySlug(params.slug as string) || CSV_EVENTS[0];
      setEvent(mockEvent as any);
      if (mockEvent.ticketTiers && mockEvent.ticketTiers.length > 0) {
        setSelectedTier(mockEvent.ticketTiers[0]._id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'WELCOME10') {
      setCouponApplied(true);
    }
  };

  const handleGenerateAICaption = async () => {
    if (!event) return;
    setAiLoading(true);
    setAiCaption('');
    try {
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: event.title, category: event.category }),
      });
      const data = await response.json();
      if (data.success) {
        setAiCaption(data.caption);
      }
    } catch (err) {
      setAiCaption(`✨ Discover ${event.title}! Join me for an unforgettable experience.\n\n🎟️ Book your tickets through my referral link for a special discount! #EventNova #PremiumExperiences`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!user || !token) {
      router.push(`/login?redirect=/events/${event?.slug}`);
      return;
    }

    if (!event) return;

    router.push(`/checkout?slug=${event.slug}&tierId=${selectedTier}&quantity=${quantity}&ref=${referralCode}&coupon=${couponApplied ? 'WELCOME10' : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#A67B5B] animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white px-6">
        <h2 className="text-4xl font-black tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Experience Not Found</h2>
        <p className="mt-4 text-[#57534E]">The event you are looking for is unavailable.</p>
        <Link href="/events" className="mt-8 btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Discover Events
        </Link>
      </div>
    );
  }

  const selectedTierObj = event.ticketTiers.find((t) => t._id === selectedTier);
  const basePrice = selectedTierObj?.price || 0;
  const discountMultiplier = couponApplied ? 0.9 : 1;
  const finalPrice = Math.round(basePrice * quantity * discountMultiplier);

  // User referral link
  const promoterLink = user
    ? `/api/events/track?ref=${user.referralCode}&eventId=${event._id}`
    : `/api/events/track?eventId=${event._id}`;

  const copyToClipboard = (text: string, type: 'link' | 'caption') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#78716C] hover:text-[#1C1917] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Banner */}
            <div className="showroom-card overflow-hidden bg-white p-2 h-[500px]">
              <div className="w-full h-full relative rounded-2xl overflow-hidden">
                <BannerImage src={event.banner} alt={event.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#1C1917] shadow-sm">
                  {event.category}
                </div>
              </div>
            </div>

            {/* Title & Meta */}
            <div className="showroom-card p-10 bg-white">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-[#1C1917] leading-[1.05]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-[#57534E] font-medium bg-[#F5F5F4] px-4 py-2 rounded-xl">
                  <Calendar className="w-4.5 h-4.5 text-[#A67B5B]" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="flex items-center gap-2 text-[#57534E] font-medium bg-[#F5F5F4] px-4 py-2 rounded-xl">
                  <MapPin className="w-4.5 h-4.5 text-[#A67B5B]" />
                  {event.venue.name}, {event.venue.city}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="showroom-card p-10 bg-white">
              <h3 className="font-bold text-2xl tracking-tight mb-6 text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>About the Event</h3>
              <p className="text-[#57534E] text-lg leading-relaxed whitespace-pre-line font-medium">
                {event.description}
              </p>
            </div>

            {/* ── Interactive Seat Map ─────────────────────────────── */}
            <div className="showroom-card bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl tracking-tight flex items-center gap-2 text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  <LayoutGrid className="w-5 h-5 text-[#A67B5B]" />
                  Choose Your Seats
                </h3>
                <button
                  onClick={() => setShowSeatMap((v) => !v)}
                  className="text-xs font-bold text-[#A67B5B] hover:text-[#1C1917] transition-colors underline underline-offset-2"
                >
                  {showSeatMap ? 'Hide seat map' : 'Open seat map'}
                </button>
              </div>

              {!showSeatMap ? (
                <div
                  onClick={() => setShowSeatMap(true)}
                  className="w-full rounded-2xl border-2 border-dashed border-[#D6D3D1] bg-[#FAF7F5] hover:border-[#A67B5B] hover:bg-[#FDF8F5] transition-all cursor-pointer p-12 flex flex-col items-center justify-center gap-3"
                >
                  <LayoutGrid className="w-10 h-10 text-[#D6D3D1]" />
                  <p className="text-[#78716C] font-semibold text-sm">Click to open the interactive venue map</p>
                  <p className="text-[#A8A29E] text-xs font-medium">Select your preferred section and seats</p>
                </div>
              ) : (
                <InteractiveSeatMap
                  eventId={event._id}
                  eventCategory={event.category}
                  onSelectionChange={handleSeatSelection}
                  maxSelection={10}
                />
              )}

              {selectedSeats.length > 0 && (
                <div className="mt-4 flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <Check className="w-4 h-4" />
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                  </div>
                  <span className="text-green-800 font-black text-lg">
                    ₹{selectedSeats.reduce((s, seat) => s + seat.price, 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* AI Compatibility Score */}
            <div className="showroom-card p-10 bg-white">
              <h3 className="font-bold text-2xl tracking-tight mb-6 flex items-center gap-2 text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                <Sparkles className="w-5 h-5 text-[#A67B5B]" />
                Compatibility Match
              </h3>
              <CompatibilityBadge eventId={event._id} eventCategory={event.category} />
            </div>

            {/* Affiliate Promotion box */}
            <div className="showroom-card p-10 bg-[#FAF7F5] border border-[#A67B5B]/20 relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#A67B5B] opacity-10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="category-pill mb-4 bg-white shadow-sm border-[#D6D3D1]">
                  <Award className="w-3.5 h-3.5" />
                  <span>Affiliate Program</span>
                </div>
                <h3 className="font-bold text-2xl tracking-tight mb-3 text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  Earn 10% Commission
                </h3>
                <p className="text-[#57534E] font-medium leading-relaxed max-w-2xl mb-8">
                  Share this premium experience with your network. Generate custom tracking links and earn commissions on every booking.
                </p>

                {user ? (
                  <div className="space-y-6">
                    {/* Share Link */}
                    <div className="flex items-center gap-2 p-1.5 bg-white border border-[#D6D3D1] rounded-2xl max-w-xl shadow-sm">
                      <input
                        type="text"
                        readOnly
                        value={promoterLink}
                        className="bg-transparent border-0 outline-none text-sm font-medium text-[#57534E] pl-4 py-2 w-full"
                      />
                      <button
                        onClick={() => copyToClipboard(promoterLink, 'link')}
                        className="bg-[#1C1917] hover:bg-[#44403C] text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors flex-shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy Link
                      </button>
                    </div>

                    {/* AI Social Caption Generator */}
                    <div className="pt-6 border-t border-[#D6D3D1]">
                      <button
                        onClick={handleGenerateAICaption}
                        disabled={aiLoading}
                        className="btn-ghost flex items-center gap-2"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Generating Magic...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Generate AI Campaign Caption
                          </>
                        )}
                      </button>

                      {aiCaption && (
                        <div className="mt-4 p-6 bg-white border border-[#D6D3D1] rounded-2xl max-w-xl relative shadow-sm">
                          <pre className="text-sm font-medium text-[#57534E] whitespace-pre-wrap leading-relaxed font-sans">
                            {aiCaption}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(aiCaption, 'caption')}
                            className="absolute top-4 right-4 p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                            title="Copy Caption"
                          >
                            {copiedCaption ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <Link
                      href={`/register?role=affiliate&ref=guest`}
                      className="btn-accent flex items-center gap-2 w-max"
                    >
                      Login to access tools <Share2 className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Widget */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Price Prediction */}
            {event.ticketTiers.length > 0 && (
              <PricePredictionWidget
                eventId={event._id}
                currentPrice={event.ticketTiers[0]?.price || 0}
                onBuyNow={handleCheckout}
              />
            )}
            
            <div className="showroom-card bg-white p-8 sticky top-28">
              <h3 className="font-bold text-xl tracking-tight text-[#1C1917] mb-6" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Secure Your Experience</h3>

              {/* Tiers list */}
              <div className="space-y-3 mb-6">
                {event.ticketTiers.map((tier) => {
                  const isSoldOut = tier.soldSeats >= tier.totalSeats;
                  return (
                    <div
                      key={tier._id}
                      onClick={() => !isSoldOut && setSelectedTier(tier._id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        selectedTier === tier._id
                          ? 'border-[#A67B5B] bg-[#A67B5B]/5 shadow-[0_0_0_1px_#A67B5B]'
                          : 'border-[#D6D3D1] bg-white hover:border-[#A8A29E]'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed bg-[#F5F5F4] border-[#E7E5E4]' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#1C1917] block text-lg">
                            {tier.name}
                          </span>
                          <span className={`text-xs font-semibold uppercase tracking-wider mt-0.5 block ${selectedTier === tier._id ? 'text-[#A67B5B]' : 'text-[#78716C]'}`}>
                            {tier.totalSeats - tier.soldSeats} remaining
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>₹{tier.price}</span>
                          {isSoldOut && <span className="text-[10px] font-bold block uppercase text-[#EF4444] mt-1">Sold Out</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between py-4 border-t border-[#F5F5F4]">
                <span className="text-sm font-semibold text-[#57534E]">Quantity</span>
                <div className="flex items-center gap-3 bg-[#F5F5F4] rounded-full p-1 border border-[#D6D3D1]">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#57534E] transition-colors shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-[#1C1917] w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#57534E] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Coupon */}
              <div className="space-y-2 py-4 border-t border-[#F5F5F4]">
                <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-2">
                  Promo Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1C1917] outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#1C1917] hover:bg-[#44403C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <span className="text-xs font-semibold text-[#22C55E] block mt-2">
                    Code applied successfully! (10% off)
                  </span>
                )}
              </div>

              {/* Checkout Calculation */}
              <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[#57534E]">Base price:</span>
                  <span className="text-[#1C1917]">₹{basePrice} x {quantity}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm font-medium text-[#22C55E]">
                    <span>Discount:</span>
                    <span>- ₹{Math.round(basePrice * quantity * 0.1)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[#57534E] font-semibold text-sm">Total:</span>
                  <span className="text-3xl font-bold tracking-tight text-[#1C1917]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>₹{finalPrice}</span>
                </div>
              </div>

              {/* Booking CTA Button */}
              <div className="mt-8">
                <button
                  onClick={handleCheckout}
                  disabled={bookingLoading}
                  className="btn-accent w-full flex items-center justify-center gap-2 shadow-lg"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" /> Proceed to Checkout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
