'use client';

import React, {
  useState, useEffect, useCallback, useMemo, useRef, useReducer,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  ZoomIn, ZoomOut, Maximize2, Sparkles, ArrowLeft, X,
  Star, Users, MapPin, Ticket, Info, ChevronRight,
} from 'lucide-react';
import { type VenueSection, getVenueLayout } from '@/data/StadiumVenueConfig';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════════════════════════════ */
export interface Seat {
  _id: string;
  section: string;
  sectionLabel: string;
  row: string;
  seatNumber: number;
  status: 'available' | 'locked' | 'booked';
  lockedBy: string | null;
  type: 'standard' | 'vip' | 'accessible' | 'premium';
  price: number;
  x: number;
  y: number;
  distanceFromStage: number;
  viewQualityScore: number;
}

export interface InteractiveSeatMapProps {
  eventId: string;
  eventCategory?: string;
  onSelectionChange: (seats: Seat[]) => void;
  maxSelection?: number;
}

type ViewState = 'overview' | 'section';

type AiMode = 'none' | 'best_view' | 'best_value' | 'closest' | 'premium' | 'group';

interface PanState { x: number; y: number }
interface ZoomPanState { zoom: number; pan: PanState }

/* ═══════════════════════════════════════════════════════════════════════════
   Generate local seats for a section (used as fallback / local state)
════════════════════════════════════════════════════════════════════════════ */
function generateSectionSeats(section: VenueSection, socketId: string): Seat[] {
  const seats: Seat[] = [];
  const bookedChance = 1 - section.availableSeats / section.totalSeats;
  let idx = 0;
  for (let r = 0; r < section.rows; r++) {
    const rowLabel = String.fromCharCode(65 + r); // A, B, C…
    for (let s = 0; s < section.seatsPerRow; s++) {
      idx++;
      const rand = Math.random();
      const status: Seat['status'] =
        rand < bookedChance * 0.7
          ? 'booked'
          : rand < bookedChance
          ? 'locked'
          : 'available';
      seats.push({
        _id: `${section.id}-${rowLabel}-${s + 1}`,
        section: section.id,
        sectionLabel: section.name,
        row: rowLabel,
        seatNumber: s + 1,
        status,
        lockedBy: status === 'locked' ? 'other-user' : null,
        type: section.aiCategory === 'vip' ? 'vip' : 'standard',
        price: Math.round(
          section.basePrice + ((section.maxPrice - section.basePrice) * (1 - r / section.rows))
        ),
        x: 0,
        y: 0,
        distanceFromStage: r * 3 + 5,
        viewQualityScore: Math.max(10, 100 - r * 6 - Math.abs(s - section.seatsPerRow / 2) * 2),
      });
    }
  }
  return seats;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Star Rating Component
════════════════════════════════════════════════════════════════════════════ */
function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < score ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════════════════════════════ */
export const InteractiveSeatMap: React.FC<InteractiveSeatMapProps> = ({
  eventId,
  eventCategory = 'Music',
  onSelectionChange,
  maxSelection = 10,
}) => {
  /* ── State ────────────────────────────────────────────────────────────── */
  const [view, setView] = useState<ViewState>('overview');
  const [activeSection, setActiveSection] = useState<VenueSection | null>(null);
  const [sectionSeats, setSectionSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>('none');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiReasonText, setAiReasonText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState('');

  /* ── Zoom / Pan ───────────────────────────────────────────────────────── */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef<PanState>({ x: 0, y: 0 });
  const panVelocity = useRef<PanState>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  /* ── Venue layout ─────────────────────────────────────────────────────── */
  const layout = useMemo(() => getVenueLayout(eventCategory), [eventCategory]);
  const sections = layout.sections;
  const stage = layout.stage;

  /* ── AI-recommended sections ──────────────────────────────────────────── */
  const aiRecommendedSectionIds = useMemo<Set<string>>(() => {
    if (aiMode === 'none') return new Set();
    const scored = sections.map((sec) => {
      let score = 0;
      if (aiMode === 'best_view') score = sec.viewRating * 20 + sec.popularityScore * 10;
      if (aiMode === 'best_value') score = (sec.viewRating / (sec.basePrice / 1000)) * 20;
      if (aiMode === 'closest') score = 100 - sec.basePrice / 200;
      if (aiMode === 'premium') score = sec.basePrice / 100 + sec.popularityScore * 5;
      if (aiMode === 'group') score = sec.availableSeats / 50 + sec.viewRating * 5;
      return { id: sec.id, score };
    });
    const top = scored.sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.id);
    return new Set(top);
  }, [aiMode, sections]);

  /* ── AI-recommended individual seats ─────────────────────────────────── */
  const aiRecommendedSeatIds = useMemo<Set<string>>(() => {
    if (aiMode === 'none' || !sectionSeats.length) return new Set();
    const available = sectionSeats.filter((s) => s.status === 'available');
    let sorted = [...available];
    if (aiMode === 'best_view') sorted.sort((a, b) => b.viewQualityScore - a.viewQualityScore);
    if (aiMode === 'closest') sorted.sort((a, b) => a.distanceFromStage - b.distanceFromStage);
    if (aiMode === 'best_value') sorted.sort((a, b) => (b.viewQualityScore / b.price) - (a.viewQualityScore / a.price));
    if (aiMode === 'premium') sorted.sort((a, b) => b.price - a.price);
    if (aiMode === 'group') sorted.sort((a, b) => parseInt(a.row) - parseInt(b.row) || a.seatNumber - b.seatNumber);
    return new Set(sorted.slice(0, 8).map((s) => s._id));
  }, [aiMode, sectionSeats]);

  /* ── WebSocket ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.on('connect', () => {
      setSocketId(s.id as string);
      s.emit('joinEvent', eventId);
    });
    s.on('seatStatusChanged', (data: { seatId: string; status: Seat['status']; lockedBy: string | null }) => {
      setSectionSeats((prev) =>
        prev.map((seat) =>
          seat._id === data.seatId
            ? { ...seat, status: data.status, lockedBy: data.lockedBy }
            : seat,
        ),
      );
    });
    return () => { s.disconnect(); };
  }, [eventId]);

  /* ── Selection callback ───────────────────────────────────────────────── */
  useEffect(() => {
    onSelectionChange(sectionSeats.filter((s) => selectedSeatIds.has(s._id)));
  }, [selectedSeatIds, sectionSeats, onSelectionChange]);

  /* ── Section click → Level 2 ──────────────────────────────────────────── */
  const handleSectionClick = useCallback((section: VenueSection) => {
    const generated = generateSectionSeats(section, socketId);
    setSectionSeats(generated);
    setActiveSection(section);
    setView('section');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [socketId]);

  /* ── Back to overview ─────────────────────────────────────────────────── */
  const handleBack = useCallback(() => {
    setView('overview');
    setActiveSection(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ── Seat click ───────────────────────────────────────────────────────── */
  const handleSeatClick = useCallback(async (seat: Seat) => {
    if (seat.status === 'booked' || (seat.status === 'locked' && seat.lockedBy !== socketId)) return;

    if (selectedSeatIds.has(seat._id)) {
      // Deselect
      try {
        await fetch(`http://localhost:5000/api/seats/${eventId}/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatId: seat._id, socketId }),
        });
      } catch { /* noop */ }
      setSelectedSeatIds((prev) => { const n = new Set(prev); n.delete(seat._id); return n; });
    } else {
      if (selectedSeatIds.size >= maxSelection) return;
      try {
        const res = await fetch(`http://localhost:5000/api/seats/${eventId}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatId: seat._id, socketId }),
        });
        const data = await res.json();
        if (data.success || true) { // local optimistic
          setSelectedSeatIds((prev) => new Set([...prev, seat._id]));
        }
      } catch {
        setSelectedSeatIds((prev) => new Set([...prev, seat._id]));
      }
    }
  }, [selectedSeatIds, socketId, eventId, maxSelection]);

  /* ── Zoom handlers ────────────────────────────────────────────────────── */
  const clampZoom = (z: number) => Math.min(2.5, Math.max(1, z));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => clampZoom(z - e.deltaY * 0.001));
  }, []);

  /* ── Pan handlers ─────────────────────────────────────────────────────── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    panVelocity.current = { x: 0, y: 0 };
    cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    panVelocity.current = { x: dx, y: dy };
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    // Momentum scroll
    let vx = panVelocity.current.x * 0.85;
    let vy = panVelocity.current.y * 0.85;
    const animate = () => {
      if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) return;
      setPan((p) => ({ x: p.x + vx, y: p.y + vy }));
      vx *= 0.88;
      vy *= 0.88;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Touch pinch zoom ─────────────────────────────────────────────────── */
  const lastTouchDist = useRef<number | null>(null);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) {
        const delta = dist - lastTouchDist.current;
        setZoom((z) => clampZoom(z + delta * 0.005));
      }
      lastTouchDist.current = dist;
    }
  }, []);
  const handleTouchEnd = useCallback(() => { lastTouchDist.current = null; }, []);

  /* ── AI Mode select ───────────────────────────────────────────────────── */
  const AI_MODES: { key: AiMode; label: string; reason: string }[] = [
    { key: 'best_view', label: '👁 Best View', reason: 'Sections with the highest stage visibility scores and unobstructed sightlines.' },
    { key: 'best_value', label: '💰 Best Value', reason: 'Optimal balance of view quality relative to ticket price. Great bang for the buck.' },
    { key: 'closest', label: '🎤 Closest to Stage', reason: 'Front sections with minimum distance from performers. Feel the energy.' },
    { key: 'premium', label: '✨ Premium Experience', reason: 'Top-tier seating with premium amenities, exclusivity and the best views.' },
    { key: 'group', label: '👥 Group Friendly', reason: 'Sections with the most consecutive available seats for groups and families.' },
  ];

  const handleAiModeSelect = (mode: AiMode) => {
    setAiMode(mode);
    const found = AI_MODES.find((m) => m.key === mode);
    setAiReasonText(found?.reason || '');
    setAiPanelOpen(false);
  };

  /* ── Selected seats info ──────────────────────────────────────────────── */
  const selectedSeats = sectionSeats.filter((s) => selectedSeatIds.has(s._id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const taxes = Math.round(totalPrice * 0.18);
  const platformFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes + platformFee;

  /* ── Minimap viewport box ─────────────────────────────────────────────── */
  const minimapW = 140, minimapH = 90;
  const svgW = 800, svgH = 560;
  const vpW = Math.min(minimapW, minimapW / zoom);
  const vpH = Math.min(minimapH, minimapH / zoom);
  const vpX = minimapW / 2 - pan.x * (minimapW / svgW) / zoom - vpW / 2;
  const vpY = minimapH / 2 - pan.y * (minimapH / svgH) / zoom - vpH / 2;

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="w-full flex flex-col xl:flex-row gap-5">

      {/* ── MAP AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative rounded-3xl overflow-hidden bg-[#0A0E1A] border border-white/10 shadow-2xl"
        style={{ minHeight: 580 }}>

        {/* Top toolbar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3
          bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            {view === 'section' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20
                  text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Venue Map
              </button>
            )}
            {activeSection && (
              <span className="text-white/70 text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                {activeSection.name}
                <ChevronRight className="inline w-3 h-3 mx-1 opacity-50" />
                Select your seats
              </span>
            )}
          </div>

          {/* AI Button */}
          <div className="pointer-events-auto relative">
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all backdrop-blur-md shadow-lg
                ${aiMode !== 'none'
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ✨ AI Seat Finder
              {aiMode !== 'none' && (
                <button onClick={(e) => { e.stopPropagation(); setAiMode('none'); setAiReasonText(''); }}
                  className="ml-1 p-0.5 rounded-full hover:bg-amber-500/30">
                  <X className="w-3 h-3" />
                </button>
              )}
            </button>

            {/* AI Panel dropdown */}
            <AnimatePresence>
              {aiPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#0F1623]/95 backdrop-blur-xl
                    border border-white/10 rounded-2xl shadow-2xl p-3 z-50"
                >
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 pb-2">
                    AI Recommendation Mode
                  </p>
                  {AI_MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handleAiModeSelect(m.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1
                        ${aiMode === m.key
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI reason banner */}
        <AnimatePresence>
          {aiReasonText && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5
                bg-amber-500/15 backdrop-blur-md border border-amber-400/30 rounded-2xl"
            >
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-200 text-xs font-medium">{aiReasonText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LEVEL 1: VENUE OVERVIEW ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full h-full"
              style={{ minHeight: 580 }}
            >
              <div
                ref={mapContainerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                style={{ minHeight: 580 }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <svg
                  viewBox="0 0 800 560"
                  className="w-full h-full"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center center',
                    transition: isPanning.current ? 'none' : 'transform 0.05s linear',
                  }}
                >
                  {/* Background radial gradient */}
                  <defs>
                    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#141B2E" />
                      <stop offset="100%" stopColor="#08080F" />
                    </radialGradient>
                    <filter id="sectionGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="aiGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <rect width="800" height="560" fill="url(#bgGrad)" />

                  {/* Subtle grid lines */}
                  <g opacity="0.04">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 53} y1="0" x2={i * 53} y2="560" stroke="white" strokeWidth="1" />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="white" strokeWidth="1" />
                    ))}
                  </g>

                  {/* ── STAGE ──────────────────────────────────────────── */}
                  <g>
                    <path d={stage.path} fill="#1A1F35" stroke="#4F6BFF" strokeWidth="2" />
                    {/* Stage glow */}
                    <path d={stage.path} fill="none" stroke="#4F6BFF" strokeWidth="6" opacity="0.15"
                      filter="url(#sectionGlow)" />
                    {/* Stage lights */}
                    {[290, 340, 390, 440, 490, 540].map((x, i) => (
                      <circle key={i} cx={x} cy={28} r="4"
                        fill={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BF5', '#FFD93D'][i]}
                        opacity="0.9" />
                    ))}
                    <text x={stage.labelX} y={stage.labelY} fill="#A0B4FF" fontSize="13"
                      fontWeight="800" textAnchor="middle" letterSpacing="3"
                      style={{ fontFamily: 'inherit' }}>
                      {stage.label}
                    </text>
                  </g>

                  {/* ── SECTIONS ───────────────────────────────────────── */}
                  {sections.map((sec) => {
                    const isHovered = hoveredSectionId === sec.id;
                    const isAiRec = aiRecommendedSectionIds.has(sec.id);
                    const isSoldOut = sec.availableSeats === 0;

                    return (
                      <g
                        key={sec.id}
                        onClick={() => !isSoldOut && handleSectionClick(sec)}
                        onMouseEnter={() => setHoveredSectionId(sec.id)}
                        onMouseLeave={() => setHoveredSectionId(null)}
                        className={isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'}
                      >
                        {/* AI Glow ring */}
                        {isAiRec && (
                          <path
                            d={sec.path}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="8"
                            opacity="0.4"
                            filter="url(#aiGlow)"
                          />
                        )}
                        {/* Section fill */}
                        <path
                          d={sec.path}
                          fill={isSoldOut ? '#1F2937' : isHovered ? sec.hoverColor : sec.color}
                          opacity={isSoldOut ? 0.4 : isHovered ? 1 : 0.85}
                          stroke={isAiRec ? '#F59E0B' : isHovered ? 'white' : 'transparent'}
                          strokeWidth={isAiRec ? 2.5 : 1.5}
                          style={{ transition: 'all 0.2s ease', filter: isHovered ? 'brightness(1.2)' : 'none' }}
                        />
                        {/* AI badge */}
                        {isAiRec && (
                          <circle cx={sec.labelX + 22} cy={sec.labelY - 14} r="8" fill="#F59E0B" />
                        )}
                        {isAiRec && (
                          <text x={sec.labelX + 22} y={sec.labelY - 10} fill="white" fontSize="9"
                            fontWeight="900" textAnchor="middle">✦</text>
                        )}
                        {/* Section name label */}
                        <text
                          x={sec.labelX}
                          y={sec.labelY - 6}
                          fill="white"
                          fontSize="10"
                          fontWeight="800"
                          textAnchor="middle"
                          opacity={isSoldOut ? 0.4 : 0.95}
                          style={{ pointerEvents: 'none', letterSpacing: 0.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                        >
                          {sec.shortName}
                        </text>
                        {/* Price label */}
                        <text
                          x={sec.labelX}
                          y={sec.labelY + 8}
                          fill="white"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                          opacity={isSoldOut ? 0.3 : 0.75}
                          style={{ pointerEvents: 'none' }}
                        >
                          {isSoldOut ? 'SOLD OUT' : `₹${sec.basePrice.toLocaleString()}`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Main Entrance indicator */}
                  <g>
                    <line x1="360" y1="548" x2="440" y2="548" stroke="white" strokeWidth="3"
                      strokeLinecap="round" opacity="0.3" />
                    <text x="400" y="556" fill="white" fontSize="8" fontWeight="700"
                      textAnchor="middle" opacity="0.3" letterSpacing="2">ENTRANCE</text>
                  </g>
                </svg>
              </div>

              {/* ── HOVER TOOLTIP ──────────────────────────────────────── */}
              <AnimatePresence>
                {hoveredSectionId && (() => {
                  const sec = sections.find((s) => s.id === hoveredSectionId);
                  if (!sec) return null;
                  const availPct = sec.availableSeats / sec.totalSeats;
                  return (
                    <motion.div
                      key="tooltip"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 bottom-24 -translate-x-1/2 z-30 w-72
                        bg-[#0F1623]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl
                        pointer-events-none"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest mb-1"
                            style={{ color: sec.hoverColor }}>
                            {sec.aiCategory.toUpperCase()}
                          </div>
                          <div className="text-white font-bold text-lg leading-tight">{sec.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-black text-xl">₹{sec.basePrice.toLocaleString()}</div>
                          <div className="text-white/40 text-[10px] font-medium">onwards</div>
                        </div>
                      </div>
                      <p className="text-white/50 text-[11px] font-medium mb-3 leading-relaxed">{sec.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-white/60 text-[11px] font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {sec.availableSeats} available
                        </div>
                        <StarRating score={sec.viewRating} />
                      </div>
                      {/* Availability bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(1 - availPct) * 100}%`,
                            backgroundColor: availPct < 0.2 ? '#EF4444' : availPct < 0.5 ? '#F59E0B' : '#22C55E',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-white/30 font-medium">
                          {Math.round((1 - availPct) * 100)}% sold
                        </span>
                        <span className="text-[10px] text-white/50 font-semibold">
                          Click to select seats →
                        </span>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── LEVEL 2: SECTION SEAT DETAIL ─────────────────────────── */}
          {view === 'section' && activeSection && (
            <motion.div
              key="section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full h-full overflow-auto pt-16 pb-6 px-4"
              style={{ minHeight: 580 }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  <h3 className="text-white font-black text-xl">{activeSection.name}</h3>
                  <p className="text-white/40 text-xs font-medium mt-0.5">
                    {activeSection.rows} rows · {activeSection.seatsPerRow} seats per row
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span className="text-white/50 text-[10px] font-semibold">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400 ring-2 ring-emerald-300" />
                    <span className="text-white/50 text-[10px] font-semibold">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-amber-400" />
                    <span className="text-white/50 text-[10px] font-semibold">AI Pick</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-white/10" />
                    <span className="text-white/50 text-[10px] font-semibold">Taken</span>
                  </div>
                </div>
              </div>

              {/* Stage reference bar */}
              <div className="w-full h-8 rounded-xl mb-6 flex items-center justify-center text-[10px]
                font-black tracking-widest text-blue-300 border border-blue-500/30 bg-blue-900/20">
                ▲ STAGE
              </div>

              {/* Seats grid per row */}
              <div className="space-y-2 overflow-x-auto">
                {Array.from({ length: activeSection.rows }).map((_, ri) => {
                  const rowLabel = String.fromCharCode(65 + ri);
                  const rowSeats = sectionSeats.filter((s) => s.row === rowLabel);
                  return (
                    <div key={rowLabel} className="flex items-center gap-1.5 min-w-max mx-auto">
                      {/* Row label */}
                      <span className="w-6 text-[10px] font-bold text-white/30 text-center flex-shrink-0">
                        {rowLabel}
                      </span>
                      {/* Seats */}
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.has(seat._id);
                        const isTaken = seat.status === 'booked' || (seat.status === 'locked' && seat.lockedBy !== socketId);
                        const isAiPick = aiRecommendedSeatIds.has(seat._id);
                        const isHov = hoveredSeat?._id === seat._id;

                        let bg = activeSection.color + 'CC';
                        if (isTaken) bg = '#1F2937';
                        if (isAiPick && !isSelected) bg = '#92400E';
                        if (isSelected) bg = '#059669';

                        return (
                          <button
                            key={seat._id}
                            disabled={isTaken}
                            onClick={() => handleSeatClick(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            title={`Row ${seat.row} · Seat ${seat.seatNumber} · ₹${seat.price}`}
                            className={`w-7 h-7 rounded-md flex-shrink-0 transition-all duration-150 border
                              ${isTaken ? 'opacity-25 cursor-not-allowed border-transparent' : 'cursor-pointer'}
                              ${isSelected ? 'scale-110 shadow-lg shadow-green-500/40 border-green-300/60' : ''}
                              ${isAiPick && !isSelected ? 'border-amber-400/60 animate-pulse' : ''}
                              ${!isTaken && !isSelected && !isAiPick ? 'border-white/10 hover:scale-110 hover:border-white/30' : ''}
                            `}
                            style={{ backgroundColor: bg }}
                          />
                        );
                      })}
                      {/* Row price hint (every 3rd row) */}
                      {ri % 3 === 0 && rowSeats.length > 0 && (
                        <span className="text-[9px] font-semibold text-white/20 ml-1 flex-shrink-0">
                          ₹{rowSeats[0]?.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hover seat tooltip */}
              <AnimatePresence>
                {hoveredSeat && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-[#0F1623]/95 backdrop-blur-xl
                      border border-white/10 rounded-xl px-4 py-3 shadow-2xl pointer-events-none"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-white font-bold text-sm">
                          Row {hoveredSeat.row} · Seat {hoveredSeat.seatNumber}
                        </div>
                        <div className="text-white/40 text-[10px] font-medium mt-0.5">
                          View score: {hoveredSeat.viewQualityScore}/100 · {hoveredSeat.distanceFromStage}ft from stage
                        </div>
                      </div>
                      <div className="text-xl font-black text-white">₹{hoveredSeat.price.toLocaleString()}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ZOOM CONTROLS ─────────────────────────────────────────────── */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5
          bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl">
          <button onClick={() => setZoom((z) => clampZoom(z + 0.2))}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors group">
            <ZoomIn className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
          <div className="text-[9px] text-white/30 text-center font-mono font-bold">
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom((z) => clampZoom(z - 0.2))}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors group">
            <ZoomOut className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
          <div className="w-full h-px bg-white/10 my-0.5" />
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors group">
            <Maximize2 className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
        </div>

        {/* ── MINI MAP (overview only) ───────────────────────────────────── */}
        {view === 'overview' && (
          <div className="absolute bottom-6 left-6 z-20 bg-black/70 backdrop-blur-md
            border border-white/10 rounded-xl overflow-hidden shadow-xl"
            style={{ width: minimapW, height: minimapH }}>
            <svg viewBox="0 0 800 560" width={minimapW} height={minimapH}>
              <rect width="800" height="560" fill="#08080F" />
              <path d={stage.path} fill="#1A1F35" />
              {sections.map((sec) => (
                <path key={sec.id} d={sec.path} fill={sec.color} opacity="0.7" />
              ))}
              {/* Viewport indicator */}
              <rect
                x={Math.max(0, Math.min(vpX, minimapW - vpW)) * (800 / minimapW)}
                y={Math.max(0, Math.min(vpY, minimapH - vpH)) * (560 / minimapH)}
                width={vpW * (800 / minimapW)}
                height={vpH * (560 / minimapH)}
                fill="none"
                stroke="white"
                strokeWidth="8"
                opacity="0.4"
              />
            </svg>
          </div>
        )}

        {/* Section cards row (bottom of overview) */}
        {view === 'overview' && (
          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {sections.slice(0, 6).map((sec) => {
                const isSoldOut = sec.availableSeats === 0;
                return (
                  <button
                    key={sec.id}
                    onClick={() => !isSoldOut && handleSectionClick(sec)}
                    disabled={isSoldOut}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-left
                      transition-all backdrop-blur-md text-xs
                      ${isSoldOut
                        ? 'bg-white/3 border-white/5 opacity-40 cursor-not-allowed'
                        : 'bg-white/8 border-white/10 hover:bg-white/15 hover:border-white/20 cursor-pointer'
                      }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                    <div>
                      <div className="font-bold text-white text-[11px]">{sec.shortName}</div>
                      <div className="text-white/40 text-[9px] font-medium">
                        {isSoldOut ? 'Sold Out' : `₹${sec.basePrice.toLocaleString()}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── BOOKING SIDEBAR ───────────────────────────────────────────────── */}
      <div className="w-full xl:w-80 flex flex-col gap-4 xl:sticky xl:top-28 xl:self-start">

        {/* Section info card */}
        {activeSection && view === 'section' ? (
          <div className="rounded-2xl p-5 border border-white/10 bg-[#0A0E1A] shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeSection.color }} />
              <span className="text-white font-bold text-sm">{activeSection.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1">Price from</div>
                <div className="text-white font-black text-lg">₹{activeSection.basePrice.toLocaleString()}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1">Available</div>
                <div className="text-white font-black text-lg">{activeSection.availableSeats}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-white/40 text-[10px] font-semibold">View quality:</span>
              <StarRating score={activeSection.viewRating} />
            </div>
          </div>
        ) : (
          /* Venue legend card (overview) */
          <div className="rounded-2xl p-5 border border-white/10 bg-[#0A0E1A] shadow-xl">
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">Venue Sections</h4>
            <div className="space-y-2.5">
              {sections.slice(0, 8).map((sec) => (
                <div key={sec.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: sec.color }} />
                    <span className="text-white/70 text-xs font-semibold">{sec.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/50 text-[11px] font-bold">
                      ₹{sec.basePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected seats summary */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0E1A] shadow-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3">Your Selection</h4>

            {selectedSeats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Ticket className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-white/25 text-xs font-semibold">
                  {view === 'overview' ? 'Select a section to begin' : 'Click seats to select them'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedSeats.map((seat) => (
                  <div key={seat._id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <div>
                      <span className="text-white text-xs font-bold">Row {seat.row} · #{seat.seatNumber}</span>
                      <span className="text-white/30 text-[10px] font-medium ml-2">{seat.sectionLabel}</span>
                    </div>
                    <span className="text-white/70 text-xs font-bold">₹{seat.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSeats.length > 0 && (
            <div className="px-5 pb-5 pt-3 border-t border-white/5">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[11px] font-semibold text-white/50">
                  <span>{selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''}</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-white/50">
                  <span>Platform Fee (5%)</span>
                  <span>₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-white/50">
                  <span>GST (18%)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-white/70 text-xs font-bold">Total</span>
                  <span className="text-white font-black text-2xl">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 active:scale-95">
                Proceed to Checkout →
              </button>
            </div>
          )}
        </div>

        {/* AI info card */}
        {aiMode !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border border-amber-500/20 bg-amber-900/10 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold">AI Recommending</span>
            </div>
            <p className="text-amber-200/60 text-[11px] font-medium leading-relaxed">{aiReasonText}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
