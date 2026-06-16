'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  Calendar, User as UserIcon, LogOut, Menu, X, BarChart2, Ticket, Award,
  ChevronDown, Settings, Shield, Map, Sparkles, Zap
} from 'lucide-react';

// ── Avatar Dropdown ───────────────────────────────────────────────────────────
function AvatarDropdown({ user, logout }: { user: any; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'My Profile', icon: UserIcon, href: '/profile' },
    { label: 'My Tickets', icon: Ticket, href: '/my-tickets' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Panel', icon: Shield, href: '/admin/dashboard' }] : []),
    ...(user?.role === 'organizer' ? [{ label: 'Organizer Dashboard', icon: BarChart2, href: '/organizer/dashboard' }] : []),
    ...(user?.role === 'affiliate' ? [{ label: 'Promoter Hub', icon: Award, href: '/affiliate/dashboard' }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#D6D3D1] hover:border-[#A67B5B] bg-white hover:bg-[#FAF7F5] transition-all duration-300 shadow-sm cursor-pointer group"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-[#1C1917] leading-none">{user.name}</span>
          <span className="text-[9px] text-[#57534E] uppercase tracking-wider font-medium mt-0.5">{user.role}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#57534E] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-60 bg-white border border-[#D6D3D1] rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-down">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#F5F5F4] bg-[#FAF7F5]">
            <p className="text-sm font-semibold text-[#1C1917]">{user.name}</p>
            <p className="text-xs text-[#57534E] truncate mt-0.5">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="p-2 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => { router.push(item.href); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition-all duration-200 cursor-pointer text-left"
                >
                  <Icon className="w-4 h-4 text-[#A67B5B]" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-[#F5F5F4]">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-red-50 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'text-[#A67B5B] font-semibold'
        : 'text-[#57534E] hover:text-[#1C1917]'
    }`;

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: '80px',
        background: scrolled ? 'rgba(250, 247, 245, 0.92)' : 'rgba(250, 247, 245, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E7E5E4',
        boxShadow: scrolled ? '0 4px 24px rgba(28,25,23,0.06)' : 'none',
      }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)', boxShadow: '0 4px 12px rgba(166,123,91,0.3)' }}
          >
            <Calendar className="w-4.5 h-4.5 text-white" />
          </div>
          <span
            className="text-xl font-black tracking-tight text-[#1C1917]"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: '-0.04em' }}
          >
            EventNova
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={navLinkClass('/')}>Home</Link>
          <Link href="/events" className={navLinkClass('/events')}>Discover</Link>

          <Link href="/leaderboard" className={navLinkClass('/leaderboard')}>Leaderboard</Link>

          {user?.role === 'organizer' && (
            <Link href="/organizer/dashboard" className={`flex items-center gap-1.5 ${navLinkClass('/organizer/dashboard')}`}>
              <BarChart2 className="w-3.5 h-3.5" /> Dashboard
            </Link>
          )}
          {user?.role === 'affiliate' && (
            <Link href="/affiliate/dashboard" className={`flex items-center gap-1.5 ${navLinkClass('/affiliate/dashboard')}`}>
              <Award className="w-3.5 h-3.5" /> Promoter Hub
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className={`flex items-center gap-1.5 ${navLinkClass('/admin/dashboard')}`}>
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
          {user?.role === 'user' && (
            <Link href="/my-tickets" className={`flex items-center gap-1.5 ${navLinkClass('/my-tickets')}`}>
              <Ticket className="w-3.5 h-3.5" /> My Tickets
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <AvatarDropdown user={user} logout={logout} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #D4956A 100%)', boxShadow: '0 4px 16px rgba(166,123,91,0.3)' }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E7E5E4] px-6 py-4 flex flex-col gap-2 animate-slide-down shadow-lg">
          {[
            { href: '/', label: 'Home' },
            { href: '/events', label: 'Discover Events' },

            { href: '/leaderboard', label: 'Leaderboard' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(href)
                  ? 'bg-[#F5EDE5] text-[#A67B5B] font-semibold'
                  : 'text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917]'
              }`}
            >
              {label}
            </Link>
          ))}

          {user?.role === 'organizer' && (
            <Link href="/organizer/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#F5F5F4]">Organizer Dashboard</Link>
          )}
          {user?.role === 'affiliate' && (
            <Link href="/affiliate/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#F5F5F4]">Promoter Hub</Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#F5F5F4]">Admin Panel</Link>
          )}
          {user?.role === 'user' && (
            <Link href="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#F5F5F4]">My Tickets</Link>
          )}

          <div className="pt-3 border-t border-[#F5F5F4] mt-1">
            {user ? (
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #A67B5B, #D4956A)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">{user.name}</p>
                    <p className="text-xs text-[#57534E] capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-sm text-[#EF4444] font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl text-sm font-medium text-[#1C1917] border border-[#D6D3D1] hover:bg-[#F5F5F4] transition-all">Sign In</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #A67B5B, #D4956A)' }}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
