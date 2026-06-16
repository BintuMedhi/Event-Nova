/** ──────────────────────────────────────────────────────────────────────────
 *  StadiumVenueConfig.ts
 *  Configuration for venue section layouts per event type.
 *  SVG viewBox is 800 × 560 for all layouts.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface VenueSection {
  id: string;
  name: string;
  shortName: string;
  /** Tailwind-compatible hex */
  color: string;
  hoverColor: string;
  selectedColor: string;
  textColor: string;
  /** SVG path data (within 800×560 viewBox) */
  path: string;
  /** Label anchor point */
  labelX: number;
  labelY: number;
  basePrice: number;
  maxPrice: number;
  totalSeats: number;
  availableSeats: number;
  /** 1–5 stars */
  popularityScore: number;
  viewRating: number;
  rows: number;
  seatsPerRow: number;
  aiCategory: 'vip' | 'premium' | 'gold' | 'silver' | 'general' | 'corporate' | 'fan';
  description: string;
}

export interface StageConfig {
  path: string;
  labelX: number;
  labelY: number;
  label: string;
}

export interface VenueLayout {
  stage: StageConfig;
  sections: VenueSection[];
  outerBoundary?: string;
}

/* ── Color Palette ──────────────────────────────────────────────────────── */
const COLORS = {
  vip:       { fill: '#B8860B', hover: '#D4A017', selected: '#22C55E', text: '#FFF8DC' },
  premium:   { fill: '#1E3A8A', hover: '#2563EB', selected: '#22C55E', text: '#DBEAFE' },
  gold:      { fill: '#6B21A8', hover: '#9333EA', selected: '#22C55E', text: '#F3E8FF' },
  silver:    { fill: '#0F766E', hover: '#0D9488', selected: '#22C55E', text: '#CCFBF1' },
  general:   { fill: '#374151', hover: '#4B5563', selected: '#22C55E', text: '#F9FAFB' },
  corporate: { fill: '#92400E', hover: '#B45309', selected: '#22C55E', text: '#FEF3C7' },
  fan:       { fill: '#065F46', hover: '#059669', selected: '#22C55E', text: '#D1FAE5' },
};

/* ── Concert / Music Venue Layout ───────────────────────────────────────── */
export const CONCERT_LAYOUT: VenueLayout = {
  stage: {
    path: 'M 268,12 L 532,12 L 560,82 L 240,82 Z',
    labelX: 400,
    labelY: 52,
    label: 'MAIN STAGE',
  },
  sections: [
    {
      id: 'vip-pit',
      name: 'VIP Pit',
      shortName: 'VIP',
      color: COLORS.vip.fill,
      hoverColor: COLORS.vip.hover,
      selectedColor: COLORS.vip.selected,
      textColor: COLORS.vip.text,
      path: 'M 258,88 Q 400,76 542,88 L 530,168 Q 400,180 270,168 Z',
      labelX: 400, labelY: 130,
      basePrice: 4999, maxPrice: 8999,
      totalSeats: 180, availableSeats: 42,
      popularityScore: 5, viewRating: 5,
      rows: 9, seatsPerRow: 20,
      aiCategory: 'vip',
      description: 'Closest to the stage. Standing area with premium bar access.',
    },
    {
      id: 'premium-a',
      name: 'Premium A',
      shortName: 'PRM-A',
      color: COLORS.premium.fill,
      hoverColor: COLORS.premium.hover,
      selectedColor: COLORS.premium.selected,
      textColor: COLORS.premium.text,
      path: 'M 222,90 L 258,90 L 272,168 Q 218,196 172,214 Q 138,172 158,118 Z',
      labelX: 205, labelY: 155,
      basePrice: 3499, maxPrice: 5499,
      totalSeats: 145, availableSeats: 89,
      popularityScore: 4, viewRating: 5,
      rows: 10, seatsPerRow: 15,
      aiCategory: 'premium',
      description: 'Excellent left-angle stage view with covered seating.',
    },
    {
      id: 'premium-b',
      name: 'Premium B',
      shortName: 'PRM-B',
      color: COLORS.premium.fill,
      hoverColor: COLORS.premium.hover,
      selectedColor: COLORS.premium.selected,
      textColor: COLORS.premium.text,
      path: 'M 578,90 L 542,90 L 528,168 Q 582,196 628,214 Q 662,172 642,118 Z',
      labelX: 595, labelY: 155,
      basePrice: 3499, maxPrice: 5499,
      totalSeats: 145, availableSeats: 67,
      popularityScore: 4, viewRating: 5,
      rows: 10, seatsPerRow: 15,
      aiCategory: 'premium',
      description: 'Excellent right-angle stage view with covered seating.',
    },
    {
      id: 'gold-left',
      name: 'Gold Left',
      shortName: 'GLD-L',
      color: COLORS.gold.fill,
      hoverColor: COLORS.gold.hover,
      selectedColor: COLORS.gold.selected,
      textColor: COLORS.gold.text,
      path: 'M 125,112 Q 98,174 118,252 L 168,238 Q 142,178 162,118 Z',
      labelX: 128, labelY: 185,
      basePrice: 2299, maxPrice: 3499,
      totalSeats: 210, availableSeats: 134,
      popularityScore: 3, viewRating: 4,
      rows: 12, seatsPerRow: 18,
      aiCategory: 'gold',
      description: 'Wide left-side view. Great atmosphere and sightlines.',
    },
    {
      id: 'gold-right',
      name: 'Gold Right',
      shortName: 'GLD-R',
      color: COLORS.gold.fill,
      hoverColor: COLORS.gold.hover,
      selectedColor: COLORS.gold.selected,
      textColor: COLORS.gold.text,
      path: 'M 675,112 Q 702,174 682,252 L 632,238 Q 658,178 638,118 Z',
      labelX: 672, labelY: 185,
      basePrice: 2299, maxPrice: 3499,
      totalSeats: 210, availableSeats: 158,
      popularityScore: 3, viewRating: 4,
      rows: 12, seatsPerRow: 18,
      aiCategory: 'gold',
      description: 'Wide right-side view. Great atmosphere and sightlines.',
    },
    {
      id: 'silver-left',
      name: 'Silver Left',
      shortName: 'SLV-L',
      color: COLORS.silver.fill,
      hoverColor: COLORS.silver.hover,
      selectedColor: COLORS.silver.selected,
      textColor: COLORS.silver.text,
      path: 'M 102,258 Q 80,346 108,424 L 182,398 Q 155,330 142,262 Z',
      labelX: 115, labelY: 345,
      basePrice: 1499, maxPrice: 2299,
      totalSeats: 280, availableSeats: 201,
      popularityScore: 3, viewRating: 3,
      rows: 14, seatsPerRow: 20,
      aiCategory: 'silver',
      description: 'Upper left tier with full venue panoramic view.',
    },
    {
      id: 'silver-right',
      name: 'Silver Right',
      shortName: 'SLV-R',
      color: COLORS.silver.fill,
      hoverColor: COLORS.silver.hover,
      selectedColor: COLORS.silver.selected,
      textColor: COLORS.silver.text,
      path: 'M 698,258 Q 720,346 692,424 L 618,398 Q 645,330 658,262 Z',
      labelX: 685, labelY: 345,
      basePrice: 1499, maxPrice: 2299,
      totalSeats: 280, availableSeats: 224,
      popularityScore: 3, viewRating: 3,
      rows: 14, seatsPerRow: 20,
      aiCategory: 'silver',
      description: 'Upper right tier with full venue panoramic view.',
    },
    {
      id: 'general-left',
      name: 'General Left',
      shortName: 'GA-L',
      color: COLORS.general.fill,
      hoverColor: COLORS.general.hover,
      selectedColor: COLORS.general.selected,
      textColor: COLORS.general.text,
      path: 'M 106,430 Q 148,492 212,524 L 272,478 Q 225,454 182,406 Z',
      labelX: 178, labelY: 474,
      basePrice: 799, maxPrice: 1499,
      totalSeats: 340, availableSeats: 290,
      popularityScore: 2, viewRating: 2,
      rows: 15, seatsPerRow: 23,
      aiCategory: 'general',
      description: 'Back-left general seating. Budget-friendly option.',
    },
    {
      id: 'general-center',
      name: 'General Center',
      shortName: 'GA-C',
      color: COLORS.general.fill,
      hoverColor: COLORS.general.hover,
      selectedColor: COLORS.general.selected,
      textColor: COLORS.general.text,
      path: 'M 282,482 L 518,482 Q 532,516 400,532 Q 268,516 282,482 Z',
      labelX: 400, labelY: 508,
      basePrice: 799, maxPrice: 1499,
      totalSeats: 420, availableSeats: 380,
      popularityScore: 2, viewRating: 2,
      rows: 8, seatsPerRow: 53,
      aiCategory: 'general',
      description: 'Back-center general standing area.',
    },
    {
      id: 'general-right',
      name: 'General Right',
      shortName: 'GA-R',
      color: COLORS.general.fill,
      hoverColor: COLORS.general.hover,
      selectedColor: COLORS.general.selected,
      textColor: COLORS.general.text,
      path: 'M 694,430 Q 652,492 588,524 L 528,478 Q 575,454 618,406 Z',
      labelX: 622, labelY: 474,
      basePrice: 799, maxPrice: 1499,
      totalSeats: 340, availableSeats: 312,
      popularityScore: 2, viewRating: 2,
      rows: 15, seatsPerRow: 23,
      aiCategory: 'general',
      description: 'Back-right general seating. Budget-friendly option.',
    },
    {
      id: 'corporate-left',
      name: 'Corporate Lounge',
      shortName: 'CORP-L',
      color: COLORS.corporate.fill,
      hoverColor: COLORS.corporate.hover,
      selectedColor: COLORS.corporate.selected,
      textColor: COLORS.corporate.text,
      path: 'M 28,98 L 118,108 L 100,260 L 20,250 Z',
      labelX: 60, labelY: 182,
      basePrice: 6999, maxPrice: 12999,
      totalSeats: 60, availableSeats: 18,
      popularityScore: 5, viewRating: 4,
      rows: 5, seatsPerRow: 12,
      aiCategory: 'corporate',
      description: 'Exclusive lounge suites with private bar and premium service.',
    },
    {
      id: 'corporate-right',
      name: 'Corporate Suites',
      shortName: 'CORP-R',
      color: COLORS.corporate.fill,
      hoverColor: COLORS.corporate.hover,
      selectedColor: COLORS.corporate.selected,
      textColor: COLORS.corporate.text,
      path: 'M 772,98 L 682,108 L 700,260 L 780,250 Z',
      labelX: 740, labelY: 182,
      basePrice: 6999, maxPrice: 12999,
      totalSeats: 60, availableSeats: 22,
      popularityScore: 5, viewRating: 4,
      rows: 5, seatsPerRow: 12,
      aiCategory: 'corporate',
      description: 'Exclusive suite boxes with private bar and premium service.',
    },
    {
      id: 'fan-zone',
      name: 'Fan Zone',
      shortName: 'FAN',
      color: COLORS.fan.fill,
      hoverColor: COLORS.fan.hover,
      selectedColor: COLORS.fan.selected,
      textColor: COLORS.fan.text,
      path: 'M 218,530 Q 400,548 582,530 L 526,484 Q 400,498 274,484 Z',
      labelX: 400, labelY: 538,
      basePrice: 499, maxPrice: 799,
      totalSeats: 500, availableSeats: 460,
      popularityScore: 3, viewRating: 1,
      rows: 5, seatsPerRow: 100,
      aiCategory: 'fan',
      description: 'Standing fan zone. High energy atmosphere. No assigned seats.',
    },
  ],
};

/* ── Conference / Hall Layout ────────────────────────────────────────────── */
export const CONFERENCE_LAYOUT: VenueLayout = {
  stage: {
    path: 'M 200,20 L 600,20 L 600,80 L 200,80 Z',
    labelX: 400, labelY: 50,
    label: 'CONFERENCE STAGE',
  },
  sections: [
    {
      id: 'front-vip',
      name: 'Front VIP',
      shortName: 'VIP',
      color: COLORS.vip.fill,
      hoverColor: COLORS.vip.hover,
      selectedColor: COLORS.vip.selected,
      textColor: COLORS.vip.text,
      path: 'M 230,85 L 570,85 L 560,200 L 240,200 Z',
      labelX: 400, labelY: 145,
      basePrice: 2999, maxPrice: 5999,
      totalSeats: 120, availableSeats: 45,
      popularityScore: 5, viewRating: 5,
      rows: 6, seatsPerRow: 20,
      aiCategory: 'vip',
      description: 'Front-row VIP seating with direct stage access.',
    },
    {
      id: 'centre-premium',
      name: 'Centre Premium',
      shortName: 'PRM',
      color: COLORS.premium.fill,
      hoverColor: COLORS.premium.hover,
      selectedColor: COLORS.premium.selected,
      textColor: COLORS.premium.text,
      path: 'M 200,205 L 600,205 L 590,360 L 210,360 Z',
      labelX: 400, labelY: 285,
      basePrice: 1999, maxPrice: 2999,
      totalSeats: 280, availableSeats: 180,
      popularityScore: 4, viewRating: 4,
      rows: 10, seatsPerRow: 28,
      aiCategory: 'premium',
      description: 'Centre block with excellent stage visibility.',
    },
    {
      id: 'standard-rear',
      name: 'Standard Rear',
      shortName: 'STD',
      color: COLORS.silver.fill,
      hoverColor: COLORS.silver.hover,
      selectedColor: COLORS.silver.selected,
      textColor: COLORS.silver.text,
      path: 'M 170,365 L 630,365 L 640,490 L 160,490 Z',
      labelX: 400, labelY: 430,
      basePrice: 999, maxPrice: 1999,
      totalSeats: 450, availableSeats: 380,
      popularityScore: 2, viewRating: 2,
      rows: 15, seatsPerRow: 30,
      aiCategory: 'silver',
      description: 'Rear standard seating with full view of the stage.',
    },
    {
      id: 'side-left',
      name: 'Side Left',
      shortName: 'SD-L',
      color: COLORS.gold.fill,
      hoverColor: COLORS.gold.hover,
      selectedColor: COLORS.gold.selected,
      textColor: COLORS.gold.text,
      path: 'M 30,85 L 195,85 L 200,490 L 30,490 Z',
      labelX: 112, labelY: 290,
      basePrice: 1499, maxPrice: 2499,
      totalSeats: 160, availableSeats: 120,
      popularityScore: 3, viewRating: 3,
      rows: 20, seatsPerRow: 8,
      aiCategory: 'gold',
      description: 'Left side seating with angled stage view.',
    },
    {
      id: 'side-right',
      name: 'Side Right',
      shortName: 'SD-R',
      color: COLORS.gold.fill,
      hoverColor: COLORS.gold.hover,
      selectedColor: COLORS.gold.selected,
      textColor: COLORS.gold.text,
      path: 'M 770,85 L 605,85 L 600,490 L 770,490 Z',
      labelX: 688, labelY: 290,
      basePrice: 1499, maxPrice: 2499,
      totalSeats: 160, availableSeats: 138,
      popularityScore: 3, viewRating: 3,
      rows: 20, seatsPerRow: 8,
      aiCategory: 'gold',
      description: 'Right side seating with angled stage view.',
    },
  ],
};

/* ── Layout resolver ─────────────────────────────────────────────────────── */
export function getVenueLayout(category: string): VenueLayout {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('conference') || cat.includes('seminar') || cat.includes('expo')) {
    return CONFERENCE_LAYOUT;
  }
  return CONCERT_LAYOUT;
}
