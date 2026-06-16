'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Mail, Shield, Zap, Heart } from 'lucide-react';

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" fill="currentColor" />
  </svg>
);


const footerLinks = {
  Explore: [
    { label: 'Discover Events', href: '/events' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'My Tickets', href: '/my-tickets' },
    { label: 'My Profile', href: '/profile' },
  ],
  Platform: [
    { label: 'Organizer Dashboard', href: '/organizer/dashboard' },
    { label: 'Affiliate Promoter Hub', href: '/affiliate/dashboard' },
    { label: 'Admin Panel', href: '/admin/dashboard' },
    { label: 'Gate QR Scanner', href: '/organizer/scanner' },
  ],
  Company: [
    { label: 'About EventNova', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
};

const socialLinks = [
  { label: 'Twitter', Icon: Twitter, href: '#' },
  { label: 'Instagram', Icon: Instagram, href: '#' },
  { label: 'LinkedIn', Icon: Linkedin, href: '#' },
  { label: 'YouTube', Icon: Youtube, href: '#' },
];

export const Footer = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <footer className="bg-[#1C1917] text-[#FAF7F5] mt-auto border-t border-[#44403C]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        {/* Massive Branding Row */}
        <div className="mb-20">
          <Link href="/" className="inline-block group">
            <h2 className="text-[12vw] sm:text-9xl font-black tracking-tighter uppercase leading-none text-[#F5F5F4] hover:text-[#A67B5B] transition-colors duration-500" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              EventNova
            </h2>
          </Link>
        </div>

        {/* Four Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-t border-[#44403C] pt-16">

          {/* Column 1: Info & Socials */}
          <div className="space-y-8">
            <p className="text-[#D6D3D1] text-sm leading-relaxed max-w-xs font-medium">
              India's premium event discovery and ticketing platform. Book tickets, promote events, and earn commissions — all in one place.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-[#44403C] flex items-center justify-center text-[#D6D3D1] hover:text-[#FAF7F5] hover:border-[#A67B5B] hover:bg-[#A67B5B] transition-all duration-300"
                >
                  {isMounted && <Icon className="w-4 h-4" />}
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2-4: Nav Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest metadata-text">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[#D6D3D1] hover:text-[#FAF7F5] hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Row */}
        <div className="border-t border-[#44403C] pt-16 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#292524] p-8 md:p-12 rounded-[24px]">
          <div>
            <h4 className="text-2xl font-bold text-[#FAF7F5] tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Stay in the loop</h4>
            <p className="text-[#D6D3D1] text-sm mt-2 max-w-md">Get notified about new events, exclusive early-bird offers, and platform updates.</p>
          </div>
          {isMounted && (
            <form suppressHydrationWarning onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow sm:w-80 bg-[#1C1917] border border-[#44403C] rounded-full px-6 py-4 text-sm text-[#FAF7F5] outline-none placeholder:text-[#78716C] focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#A67B5B] to-[#D4956A] text-white text-sm font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#44403C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#78716C] uppercase tracking-widest font-semibold">
            © 2026 EVENTNOVA INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 text-xs text-[#78716C] font-semibold uppercase tracking-widest">
              {isMounted && <Shield className="w-4 h-4 text-[#A67B5B]" />} PCI-DSS
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-[#78716C] font-semibold uppercase tracking-widest">
              {isMounted && <Mail className="w-4 h-4 text-[#A67B5B]" />} SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
