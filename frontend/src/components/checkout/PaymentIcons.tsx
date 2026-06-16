import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/* ── UPI (NPCI brand) ──────────────────────────────────────────────────── */
export const UpiIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#F7F7F7"/>
    <path d="M10 34L20 14l6 12 4-8 8 16" stroke="#00917A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="26" r="2" fill="#FF6B00"/>
  </svg>
);

/* ── Google Pay ────────────────────────────────────────────────────────── */
export const GPayIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#FAFAFA"/>
    <path d="M35.4 24.6c0-.8-.1-1.6-.2-2.4H24v4.5h6.4c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-5 3.6-8.3z" fill="#4285F4"/>
    <path d="M24 36c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.4 1.1-4.2 1.1-3.2 0-5.9-2.2-6.9-5.1H13.3v2.9C15.3 33.6 19.4 36 24 36z" fill="#34A853"/>
    <path d="M17.1 26.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V19H13.3C12.5 20.5 12 22.2 12 24s.5 3.5 1.3 5l3.8-2.7z" fill="#FBBC04"/>
    <path d="M24 17.9c1.8 0 3.4.6 4.7 1.8l3.5-3.5C30 14.1 27.3 13 24 13c-4.6 0-8.7 2.6-10.7 6.4l3.8 2.9c1-3 3.7-4.4 6.9-4.4z" fill="#EA4335"/>
  </svg>
);

/* ── PhonePe ───────────────────────────────────────────────────────────── */
export const PhonePeIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#5F259F"/>
    <path d="M24 9C16.3 9 10 15.3 10 23s6.3 14 14 14c2.5 0 4.9-.7 6.9-1.9l5 5 2.1-2.1-5-5C34.3 30.9 38 27.3 38 23c0-7.7-6.3-14-14-14zm0 22c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="white"/>
    <circle cx="24" cy="23" r="4" fill="#5F259F"/>
    <circle cx="24" cy="23" r="2" fill="white"/>
  </svg>
);

/* ── Paytm ─────────────────────────────────────────────────────────────── */
export const PaytmIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#00BAF2"/>
    <text x="5" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#00284A" fontStyle="italic">Pay</text>
    <text x="24" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="white" fontStyle="italic">tm</text>
    <rect x="5" y="33" width="36" height="3" rx="1.5" fill="#00284A" opacity="0.3"/>
  </svg>
);

/* ── BHIM UPI ──────────────────────────────────────────────────────────── */
export const BhimIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#00917A"/>
    <text x="6" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="white" letterSpacing="1">BHIM</text>
    <path d="M6 34h36" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
    <text x="6" y="42" fontFamily="Arial, sans-serif" fontSize="8" fill="white" opacity="0.7">UPI</text>
  </svg>
);

/* ── Visa ──────────────────────────────────────────────────────────────── */
export const VisaIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="80" height="48" rx="6" fill="#1A1F71"/>
    <text x="10" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" fill="#F7B600" fontStyle="italic" letterSpacing="1">VISA</text>
  </svg>
);

/* ── Mastercard ────────────────────────────────────────────────────────── */
export const MastercardIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="80" height="48" rx="6" fill="#1A1A1A"/>
    <circle cx="30" cy="24" r="14" fill="#EB001B"/>
    <circle cx="50" cy="24" r="14" fill="#F79E1B" opacity="0.9"/>
    <path d="M40 13.5C43.4 16 46 19.7 46 24s-2.6 8-6 10.5C36.6 32 34 28.3 34 24s2.6-8 6-10.5z" fill="#FF5F00"/>
  </svg>
);

/* ── RuPay ─────────────────────────────────────────────────────────────── */
export const RuPayIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="80" height="48" rx="6" fill="#F2F2F2"/>
    <text x="8" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#F26622">Ru</text>
    <text x="30" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#006EB0">Pay</text>
    <rect x="8" y="34" width="64" height="2" rx="1" fill="url(#rupay-grad)"/>
    <defs>
      <linearGradient id="rupay-grad" x1="0" y1="0" x2="80" y2="0">
        <stop offset="0%" stopColor="#F26622"/>
        <stop offset="100%" stopColor="#006EB0"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── American Express ──────────────────────────────────────────────────── */
export const AmexIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="80" height="48" rx="6" fill="#2E77BC"/>
    <text x="6" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="white" letterSpacing="-0.5">AMERICAN</text>
    <text x="6" y="43" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="white" letterSpacing="4">EXPRESS</text>
  </svg>
);

/* ── Generic Bank ──────────────────────────────────────────────────────── */
export const BankIcon = ({ size = 24, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
  </svg>
);

/* ── Amazon Pay ────────────────────────────────────────────────────────── */
export const AmazonPayIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#FF9900"/>
    <text x="10" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#1A1A1A">amazon</text>
    <text x="10" y="36" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" fill="#1A1A1A">pay</text>
    <path d="M10 24 Q24 30 38 24" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

/* ── MobiKwik ──────────────────────────────────────────────────────────── */
export const MobiKwikIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#1B2A6B"/>
    <circle cx="24" cy="20" r="8" fill="white" opacity="0.15"/>
    <circle cx="24" cy="20" r="5" fill="#00C1E3"/>
    <text x="7" y="40" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="white" letterSpacing="0.5">MobiKwik</text>
  </svg>
);

/* ── Simpl ─────────────────────────────────────────────────────────────── */
export const SimplIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#0D0D0D"/>
    <text x="7" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="white">Simpl</text>
    <circle cx="39" cy="25" r="4" fill="#C8FF00"/>
  </svg>
);

/* ── LazyPay ───────────────────────────────────────────────────────────── */
export const LazyPayIcon = ({ size = 32, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="48" height="48" rx="8" fill="#F4B942"/>
    <text x="5" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="12" fill="#1A1A1A">LazyPay</text>
    <path d="M5 34h38" stroke="#1A1A1A" strokeWidth="1.5" strokeOpacity="0.3"/>
  </svg>
);

/* ── Shield / Security ─────────────────────────────────────────────────── */
export const ShieldIcon = ({ size = 24, className = '', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
