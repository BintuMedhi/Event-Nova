'use client';

import React, { useState } from 'react';
import { BookingSummary } from '@/components/checkout/BookingSummary';
import { PaymentMethods } from '@/components/checkout/PaymentMethods';
import { TrustBadges } from '@/components/checkout/TrustBadges';
import { CheckCircle2, ArrowLeft, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { InteractiveSeatMap, Seat } from '@/components/checkout/InteractiveSeatMap';
import { SuccessScreen } from '@/components/checkout/SuccessScreen';
import { useSearchParams } from 'next/navigation';
import { getEventBySlug } from '@/data/csvEventService';
import { DEMO_PAYMENT_MODE } from '@/lib/demoConfig';

const fallbackEvent = {
  title: 'Event Details Loading...',
  date: 'Loading...',
  time: 'Loading...',
  venue: 'Loading Venue...',
  image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
  category: 'Live Event',
  artistName: 'Artist',
  artistBio: 'Loading artist details...',
  artistImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
  achievements: [],
  rawDate: '',
};

/* ── Step Indicator ─────────────────────────────────────────────────────── */
const Steps = ({ current }: { current: number }) => {
  const steps = ['Select Tickets', 'Choose Seats', 'Payment'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10 w-full max-w-2xl mx-auto">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
              i < current
                ? 'bg-[#E8F5E9] border-[#22C55E]/30 text-[#22C55E]'
                : i === current
                ? 'bg-white border-[#A67B5B] text-[#1C1917] shadow-sm'
                : 'bg-transparent border-[#D6D3D1] text-[#78716C]'
            }`}
          >
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === current ? 'bg-[#A67B5B] text-white' : 'bg-[#D6D3D1] text-[#1C1917]'}`}>{i + 1}</div>}
            <span className={`text-sm font-semibold ${i === current ? 'text-[#1C1917]' : ''}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-4 sm:w-12 h-px ${i < current ? 'bg-[#22C55E]' : 'bg-[#D6D3D1]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Demo Mode Badge ────────────────────────────────────────────────────── */
const DemoModeBadge = () => (
  <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-amber-900/90 backdrop-blur-md border border-amber-500/30 text-amber-300 rounded-full shadow-xl text-xs font-bold uppercase tracking-wider pointer-events-none select-none">
    <FlaskConical className="w-3.5 h-3.5" />
    Demo Mode Enabled
    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
  </div>
);

/* ── Main Checkout Page ─────────────────────────────────────────────────── */
function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug');
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = Seats, 2 = Payment
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [eventData, setEventData] = useState(fallbackEvent);

  React.useEffect(() => {
    const loadData = async () => {
      if (!slug) return;

      // Try CSV first
      const found = getEventBySlug(slug);
      if (found) {
        setEventData({
          ...fallbackEvent,
          title: found.title,
          date: new Date(found.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
          time: new Date(found.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' onwards',
          venue: `${found.venue.name}, ${found.venue.city}`,
          image: found.banner || fallbackEvent.image,
          category: found.category,
          artistName: found.title.split(' ')[0],
          artistBio: found.description,
          artistImage: found.banner || fallbackEvent.artistImage,
          rawDate: found.date,
        });
        return;
      }

      // Try backend as secondary source
      try {
        const res = await fetch(`/api/events/slug/${slug}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEventData({
            ...fallbackEvent,
            title: data.event.title,
            date: new Date(data.event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date(data.event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' onwards',
            venue: `${data.event.venue.name}, ${data.event.venue.city}`,
            image: data.event.banner || fallbackEvent.image,
            category: data.event.category,
            artistName: data.event.title.split(' ')[0],
            artistBio: data.event.description,
            artistImage: data.event.banner || fallbackEvent.artistImage,
            rawDate: data.event.date,
          });
          return;
        }
      } catch (err) {
        console.error('Failed to fetch event from backend', err);
      }

      // If NOT FOUND
      setEventData({
        ...fallbackEvent,
        title: 'Event Not Found',
        date: '',
        time: '',
        venue: '',
        artistBio: 'We could not find the details for this event.',
        rawDate: '',
      });
    };

    loadData();
  }, [slug]);

  /** Called by any payment method when user confirms payment */
  const handlePaymentComplete = () => {
    setIsSuccess(true);
  };

  if (isSuccess) return <SuccessScreen seats={selectedSeats} eventData={eventData} />;

  // Translate seats to the format BookingSummary expects
  const dynamicTickets = selectedSeats.map(s => ({
    type: `${s.type === 'vip' ? 'VIP' : 'Standard'} (Sec ${s.section}, Row ${s.row}, Seat ${s.seatNumber})`,
    price: s.price,
    quantity: 1
  }));

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#FAF7F5] overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A67B5B] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4956A] opacity-[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to event
          </Link>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#1C1917] mb-3" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            {step === 1 ? 'Choose Your Seats' : 'Secure Checkout'}
          </h1>
          <p className="text-[#57534E] font-medium">
            {step === 1 ? 'Interactive venue map with real-time availability' : 'Complete payment to confirm your premium booking'}
          </p>
        </div>

        {/* Step indicator */}
        <Steps current={step} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left — Main Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="showroom-card p-6 bg-white">
              {step === 1 ? (
                <InteractiveSeatMap 
                  eventId="e1"
                  onSelectionChange={setSelectedSeats} 
                  maxSelection={10} 
                />
              ) : (
                <PaymentMethods onPaymentComplete={handlePaymentComplete} />
              )}
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
            <div className="showroom-card p-6 bg-white">
              <BookingSummary event={eventData} tickets={dynamicTickets} />
              
              <div className="mt-6 pt-6 border-t border-[#F5F5F4]">
                {step === 1 && (
                  <button 
                    onClick={() => setStep(2)}
                    disabled={selectedSeats.length === 0}
                    className="w-full btn-accent flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                  >
                    Proceed to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                
                {step === 2 && (
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full btn-ghost"
                  >
                    Back to Seats
                  </button>
                )}
              </div>
            </div>
            
            <div className="showroom-card p-6 bg-white">
              <TrustBadges />
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Badge — fixed, only visible when DEMO_PAYMENT_MODE is true */}
      {DEMO_PAYMENT_MODE && <DemoModeBadge />}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]"><div className="w-10 h-10 border-4 border-[#A67B5B] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutPageContent />
    </React.Suspense>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
