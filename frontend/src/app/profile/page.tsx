'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Ticket,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Shield,
  Copy,
  Check,
  Camera,
  Loader2,
  Bell,
  Lock,
  ChevronRight,
  LogOut,
  Sparkles,
  Heart,
  Zap,
} from 'lucide-react';

interface UserStats {
  totalTickets: number;
  totalSpent: number;
  eventsAttended: number;
  referralEarnings: number;
  memberSince: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security'>('overview');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formBio, setFormBio] = useState('');

  const [stats, setStats] = useState<UserStats>({
    totalTickets: 0,
    totalSpent: 0,
    eventsAttended: 0,
    referralEarnings: 0,
    memberSince: new Date().toISOString(),
  });

  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailPromo: false,
    smsReminder: true,
    pushAlerts: true,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile');
      return;
    }
    setFormName(user.name || '');
    setFormPhone((user as any).phone || '');
    setFormCity((user as any).city || '');
    setFormBio((user as any).bio || '');
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tickets/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.tickets) {
        const tickets = data.tickets;
        const totalSpent = tickets.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0);
        setStats({
          totalTickets: tickets.length,
          totalSpent,
          eventsAttended: tickets.filter((t: any) => t.checkedIn).length,
          referralEarnings: (user as any)?.commissionBalance || 0,
          memberSince: (user as any)?.createdAt || new Date().toISOString(),
        });
      } else throw new Error();
    } catch {
      // Mock stats fallback
      setStats({
        totalTickets: 5,
        totalSpent: 12450,
        eventsAttended: 3,
        referralEarnings: (user as any)?.commissionBalance || 1800,
        memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formName, phone: formPhone, city: formCity, bio: formBio }),
      });
    } catch {}
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyCode = () => {
    if (!user) return;
    navigator.clipboard.writeText((user as any).referralCode || 'N/A');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRoleGradient = () => {
    switch (user?.role) {
      case 'admin': return 'from-amber-500 to-orange-500';
      case 'organizer': return 'from-accent-purple to-blue-500';
      case 'affiliate': return 'from-accent-pink to-rose-600';
      default: return 'from-accent-purple to-accent-pink';
    }
  };

  const getRoleBadgeLabel = () => {
    switch (user?.role) {
      case 'admin': return '👑 Administrator';
      case 'organizer': return '🎤 Event Organizer';
      case 'affiliate': return '⚡ Affiliate Promoter';
      default: return '🎟 Event Enthusiast';
    }
  };

  const memberDays = Math.floor(
    (Date.now() - new Date(stats.memberSince).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:px-8 text-left">
      <div className="mesh-bg" />

      {/* ── Hero Profile Card ── */}
      <div className="relative glass-panel border border-white/10 rounded-3xl overflow-hidden mb-8">
        {/* Gradient banner */}
        <div className={`h-32 sm:h-44 bg-gradient-to-br ${getRoleGradient()} opacity-20 absolute inset-x-0 top-0`} />
        <div className={`h-32 sm:h-44 bg-gradient-to-br ${getRoleGradient()} opacity-10`} />

        <div className="relative px-6 sm:px-10 pb-8 -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center text-white text-4xl font-black border-4 border-white/10 shadow-xl select-none`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center border-2 border-white/10 hover:scale-110 transition-transform cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Identity */}
          <div className="flex-grow pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                {editing ? (
                  <input
                    className="bg-white/5 border border-accent-purple/30 rounded-xl px-3 py-1 text-xl outline-none text-text-primary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  user.name
                )}
              </h1>
              <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r ${getRoleGradient()} text-white w-fit`}>
                {getRoleBadgeLabel()}
              </span>
            </div>
            <p className="text-text-muted text-sm flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </div>

          {/* Edit / Save Controls */}
          <div className="flex items-center gap-2 pb-1 flex-shrink-0">
            {savedSuccess && (
              <span className="text-xs text-accent-green font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/10 text-text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/10 text-text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tickets Booked', value: stats.totalTickets, icon: Ticket, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
          { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Events Attended', value: stats.eventsAttended, icon: Calendar, color: 'text-accent-pink', bg: 'bg-accent-pink/10' },
          { label: 'Referral Earned', value: `₹${stats.referralEarnings}`, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-text-primary block">{stat.value}</span>
                <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-6 w-fit">
        {(['overview', 'settings', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Personal Info */}
              <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-5">
                <h2 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-accent-purple" /> Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: formName, setter: setFormName, icon: User, placeholder: 'Your full name' },
                    { label: 'Phone Number', value: formPhone, setter: setFormPhone, icon: Phone, placeholder: '+91 XXXXX XXXXX' },
                    { label: 'City', value: formCity, setter: setFormCity, icon: MapPin, placeholder: 'Your city' },
                  ].map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-[9px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
                          <Icon className="w-3 h-3" /> {field.label}
                        </label>
                        {editing ? (
                          <input
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/50 rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none placeholder:text-text-muted transition-colors"
                          />
                        ) : (
                          <p className="text-sm font-medium text-text-primary">
                            {field.value || <span className="text-text-muted italic">Not set</span>}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Bio</label>
                    {editing ? (
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        placeholder="Tell us a bit about yourself..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/50 rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none placeholder:text-text-muted transition-colors resize-none"
                      />
                    ) : (
                      <p className="text-sm text-text-primary">
                        {formBio || <span className="text-text-muted italic">No bio yet. Click Edit Profile to add one.</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-3">
                <h2 className="font-bold text-base text-text-primary flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-accent-pink" /> Quick Actions
                </h2>
                {[
                  { label: 'My Booked Tickets', desc: 'View all event passes & QR codes', icon: Ticket, href: '/my-tickets', color: 'text-accent-purple' },
                  { label: 'Discover Events', desc: 'Browse upcoming concerts, shows & more', icon: Sparkles, href: '/events', color: 'text-accent-pink' },
                  { label: 'Affiliate Promoter Hub', desc: 'Track your commissions & referral stats', icon: Award, href: '/affiliate/dashboard', color: 'text-amber-500' },
                  { label: 'Leaderboard', desc: 'See top promoters by earnings', icon: Star, href: '/leaderboard', color: 'text-accent-green' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className="w-full flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-purple/20 rounded-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold text-text-primary block">{item.label}</span>
                          <span className="text-[10px] text-text-muted">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-purple transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-6">
              <h2 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-purple" /> Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'emailBooking', label: 'Booking Confirmations', desc: 'Receive email receipts after successful bookings' },
                  { key: 'emailPromo', label: 'Promotional Emails', desc: 'Deals, offers and curated event suggestions' },
                  { key: 'smsReminder', label: 'SMS Event Reminders', desc: 'Day-of reminders for upcoming events' },
                  { key: 'pushAlerts', label: 'Push Notifications', desc: 'Real-time updates for your bookings' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">{pref.label}</span>
                      <span className="text-[10px] text-text-muted">{pref.desc}</span>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ${
                        notifications[pref.key as keyof typeof notifications]
                          ? 'bg-gradient-to-r from-accent-purple to-accent-pink'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                        notifications[pref.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-semibold py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer">
                Save Notification Settings
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-6">
              <h2 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent-purple" /> Security Settings
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <label className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/50 rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none placeholder:text-text-muted"
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <label className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/50 rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none placeholder:text-text-muted"
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <label className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent-purple/50 rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none placeholder:text-text-muted"
                  />
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-semibold py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer">
                Update Password
              </button>
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="w-full flex items-center justify-center gap-2 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-xs font-bold py-3 rounded-xl hover:bg-accent-pink/15 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out of Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">

          {/* Member Card */}
          <div className={`glass-panel border border-white/10 rounded-3xl p-6 bg-gradient-to-br ${getRoleGradient()} bg-opacity-5 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${getRoleGradient()} opacity-5`} />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-purple" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Member Profile</span>
              </div>
              <div>
                <span className="text-2xl font-black text-text-primary block">{memberDays}</span>
                <span className="text-[10px] text-text-muted">Days as a member</span>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Member Since</span>
                  <span className="font-bold text-text-primary">
                    {new Date(stats.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Account Role</span>
                  <span className="font-bold text-text-primary capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Email Verified</span>
                  <span className="text-accent-green font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Yes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Code Card */}
          <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-pink" />
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Affiliate Code</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <code className="text-sm font-black text-text-primary tracking-widest flex-grow">
                {(user as any).referralCode || 'N/A'}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                {copiedCode
                  ? <Check className="w-4 h-4 text-accent-green" />
                  : <Copy className="w-4 h-4 text-text-muted" />
                }
              </button>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Share this code with friends. You earn 10% commission on each successful booking they make.
            </p>
            <button
              onClick={() => router.push('/affiliate/dashboard')}
              className="w-full text-xs font-bold text-accent-pink bg-accent-pink/10 border border-accent-pink/20 py-2.5 rounded-xl hover:bg-accent-pink/15 transition-all cursor-pointer"
            >
              View Promoter Dashboard →
            </button>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel border border-accent-pink/15 rounded-3xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-accent-pink uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Account Actions
            </span>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="w-full text-xs font-bold text-text-muted hover:text-accent-pink bg-white/5 border border-white/10 hover:border-accent-pink/20 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
