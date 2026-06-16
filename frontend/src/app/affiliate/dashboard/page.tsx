'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Award, DollarSign, TrendingUp, BarChart2, CheckCircle, 
  Copy, Check, Loader2, Users, MousePointerClick, Ticket, 
  Share2, QrCode, Download, Image as ImageIcon, Zap, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// --- MOCK DATA FOR CHARTS ---
const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5500 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 12000 },
  { name: 'Sun', revenue: 10500 },
];

const TRAFFIC_SOURCES = [
  { name: 'Instagram', value: 400, color: '#E1306C' },
  { name: 'WhatsApp', value: 300, color: '#25D366' },
  { name: 'Direct Link', value: 300, color: '#A67B5B' },
  { name: 'X / Twitter', value: 200, color: '#000000' },
  { name: 'Facebook', value: 150, color: '#1877F2' },
];

const MINI_SPARKLINE_DATA = [
  { val: 10 }, { val: 20 }, { val: 15 }, { val: 25 }, { val: 22 }, { val: 30 }, { val: 28 }
];

const TOP_EVENTS = [
  {
    id: 'e1',
    name: 'A.R. Rahman World Tour India',
    banner: '/assets/events/ar-rahman-official.jpg',
    ticketsSold: 125,
    revenue: 425000,
    conversion: '12.4%',
  },
  {
    id: 'e2',
    name: 'Taylor Swift: The Eras Tour',
    banner: '/assets/events/taylor-swift-official.jpg',
    ticketsSold: 89,
    revenue: 355000,
    conversion: '15.2%',
  },
  {
    id: 'e3',
    name: 'Arijit Singh Live 2026',
    banner: '/assets/events/arijit-singh-official.jpg',
    ticketsSold: 64,
    revenue: 159900,
    conversion: '8.7%',
  }
];

interface Referral {
  _id: string;
  commissionAmount: number;
  createdAt: string;
  eventId: { title: string; slug: string };
  ticketId: { quantity: number; totalAmount: number };
  status?: string;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7d');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/affiliate/dashboard');
      return;
    }
    fetchAffiliateStats();
  }, [user]);

  const fetchAffiliateStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/affiliate/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error('Load failed');
      }
    } catch (err) {
      // Extended Mock Stats
      setStats({
        totalReferrals: 125,
        earnings: 12450,
        pendingPayout: 2100,
        thisMonthEarnings: 3250,
        totalClicks: 5432,
        conversionRate: 7.4,
        referrals: [
          {
            _id: 'r1',
            commissionAmount: 2100,
            createdAt: new Date().toISOString(),
            eventId: { title: 'A.R. Rahman World Tour India', slug: 'ar-rahman-world-tour' },
            ticketId: { quantity: 4, totalAmount: 11996 },
            status: 'Processing',
          },
          {
            _id: 'r2',
            commissionAmount: 1250,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            eventId: { title: 'Arijit Singh Live 2026', slug: 'arijit-singh-live' },
            ticketId: { quantity: 2, totalAmount: 4998 },
            status: 'Paid',
          },
          {
            _id: 'r3',
            commissionAmount: 800,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            eventId: { title: 'Shreya Ghoshal Melody Night', slug: 'shreya-ghoshal' },
            ticketId: { quantity: 1, totalAmount: 1999 },
            status: 'Paid',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode || 'RAHUL2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A67B5B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasReferrals = stats.referrals && stats.referrals.length > 0;

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24 font-sans text-[#1C1917]">
      
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-[#E5E5E5] pt-12 pb-8 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Promoter Hub
            </h1>
            <p className="text-[#78716C] mt-2 font-medium">
              Analyze your performance, track commissions, and manage campaigns.
            </p>
          </div>

          <div className="flex gap-4">
            <button className="btn-ghost shadow-sm bg-white border border-[#E5E5E5]">
              Documentation
            </button>
            <button className="btn-accent shadow-sm">
              Explore Events
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 space-y-8">

        {/* Affiliate Code & Gamification Rank */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gamification Card */}
          <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#A67B5B]/10 to-[#FBBF24]/20 rounded-full blur-3xl"></div>
            
            <div className="w-20 h-20 bg-gradient-to-br from-[#A67B5B] to-[#D4956A] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#A67B5B] uppercase tracking-wider">Current Tier</span>
                <span className="text-sm font-bold text-[#1C1917]">#12 National Rank</span>
              </div>
              <h2 className="text-2xl font-black mb-1">Gold Promoter</h2>
              <p className="text-[#78716C] text-sm mb-4">3,450 Points • Top 5% of all Promoters</p>
              
              <div className="w-full bg-[#F5F5F4] rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#A67B5B] to-[#D4956A] h-2.5 rounded-full w-[70%]"></div>
              </div>
              <p className="text-xs text-[#78716C] font-semibold text-right">1,550 pts to Platinum Tier</p>
            </div>
          </div>

          {/* Affiliate Code Card */}
          <div className="lg:col-span-4 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider block mb-2">My Affiliate Code</span>
              <div className="bg-[#F5F5F4] border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center justify-between group">
                <span className="text-xl font-bold tracking-widest">{user?.referralCode || 'RAHUL2026'}</span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 bg-white rounded-lg border border-[#E5E5E5] text-[#78716C] hover:text-[#1C1917] hover:border-[#A67B5B] transition-all shadow-sm"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm font-semibold hover:bg-[#FAF7F5] transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1C1917] text-white rounded-xl text-sm font-semibold hover:bg-[#292524] transition-colors shadow-sm">
                <QrCode className="w-4 h-4" /> Show QR
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Referrals */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-2 bg-[#F5F5F4] rounded-lg">
                <Users className="w-5 h-5 text-[#57534E]" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <TrendingUp className="w-3 h-3" /> +18.2%
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-[#78716C] text-sm font-bold uppercase tracking-wider mb-1">Total Referrals</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black">{stats.totalReferrals}</span>
                <span className="text-sm font-semibold text-[#78716C] mb-1">8 today</span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MINI_SPARKLINE_DATA}>
                  <Line type="monotone" dataKey="val" stroke="#1C1917" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commission Earned */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-bold text-[#A67B5B] bg-[#FAF7F5] px-2 py-1 rounded-md">
                ₹{stats.pendingPayout || 0} pending
              </span>
            </div>
            <div>
              <h3 className="text-[#78716C] text-sm font-bold uppercase tracking-wider mb-1">Total Earnings</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black">₹{(stats.earnings || 0).toLocaleString()}</span>
              </div>
              <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +₹{(stats.thisMonthEarnings || 0).toLocaleString()} this month
              </p>
            </div>
          </div>

          {/* Total Click-Throughs */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-2 bg-[#F5F5F4] rounded-lg">
                <MousePointerClick className="w-5 h-5 text-[#57534E]" />
              </div>
              <span className="text-xs font-bold text-[#78716C] bg-[#F5F5F4] px-2 py-1 rounded-md">
                181 / day
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-[#78716C] text-sm font-bold uppercase tracking-wider mb-1">Click-Throughs</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black">{(stats.totalClicks || 0).toLocaleString()}</span>
                <span className="text-sm font-semibold text-[#A67B5B] mb-1">4.8% CTR</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MINI_SPARKLINE_DATA}>
                  <Line type="step" dataKey="val" stroke="#A67B5B" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                <Award className="w-3 h-3" /> Top 15%
              </span>
            </div>
            <div>
              <h3 className="text-[#78716C] text-sm font-bold uppercase tracking-wider mb-1">Conversion Rate</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black">{stats.conversionRate}%</span>
              </div>
              <p className="text-xs font-semibold text-[#78716C] mt-2">
                Above Industry Avg (3.2%)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <button className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#A67B5B] hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#A67B5B]/10 transition-colors">
              <Share2 className="w-5 h-5 text-[#A67B5B]" />
            </div>
            <span className="text-xs font-bold text-[#1C1917]">Create Link</span>
          </button>
          <button className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#1C1917] hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#1C1917]/10 transition-colors">
              <ImageIcon className="w-5 h-5 text-[#1C1917]" />
            </div>
            <span className="text-xs font-bold text-[#1C1917]">Promo Poster</span>
          </button>
          <button className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#1C1917] hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#1C1917]/10 transition-colors">
              <Download className="w-5 h-5 text-[#1C1917]" />
            </div>
            <span className="text-xs font-bold text-[#1C1917]">Download Report</span>
          </button>
          <button className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#1C1917] hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center group-hover:bg-[#1C1917]/10 transition-colors">
              <Ticket className="w-5 h-5 text-[#1C1917]" />
            </div>
            <span className="text-xs font-bold text-[#1C1917]">Share Event</span>
          </button>
          <button className="bg-[#1C1917] border border-[#1C1917] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#292524] shadow-md transition-all group col-span-2 md:col-span-4 lg:col-span-1">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-xs font-bold text-white">AI Assistant</span>
          </button>
        </div>

        {/* Charts Section */}
        {hasReferrals && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1C1917]">Revenue Overview</h2>
                <div className="flex bg-[#F5F5F4] p-1 rounded-lg">
                  {['7d', '30d', '90d'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        timeFilter === t ? 'bg-white shadow-sm text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A67B5B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A67B5B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val) => [`₹${val}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#A67B5B" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="lg:col-span-4 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-[#1C1917] mb-2">Traffic Sources</h2>
              <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TRAFFIC_SOURCES}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {TRAFFIC_SOURCES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-[#78716C] font-semibold">Total</span>
                  <span className="text-xl font-black">1,350</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-y-3">
                {TRAFFIC_SOURCES.map((source, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                    <span className="text-xs font-semibold text-[#57534E]">{source.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Performing Events */}
        {hasReferrals && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#1C1917]">Top Performing Events</h2>
              <button className="text-sm font-bold text-[#A67B5B] hover:text-[#8B6448] flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TOP_EVENTS.map(event => (
                <div key={event.id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="h-32 w-full overflow-hidden relative">
                    <img src={event.banner} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-bold truncate">{event.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#78716C]">Tickets Sold</span>
                      <p className="text-lg font-black text-[#1C1917]">{event.ticketsSold}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#78716C]">Revenue</span>
                      <p className="text-lg font-black text-green-600">₹{(event.revenue/1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referrals Transactions Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#1C1917]">Recent Commissions</h2>
          {hasReferrals ? (
            <div className="bg-white overflow-hidden border border-[#E5E5E5] rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E5E5] text-left">
                  <thead className="bg-[#FAF7F5]">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Tickets</th>
                      <th scope="col" className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Commission</th>
                      <th scope="col" className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] bg-white">
                    {stats.referrals.map((ref: Referral) => (
                      <tr key={ref._id} className="hover:bg-[#FAF7F5] transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#57534E]">
                          {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#1C1917]">
                          {ref.eventId.title}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#57534E]">
                          {ref.ticketId?.quantity || 1} Seat(s)
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-black text-green-600">
                          +₹{(ref.commissionAmount || 0).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            ref.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            ref.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ref.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 bg-[#FAF7F5] rounded-full flex items-center justify-center mb-6">
                <Award className="w-10 h-10 text-[#A67B5B]" />
              </div>
              <h3 className="text-2xl font-black text-[#1C1917] mb-2">Start Earning Commissions</h3>
              <p className="text-[#78716C] max-w-md mx-auto mb-8 font-medium">
                You haven't referred any ticket sales yet. Generate your unique links and share them with your audience to start earning today.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={() => router.push('/explore')} className="btn-accent px-8 py-3">
                  Browse Events
                </button>
                <button onClick={handleCopyCode} className="btn-ghost px-8 py-3 bg-white border border-[#E5E5E5] flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
