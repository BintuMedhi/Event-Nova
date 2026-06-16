'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Target,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'tickets'>('overview');

  // Loading and global states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');

  // Dashboard dataset states
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  
  const [eventSearch, setEventSearch] = useState('');
  const [eventCatFilter, setEventCatFilter] = useState('All');
  const [eventStatusFilter, setEventStatusFilter] = useState('All');

  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');

  // Modal / Feedback states
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchAllData();
  }, [user]);

  const showActionFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // 2. Users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      // 3. Events
      const eventsRes = await fetch('http://localhost:5000/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const eventsData = await eventsRes.json();

      // 4. Tickets
      const ticketsRes = await fetch('http://localhost:5000/api/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ticketsData = await ticketsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (usersData.success) {
        setUsersList(usersData.users);
      }
      if (eventsData.success) {
        setEventsList(eventsData.events);
      }
      if (ticketsData.success) {
        setTicketsList(ticketsData.tickets);
      }

      setDbStatus('online');
    } catch (err) {
      console.log('Using offline presentation mock data');
      setDbStatus('offline');
      // Set high fidelity offline fallback state
      setStats({
        totalUsers: 142,
        totalEvents: 18,
        totalBookings: 540,
        totalRevenue: 284500,
        roleDistribution: {
          users: 94,
          organizers: 18,
          affiliates: 28,
          admins: 2
        },
        categoryDistribution: [
          { name: 'Music', count: 6, revenue: 145000 },
          { name: 'College Fest', count: 4, revenue: 62000 },
          { name: 'Tech Conference', count: 3, revenue: 48000 },
          { name: 'Gaming', count: 3, revenue: 21500 },
          { name: 'Workshop', count: 2, revenue: 8000 }
        ],
        monthlySales: [
          { month: 'Jan', bookings: 45, revenue: 22000 },
          { month: 'Feb', bookings: 60, revenue: 31000 },
          { month: 'Mar', bookings: 85, revenue: 45000 },
          { month: 'Apr', bookings: 120, revenue: 68000 },
          { month: 'May', bookings: 230, revenue: 118500 }
        ]
      });

      setUsersList([
        {
          _id: 'mock_u1',
          name: 'Bintu Medhi',
          email: 'bintu.admin@eventnova.com',
          role: 'admin',
          referralCode: 'bintu_888',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_u2',
          name: 'Pulsar Entertainment',
          email: 'pulsar.org@eventnova.com',
          role: 'organizer',
          referralCode: 'pulsar_123',
          commissionBalance: 45000,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_u3',
          name: 'Rahul Sen',
          email: 'rahul.aff@eventnova.com',
          role: 'affiliate',
          referralCode: 'rahul_99',
          commissionBalance: 12400,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_u4',
          name: 'Aditya Das',
          email: 'aditya@gmail.com',
          role: 'user',
          referralCode: 'aditya_321',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_u5',
          name: 'Nisha Borgohain',
          email: 'nisha@yahoo.com',
          role: 'user',
          referralCode: 'nisha_542',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      setEventsList([
        {
          _id: 'mock_e1',
          title: 'EDM Pulse Night 2026',
          category: 'Music',
          date: '2026-06-15T19:00:00.000Z',
          venue: { name: 'Main Arena', city: 'Mumbai' },
          status: 'published',
          organizerId: { name: 'Pulsar Entertainment', email: 'pulsar.org@eventnova.com' }
        },
        {
          _id: 'mock_e2',
          title: 'NextGen AI & Tech Summit',
          category: 'Tech Conference',
          date: '2026-07-10T10:00:00.000Z',
          venue: { name: 'Innovation Lab', city: 'Bangalore' },
          status: 'published',
          organizerId: { name: 'TechLabs Inc', email: 'techlabs@eventnova.com' }
        },
        {
          _id: 'mock_e3',
          title: 'HyperDrive Hackathon',
          category: 'Gaming',
          date: '2026-06-25T09:00:00.000Z',
          venue: { name: 'Auditorium Hall', city: 'Delhi' },
          status: 'draft',
          organizerId: { name: 'Esports India', email: 'esports@eventnova.com' }
        }
      ]);

      setTicketsList([
        {
          _id: 'mock_t1',
          userId: { name: 'Aditya Das', email: 'aditya@gmail.com' },
          eventId: { title: 'EDM Pulse Night 2026', category: 'Music' },
          tierName: 'VIP Pass',
          quantity: 2,
          totalAmount: 5998,
          paymentStatus: 'paid',
          checkedIn: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_t2',
          userId: { name: 'Nisha Borgohain', email: 'nisha@yahoo.com' },
          eventId: { title: 'NextGen AI & Tech Summit', category: 'Tech Conference' },
          tierName: 'General Admission',
          quantity: 1,
          totalAmount: 499,
          paymentStatus: 'paid',
          checkedIn: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'mock_t3',
          userId: { name: 'Aditya Das', email: 'aditya@gmail.com' },
          eventId: { title: 'HyperDrive Hackathon', category: 'Gaming' },
          tierName: 'Standard Entry',
          quantity: 3,
          totalAmount: 597,
          paymentStatus: 'pending',
          checkedIn: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    showActionFeedback('Dashboard statistics reloaded!');
  };

  // User Actions
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showActionFeedback(`Successfully promoted user to ${newRole}`);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      // Offline fallback mutation
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showActionFeedback(`User role simulated update to ${newRole} (Offline Mode)`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent!')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
        showActionFeedback('User successfully deleted from database');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setUsersList(prev => prev.filter(u => u._id !== userId));
      showActionFeedback('User simulated deletion from dashboard (Offline Mode)');
    }
  };

  // Event Actions
  const handleEventStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setEventsList(prev => prev.map(e => e._id === eventId ? { ...e, status: newStatus } : e));
        showActionFeedback(`Event status updated to ${newStatus}`);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setEventsList(prev => prev.map(e => e._id === eventId ? { ...e, status: newStatus } : e));
      showActionFeedback(`Event simulated status update to ${newStatus} (Offline Mode)`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? All ticket mappings will be broken.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEventsList(prev => prev.filter(e => e._id !== eventId));
        showActionFeedback('Event successfully removed from database');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setEventsList(prev => prev.filter(e => e._id !== eventId));
      showActionFeedback('Event simulated deletion (Offline Mode)');
    }
  };

  // Ticket Actions
  const handleTicketPaymentChange = async (ticketId: string, newPaymentStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/tickets/${ticketId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setTicketsList(prev => prev.map(t => t._id === ticketId ? { ...t, paymentStatus: newPaymentStatus } : t));
        showActionFeedback(`Ticket payment updated to ${newPaymentStatus}`);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setTicketsList(prev => prev.map(t => t._id === ticketId ? { ...t, paymentStatus: newPaymentStatus } : t));
      showActionFeedback(`Ticket simulated refund/status change to ${newPaymentStatus} (Offline Mode)`);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Delete ticket mapping? This record will disappear from buyer logs.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTicketsList(prev => prev.filter(t => t._id !== ticketId));
        showActionFeedback('Ticket transaction records deleted');
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setTicketsList(prev => prev.filter(t => t._id !== ticketId));
      showActionFeedback('Ticket simulated deletion (Offline Mode)');
    }
  };

  // Filters application
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.referralCode && u.referralCode.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredEvents = eventsList.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                          (e.organizerId && e.organizerId.name.toLowerCase().includes(eventSearch.toLowerCase())) ||
                          (e.venue && e.venue.city.toLowerCase().includes(eventSearch.toLowerCase()));
    const matchesCategory = eventCatFilter === 'All' || e.category === eventCatFilter;
    const matchesStatus = eventStatusFilter === 'All' || e.status === eventStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredTickets = ticketsList.filter(t => {
    const matchesSearch = (t.userId && t.userId.name.toLowerCase().includes(ticketSearch.toLowerCase())) ||
                          (t.userId && t.userId.email.toLowerCase().includes(ticketSearch.toLowerCase())) ||
                          (t.eventId && t.eventId.title.toLowerCase().includes(ticketSearch.toLowerCase())) ||
                          (t.tierName && t.tierName.toLowerCase().includes(ticketSearch.toLowerCase()));
    const matchesStatus = ticketStatusFilter === 'All' || t.paymentStatus === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Chart styling colors
  const CHARTS_COLORS = ['#6c63ff', '#ff6584', '#00f2fe', '#43e97b', '#f59e0b'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
          <span className="text-text-muted text-xs font-semibold animate-pulse">Initializing Administrative Secure Terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:px-8 text-left">
      <div className="mesh-bg" />

      {/* Action Toast Feedback */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="glass-panel px-6 py-3 border border-accent-purple/30 shadow-2xl rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-ping" />
            <span className="text-xs font-bold text-white">{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner Alert (Offline Mode Indicator) */}
      {dbStatus === 'offline' && (
        <div className="mb-6 p-4 bg-accent-pink/10 border border-accent-pink/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-accent-pink flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Database in Offline Fallback Mode</h4>
              <p className="text-[10px] text-text-muted mt-0.5">
                Connecting to mock server dataset. All modifications will operate on client memory logic.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry Live Connect
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Control Terminal</h1>
            <span className="text-[10px] bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase">
              Root Admin
            </span>
          </div>
          <p className="text-text-muted text-xs mt-1.5">
            Overview logs, verify transactions, moderate pending/draft events, and modify user credentials globally.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="glass-panel hover:bg-white/5 cursor-pointer text-text-muted hover:text-white p-3 border border-white/10 rounded-2xl flex items-center justify-center transition-all"
            title="Refresh System Logs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent-purple' : ''}`} />
          </button>

          <button
            onClick={() => {
              setActiveTab('overview');
              fetchAllData();
            }}
            className="gradient-border-btn cursor-pointer"
          >
            <span className="gradient-border-btn-inner text-xs font-bold">
              ⚡ Platform Audit
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/5 mb-8 overflow-x-auto pb-1 gap-2 scrollbar-thin">
        {[
          { id: 'overview', name: 'System Statistics', icon: Zap },
          { id: 'users', name: 'User Manager', icon: Users },
          { id: 'events', name: 'Event Moderator', icon: Calendar },
          { id: 'tickets', name: 'Ticket Transactions', icon: Ticket }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'border-accent-purple text-white bg-accent-purple/5'
                  : 'border-transparent text-text-muted hover:text-white hover:bg-white/5'
              } rounded-t-xl`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-accent-purple' : ''}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Widget Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Accounts', value: stats.totalUsers, icon: Users, color: 'text-accent-purple', sub: `${stats.roleDistribution.organizers} Hosts / ${stats.roleDistribution.affiliates} Promoters` },
              { label: 'Total Events Hosted', value: stats.totalEvents, icon: Calendar, color: 'text-accent-pink', sub: `${eventsList.filter(e => e.status === 'published').length} published active` },
              { label: 'Ticket Registrations', value: stats.totalBookings, icon: Ticket, color: 'text-accent-green', sub: `${ticketsList.filter(t => t.paymentStatus === 'paid').length} payments settled` },
              { label: 'Gross Platform Sales', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-accent-green font-bold', sub: 'Commission model active' }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="glass-panel p-6 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{kpi.label}</span>
                    <Icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl sm:text-3xl font-black text-white">{kpi.value}</span>
                    <p className="text-[9px] text-text-muted mt-1 uppercase tracking-wide font-medium">{kpi.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Velocity Chart */}
            <div className="lg:col-span-2 glass-panel p-6 border border-white/10 rounded-3xl h-96 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-accent-purple" /> Monthly Ticket Sales Revenue (Aggregation)
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5">Real-time mapping of finalized booking transactions</p>
              </div>
              <div className="flex-grow w-full mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlySales}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#8e8ea8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8e8ea8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#0c0b14', borderColor: '#6c63ff', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6c63ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Revenue Contribution */}
            <div className="glass-panel p-6 border border-white/10 rounded-3xl h-96 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-accent-pink" /> Category Share
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5">Total tickets value split by event classification</p>
              </div>
              <div className="flex-grow w-full flex items-center justify-center relative mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="revenue"
                      nameKey="name"
                    >
                      {stats.categoryDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHARTS_COLORS[index % CHARTS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ background: '#0c0b14', borderColor: '#ec4899', borderRadius: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 border border-white/10 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user, email, or code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0c0b14] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-accent-purple placeholder:text-text-muted"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#0c0b14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
              <span className="text-[10px] font-bold text-text-muted uppercase">
                {filteredUsers.length} listed
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-hidden border border-white/10 rounded-3xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-left">
                <thead className="bg-[#0c0b14]/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">User Details</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Referral Code</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Balance</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Account Role</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-accent-purple text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-white leading-none">{u.name}</span>
                              <span className="text-[10px] text-text-muted mt-1">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-text-muted font-mono">
                          {u.referralCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-accent-green">
                          ₹{(u.commissionBalance || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-[#0c0b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white outline-none cursor-pointer hover:border-accent-purple"
                          >
                            <option value="user">User</option>
                            <option value="organizer">Organizer</option>
                            <option value="affiliate">Affiliate</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-text-muted hover:text-accent-pink p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Terminate Account"
                            disabled={user?.id === u._id} // Cannot delete self
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-text-muted">
                        No registered users match search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EVENT MODERATOR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 border border-white/10 rounded-2xl">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search event title, venue city, host..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full bg-[#0c0b14] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-accent-purple placeholder:text-text-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={eventCatFilter}
                onChange={(e) => setEventCatFilter(e.target.value)}
                className="bg-[#0c0b14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Music">Music</option>
                <option value="College Fest">College Fest</option>
                <option value="Workshop">Workshop</option>
                <option value="Startup Meet">Startup Meet</option>
                <option value="Gaming">Gaming</option>
                <option value="Tech Conference">Tech Conference</option>
              </select>

              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="bg-[#0c0b14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>

              <span className="text-[10px] font-bold text-text-muted uppercase ml-2">
                {filteredEvents.length} listed
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-hidden border border-white/10 rounded-3xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-left">
                <thead className="bg-[#0c0b14]/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Event Details</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Schedule / Venue</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Organizer Host</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Status Badge</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((e) => (
                      <tr key={e._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-white">{e.title}</span>
                            <span className="inline-flex items-center text-[9px] font-extrabold uppercase text-accent-pink tracking-wider mt-1">{e.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex flex-col">
                            <span className="text-xs text-white">{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] text-text-muted mt-0.5">{e.venue?.city || 'Virtual'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex flex-col">
                            <span className="text-xs text-white font-medium">{e.organizerId?.name || 'Unknown Host'}</span>
                            <span className="text-[9px] text-text-muted mt-0.5">{e.organizerId?.email || ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={e.status}
                            onChange={(ev) => handleEventStatusChange(e._id, ev.target.value)}
                            className="bg-[#0c0b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white outline-none cursor-pointer"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteEvent(e._id)}
                            className="text-text-muted hover:text-accent-pink p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Remove Event Collection Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-text-muted">
                        No events match current parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TICKETS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 border border-white/10 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search buyer name, ticket, event..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full bg-[#0c0b14] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-accent-purple placeholder:text-text-muted"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="bg-[#0c0b14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>

              <span className="text-[10px] font-bold text-text-muted uppercase">
                {filteredTickets.length} orders
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-hidden border border-white/10 rounded-3xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-left">
                <thead className="bg-[#0c0b14]/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Ticket / Date</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Target Event</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Registrant Details</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Amount / Seat</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Payment Status</th>
                    <th scope="col" className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">Refund Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <tr key={t._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-white font-mono">{t._id.substring(0, 10)}...</span>
                            <span className="text-[9px] text-text-muted mt-1">
                              {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white max-w-[200px] truncate">{t.eventId?.title || 'Unknown Event'}</span>
                            <span className="text-[9px] text-accent-pink font-semibold uppercase tracking-wider mt-0.5">{t.tierName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{t.userId?.name || 'Guest User'}</span>
                            <span className="text-[10px] text-text-muted mt-0.5">{t.userId?.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-white">
                          <span className="font-bold text-accent-green">₹{(t.totalAmount || 0).toLocaleString()}</span>
                          <span className="text-text-muted text-[10px] ml-1">({t.quantity} seat)</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            t.paymentStatus === 'paid'
                              ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                              : t.paymentStatus === 'pending'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              : 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink'
                          }`}>
                            {t.paymentStatus === 'paid' && <CheckCircle className="w-2.5 h-2.5" />}
                            {t.paymentStatus === 'pending' && <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />}
                            {t.paymentStatus === 'refunded' && <XCircle className="w-2.5 h-2.5" />}
                            {t.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {t.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleTicketPaymentChange(t._id, 'refunded')}
                              className="text-[9px] font-bold bg-accent-pink/10 hover:bg-accent-pink/20 border border-accent-pink/20 text-accent-pink px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                            >
                              Refund
                            </button>
                          )}
                          {t.paymentStatus === 'refunded' && (
                            <button
                              onClick={() => handleTicketPaymentChange(t._id, 'paid')}
                              className="text-[9px] font-bold bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/20 text-accent-green px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                            >
                              Re-settle
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTicket(t._id)}
                            className="text-text-muted hover:text-accent-pink p-1 hover:bg-white/5 rounded transition-colors cursor-pointer inline-flex items-center"
                            title="Delete Ledger Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-text-muted">
                        No transactions registered under selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
