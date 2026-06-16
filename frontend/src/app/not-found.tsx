'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft, Ticket, Compass } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="mesh-bg" />

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-pink/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      <div className="text-center space-y-8 max-w-lg relative z-10">

        {/* 404 Number */}
        <div className="relative">
          <div className="text-[140px] sm:text-[180px] font-black leading-none bg-gradient-to-br from-accent-purple via-accent-pink to-accent-purple bg-clip-text text-transparent select-none opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-panel border border-white/10 rounded-3xl px-8 py-5 flex items-center gap-3 shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl flex items-center justify-center flex-shrink-0">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="font-black text-xl text-text-primary leading-tight">Page Not Found</h1>
                <p className="text-[11px] text-text-muted mt-0.5">This route doesn't exist in EventNova</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-4">
          <p className="text-text-muted text-sm leading-relaxed">
            The page you're looking for might have been moved, deleted, or perhaps you mistyped the URL.
          </p>
          <p className="text-text-muted text-xs">
            Redirecting to home in{' '}
            <span className="text-accent-purple font-bold">{countdown}s</span>...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link
            href="/events"
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-accent-purple/30 hover:bg-white/10 text-text-primary text-sm font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Ticket className="w-4 h-4 text-accent-purple" />
            Browse Events
          </Link>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="pt-4">
          <p className="text-[11px] text-text-muted mb-3 uppercase tracking-wider font-semibold">Popular Pages</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'My Tickets', href: '/my-tickets' },
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'My Profile', href: '/profile' },
              { label: 'Login', href: '/login' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-text-muted hover:text-accent-purple bg-white/5 border border-white/10 hover:border-accent-purple/20 px-3 py-1.5 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
