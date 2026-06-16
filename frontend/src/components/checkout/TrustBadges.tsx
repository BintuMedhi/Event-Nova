'use client';

import React from 'react';
import { ShieldCheck, Lock, RefreshCw, Award } from 'lucide-react';

export const TrustBadges = () => (
  <div className="mt-6 pt-8 border-t border-[#F5F5F4]">
    <p className="text-center text-xs font-bold text-[#1C1917] mb-8" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
      Trusted & Secure Checkout
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {[
        {
          icon: <ShieldCheck className="w-7 h-7 text-[#A67B5B]" />,
          label: '100% Secure',
          desc: 'SSL encrypted',
        },
        {
          icon: <Lock className="w-7 h-7 text-[#A67B5B]" />,
          label: '256-bit Crypto',
          desc: 'Bank-grade security',
        },
        {
          icon: <RefreshCw className="w-7 h-7 text-[#A67B5B]" />,
          label: 'Instant Refunds',
          desc: 'Back in 5-7 days',
        },
        {
          icon: <Award className="w-7 h-7 text-[#A67B5B]" />,
          label: 'PCI DSS',
          desc: 'Level 1 certified',
        },
      ].map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center text-center gap-2.5 p-5 bg-[#FAF7F5] rounded-[20px] hover:bg-[#F5EDE5]/30 transition-colors border border-[#F5F5F4]"
        >
          {b.icon}
          <p className="text-sm font-bold text-[#1C1917] leading-tight mt-1">{b.label}</p>
          <p className="text-[11px] text-[#78716C] font-medium">{b.desc}</p>
        </div>
      ))}
    </div>

    {/* Payment partner logos row */}
    <div className="flex flex-wrap items-center justify-center gap-8 mt-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
      {['RazorPay', 'PayU', 'Stripe', 'Juspay', 'NPCI'].map((name) => (
        <span key={name} className="text-xl font-black text-[#57534E] tracking-tighter" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {name}
        </span>
      ))}
    </div>
  </div>
);
