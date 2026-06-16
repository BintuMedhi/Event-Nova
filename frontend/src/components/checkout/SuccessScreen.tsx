'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2, Download, Share2, MapPin, Calendar, Clock,
  Wallet, ShieldCheck, Mail, Navigation, Info, Award,
  Shield, User, Home, Ticket, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { DEMO_TICKETS_STORAGE_KEY } from '@/lib/demoConfig';

/* ── Confetti Particle Component ────────────────────────────────────────── */
const Confetti = () => {
  const particles = useRef(
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      color: ['#A67B5B', '#D4956A', '#22C55E', '#16A34A', '#FCD34D', '#F87171', '#60A5FA'][Math.floor(Math.random() * 7)],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 30,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      size: 4 + Math.random() * 6,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.left}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: '110vh',
            x: `${p.left + p.drift}vw`,
            opacity: [1, 1, 0],
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            scale: [1, 1.2, 0.8],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          className="absolute top-0"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 1.5,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

/* ── Pulsing Ring Animation ─────────────────────────────────────────────── */
const PulsingRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2 border-green-400/30"
        initial={{ width: 112, height: 112, opacity: 0.8 }}
        animate={{ width: 112 + i * 50, height: 112 + i * 50, opacity: 0 }}
        transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}
  </div>
);

/* ── Main Success Screen ────────────────────────────────────────────────── */
export const SuccessScreen = ({ seats, eventData }: { seats: any[], eventData: any }) => {
  // Stages: 0: Processing, 1: Success Anim, 2: Ticket Gen, 3: Ticket Reveal
  const [stage, setStage] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth();

  // Stable IDs — generated once
  const bookingId = useRef(`EVN-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`);
  const ticketId  = useRef(`TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const orderId   = useRef(`ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  const txnId     = useRef(`TXN${Math.floor(Math.random() * 90000000) + 10000000}`);
  const upiRef    = useRef(`UPI${Math.floor(Math.random() * 90000000) + 10000000}`);
  const bookedAt  = useRef(new Date().toISOString());
  const qrVerCode = useRef(`QV-${Math.random().toString(36).substring(2, 14).toUpperCase()}`);

  // Calculate totals
  const subtotal = seats.reduce((a: number, t: any) => a + t.price, 0);
  const convFee  = Math.round(subtotal * 0.05);
  const taxes    = Math.round(subtotal * 0.18);
  const total    = subtotal + convFee + taxes;
  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const customerName = user?.name || 'Guest';

  // Save to localStorage so My Tickets can show this booking
  useEffect(() => {
    const demoTicket = {
      _id: ticketId.current,
      bookingId: bookingId.current,
      orderId: orderId.current,
      tierName: seats[0]?.type === 'vip' ? 'VIP' : seats[0]?.sectionLabel || 'Standard',
      quantity: seats.length,
      totalAmount: total,
      seats: seats.map((s: any) => ({
        seatNumber: s.seatNumber,
        row: s.row,
        section: s.section,
        sectionLabel: s.sectionLabel,
        type: s.type,
      })),
      qrData: `{"bookingId":"${bookingId.current}","ticketId":"${ticketId.current}","eventId":"${eventData.title}","timestamp":"${bookedAt.current}","qrVerCode":"${qrVerCode.current}"}`,
      checkedIn: false,
      createdAt: bookedAt.current,
      customerName,
      eventId: {
        _id: 'demo',
        title: eventData.title,
        banner: eventData.image,
        date: eventData.rawDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        venue: {
          name: eventData.venue?.split(',')[0] || eventData.venue,
          city: eventData.venue?.split(',')[1]?.trim() || 'India',
        },
        category: eventData.category,
        artistName: eventData.artistName,
      },
    };

    const existing = JSON.parse(localStorage.getItem(DEMO_TICKETS_STORAGE_KEY) || '[]');
    // Avoid duplicates
    const updated = [demoTicket, ...existing.filter((t: any) => t._id !== ticketId.current)];
    localStorage.setItem(DEMO_TICKETS_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Advance stages
  useEffect(() => {
    const s1 = setTimeout(() => setStage(1), 2500); // Processing -> Success
    const s2 = setTimeout(() => setStage(2), 5000); // Success -> Gen Ticket
    const s3 = setTimeout(() => {
      setStage(3);
      setTimeout(() => {
        setToastMessage('Your EventNova ticket has been added to My Tickets. Check your email and WhatsApp.');
        setTimeout(() => setToastMessage(''), 8000);
      }, 1000);
    }, 7000); // Gen Ticket -> Reveal

    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F5] relative font-sans overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#D6D3D1_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.4]" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-[#D6D3D1] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 w-[90%] max-w-md"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#22C55E]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1917] leading-tight">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        
        <AnimatePresence mode="wait">
          
          {/* ── STAGE 0: Processing ─────────────────────────────────── */}
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-8 w-24 h-24">
                <div className="w-24 h-24 border-4 border-[#F5F5F4] rounded-full absolute inset-0" />
                <div className="w-24 h-24 border-4 border-[#A67B5B] rounded-full border-t-transparent animate-spin" />
                <Shield className="w-8 h-8 text-[#A67B5B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-3xl font-black text-[#1C1917] tracking-tight mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Processing Payment...
              </h2>
              <p className="text-[#78716C] font-semibold text-lg animate-pulse">Securing Your Tickets...</p>

              {/* Checklist */}
              <div className="mt-8 flex flex-col gap-2.5 text-left bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm w-full max-w-xs">
                {['Verifying payment', 'Reserving seats', 'Generating ticket'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 + 0.2 }}
                    className="flex items-center gap-3 text-sm font-semibold text-[#57534E]"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.4 + 0.5, type: 'spring', bounce: 0.5 }}
                      className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STAGE 1: Success Reveal ──────────────────────────────── */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <Confetti />
              <div className="relative mb-8">
                <PulsingRings />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                  className="w-28 h-28 bg-[#22C55E] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 relative z-10"
                >
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-4xl font-black text-[#1C1917] tracking-tight mb-3" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  Payment Received Successfully
                </h2>
                <p className="text-[#57534E] font-medium text-lg mb-2">Your booking has been confirmed.</p>
                <p className="text-[#78716C] font-medium text-base mb-8">Thank you for choosing EventNova.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white border border-[#D6D3D1] rounded-2xl p-6 shadow-sm w-full max-w-sm mx-auto text-left space-y-3"
              >
                <div className="flex justify-between">
                  <span className="text-[#78716C] text-sm font-semibold">Payment Received:</span>
                  <span className="text-[#22C55E] text-sm font-black">✓ Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C] text-sm font-semibold">Amount:</span>
                  <span className="text-[#1C1917] text-sm font-black">₹{fmt(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C] text-sm font-semibold">Transaction ID:</span>
                  <span className="text-[#1C1917] text-sm font-bold uppercase">{txnId.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C] text-sm font-semibold">UPI Reference:</span>
                  <span className="text-[#1C1917] text-sm font-bold uppercase">{upiRef.current}</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── STAGE 2: Ticket Generation ───────────────────────────── */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-[#D6D3D1] flex items-center justify-center mb-6 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-[#A67B5B]/10 origin-bottom"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1.5, ease: 'linear' }}
                />
                <QRCodeSVG value="generating" size={40} className="opacity-30 relative z-10" />
              </div>
              <h2 className="text-2xl font-black text-[#1C1917] tracking-tight mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Generating Digital Ticket...
              </h2>
              <div className="space-y-2 mt-4">
                {[
                  { label: 'QR Code Created', delay: 0.2 },
                  { label: 'Seats Reserved', delay: 0.6 },
                  { label: 'Venue Access Activated', delay: 1.0 },
                  { label: 'Ticket Added to My Tickets', delay: 1.4 },
                ].map(({ label, delay }) => (
                  <motion.p
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay }}
                    className="text-[#78716C] font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> {label}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STAGE 3: Full Reveal ─────────────────────────────────── */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full flex flex-col gap-10"
            >
              
              {/* Header Info */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] text-[#22C55E] rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-[#22C55E]/30 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Payment Received · Ready for Event
                </div>
                <h1 className="text-4xl font-black text-[#1C1917] tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  Your Premium Booking is Confirmed
                </h1>
                <p className="text-[#57534E] font-medium text-lg">Present this digital ticket at the venue gates.</p>
              </div>

              {/* ── DIGITAL TICKET CARD ─────────────────────────────────── */}
              <div className="relative mx-auto w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-black/5 overflow-hidden border border-[#D6D3D1]">
                {/* Top Banner Area */}
                <div className="h-64 relative w-full">
                  <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/40 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold tracking-wider uppercase shadow-sm">
                    {eventData.category || 'Live Event'}
                  </div>

                  {/* Ticket ID badge — top right */}
                  <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-mono font-bold tracking-wide">
                    {ticketId.current}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                        {eventData.title}
                      </h2>
                      <div className="flex items-center gap-4 text-white/90 text-sm font-semibold">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#A67B5B]"/> {eventData.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#A67B5B]"/> {eventData.time}</span>
                      </div>
                    </div>
                    {/* Artist avatar inset */}
                    {eventData.artistImage && (
                      <img src={eventData.artistImage} alt="Artist" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xl" />
                    )}
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="p-8">
                  {/* Customer + Venue row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center border border-[#E7E5E4] flex-shrink-0">
                        <User className="w-5 h-5 text-[#A67B5B]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Customer</p>
                        <p className="font-bold text-[#1C1917] text-base leading-tight">{customerName}</p>
                        <p className="text-xs text-[#78716C] font-medium mt-0.5">{eventData.category || 'Ticket Holder'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center border border-[#E7E5E4] flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#A67B5B]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Venue</p>
                        <p className="font-bold text-[#1C1917] text-base leading-tight">{eventData.venue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seat Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#E7E5E4]">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-1">Section</p>
                      <p className="font-black text-[#1C1917] text-lg">{seats[0]?.sectionLabel || seats[0]?.section || 'VIP'}</p>
                    </div>
                    <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#E7E5E4]">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-1">Row</p>
                      <p className="font-black text-[#1C1917] text-lg">{seats[0]?.row || 'A'}</p>
                    </div>
                    <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#E7E5E4]">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-1">Category</p>
                      <p className="font-black text-[#1C1917] text-sm leading-tight">{seats[0]?.type === 'vip' ? 'VIP' : 'Standard'}</p>
                    </div>
                    <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#E7E5E4]">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-1">Seats ({seats.length})</p>
                      <p className="font-black text-[#1C1917] text-sm truncate">{seats.map((s: any) => s.seatNumber).join(', ') || '1'}</p>
                    </div>
                  </div>

                  {/* Booking Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-y border-dashed border-[#D6D3D1] mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-0.5">Booking ID</p>
                      <p className="font-bold text-[#1C1917] text-sm">{bookingId.current}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-0.5">Ticket ID</p>
                      <p className="font-bold text-[#1C1917] text-sm font-mono">{ticketId.current}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-0.5">Amount Paid</p>
                      <p className="font-black text-[#A67B5B] text-base">₹{fmt(total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-0.5">Booked At</p>
                      <p className="font-bold text-[#1C1917] text-xs leading-tight">
                        {new Date(bookedAt.current).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Section (Tear-off stub) */}
                <div className="relative bg-[#F5F5F4] p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t-2 border-dashed border-[#D6D3D1]">
                  {/* Side cutouts to look like a ticket */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#FAF7F5] shadow-inner border border-[#D6D3D1]" />
                  <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#FAF7F5] shadow-inner border border-[#D6D3D1]" />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-[#22C55E]">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Verified Ticket</span>
                    </div>
                    <p className="text-xs font-semibold text-[#78716C] leading-relaxed max-w-xs">
                      Secure QR Authentication. Fraud Protection Enabled. Dynamic Validation Token active. This ticket can only be scanned once.
                    </p>
                    {/* QR Verification Code */}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest">QR Verification Code</p>
                      <p className="font-mono text-xs font-bold text-[#A67B5B] bg-[#FAF7F5] border border-[#E7E5E4] rounded-lg px-3 py-1.5 inline-block">
                        {qrVerCode.current}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#D6D3D1]">
                      <QRCodeSVG 
                        value={`{"bookingId":"${bookingId.current}","ticketId":"${ticketId.current}","eventId":"${eventData.title}","timestamp":"${bookedAt.current}","qrVerCode":"${qrVerCode.current}"}`}
                        size={128}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-[#78716C] text-center">Scan at entry gate</p>
                  </div>
                </div>
              </div>

              {/* ── SMART ACTION BUTTONS ──────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full">
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#D6D3D1] rounded-2xl hover:border-[#A67B5B] hover:shadow-md transition-all text-[#1C1917] group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#A67B5B] group-hover:text-white transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Save PDF</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#D6D3D1] rounded-2xl hover:border-[#A67B5B] hover:shadow-md transition-all text-[#1C1917] group">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Add to Wallet</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#D6D3D1] rounded-2xl hover:border-[#A67B5B] hover:shadow-md transition-all text-[#1C1917] group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#A67B5B] group-hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Share Ticket</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#D6D3D1] rounded-2xl hover:border-[#A67B5B] hover:shadow-md transition-all text-[#1C1917] group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#A67B5B] group-hover:text-white transition-colors">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Get Directions</span>
                </button>
              </div>

              {/* ── VIEW MY TICKETS CTA ─────────────────────────────── */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto w-full">
                <Link
                  href="/my-tickets"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)', color: 'white' }}
                >
                  <Ticket className="w-4 h-4" />
                  View in My Tickets
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1C1917] hover:bg-[#44403C] text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
                >
                  <Home className="w-4 h-4" /> Return to Homepage
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                
                {/* ── ARTIST INFO SECTION ──────────────────────────────── */}
                <div className="bg-white rounded-[24px] p-8 border border-[#D6D3D1] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#A67B5B] opacity-5 rounded-bl-full pointer-events-none" />
                  <h3 className="text-xl font-black text-[#1C1917] mb-6 tracking-tight flex items-center gap-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    <User className="w-5 h-5 text-[#A67B5B]"/> About The Artist
                  </h3>
                  
                  <div className="flex gap-4 mb-6">
                    {eventData.artistImage && (
                      <img src={eventData.artistImage} alt="Artist" className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-[#E7E5E4] flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-[#1C1917] text-lg mb-1">{eventData.artistName || 'The Artist'}</p>
                      <p className="text-xs font-medium text-[#78716C] leading-relaxed line-clamp-3">
                        {eventData.artistBio || 'A globally recognized performer bringing an unforgettable live music experience.'}
                      </p>
                    </div>
                  </div>

                  {eventData.achievements?.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider mb-2">Key Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {eventData.achievements.map((ach: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F5] border border-[#E7E5E4] rounded-lg text-xs font-semibold text-[#57534E]">
                            <Award className="w-3.5 h-3.5 text-[#A67B5B]" /> {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── EVENT INFO SECTION ──────────────────────────────── */}
                <div className="bg-white rounded-[24px] p-8 border border-[#D6D3D1] shadow-sm relative overflow-hidden">
                  <h3 className="text-xl font-black text-[#1C1917] mb-6 tracking-tight flex items-center gap-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    <Info className="w-5 h-5 text-[#A67B5B]"/> Event Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FAF7F5] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#57534E]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1917]">Venue Details & Parking</p>
                        <p className="text-xs font-medium text-[#78716C] mt-0.5 leading-relaxed">Paid parking is available at Gate 4. We recommend arriving 60 mins early.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FAF7F5] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 text-[#57534E]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1917]">Entry Guidelines</p>
                        <p className="text-xs font-medium text-[#78716C] mt-0.5 leading-relaxed">Valid ID required. Only clear bags up to 12"x6"x12" are permitted inside the venue.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FAF7F5] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#57534E]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1917]">Food & Beverage</p>
                        <p className="text-xs font-medium text-[#78716C] mt-0.5 leading-relaxed">Multiple premium food stalls and fully stocked bars available in all concourses.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
