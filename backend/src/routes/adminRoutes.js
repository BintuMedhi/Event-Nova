const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { protect, authorize } = require('../middleware/auth');

// Note: For demo simplicity and offline presentation stability, we apply protect/authorize checks in MongoDB mode.
// When dbOffline is active, we bypass auth checks to allow direct demo visualization.
const adminAuth = (req, res, next) => {
  if (global.dbOffline) {
    return next();
  }
  return protect(req, res, () => {
    authorize('admin')(req, res, next);
  });
};

// ==========================================
// 1. GET ADMIN DASHBOARD STATS
// ==========================================
router.get('/stats', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      stats: {
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
      }
    });
  }

  try {
    // 1. User Count and Role Breakdown
    const users = await User.find();
    const roleDistribution = { users: 0, organizers: 0, affiliates: 0, admins: 0 };
    users.forEach(u => {
      if (u.role === 'admin') roleDistribution.admins++;
      else if (u.role === 'organizer') roleDistribution.organizers++;
      else if (u.role === 'affiliate') roleDistribution.affiliates++;
      else roleDistribution.users++;
    });

    // 2. Events Count
    const totalEvents = await Event.countDocuments();

    // 3. Tickets & Revenue
    const tickets = await Ticket.find({ paymentStatus: 'paid' });
    const totalBookings = await Ticket.countDocuments();
    const totalRevenue = tickets.reduce((acc, t) => acc + (t.totalAmount || 0), 0);

    // 4. Category Distribution
    const events = await Event.find();
    const categoryMap = {};
    events.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryMap).map(cat => ({
      name: cat,
      count: categoryMap[cat],
      revenue: 0 // Will aggregate from ticket sales below
    }));

    // Aggregate revenue by category
    const allPaidTickets = await Ticket.find({ paymentStatus: 'paid' }).populate('eventId');
    allPaidTickets.forEach(t => {
      if (t.eventId) {
        const dist = categoryDistribution.find(d => d.name === t.eventId.category);
        if (dist) {
          dist.revenue += t.totalAmount || 0;
        } else {
          categoryDistribution.push({
            name: t.eventId.category,
            count: 0,
            revenue: t.totalAmount || 0
          });
        }
      }
    });

    // 5. Monthly Sales Aggregation
    const monthlySalesMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allTickets = await Ticket.find().sort({ createdAt: 1 });
    
    allTickets.forEach(t => {
      if (t.createdAt) {
        const date = new Date(t.createdAt);
        const mLabel = months[date.getMonth()];
        if (!monthlySalesMap[mLabel]) {
          monthlySalesMap[mLabel] = { bookings: 0, revenue: 0 };
        }
        monthlySalesMap[mLabel].bookings += t.quantity || 1;
        if (t.paymentStatus === 'paid') {
          monthlySalesMap[mLabel].revenue += t.totalAmount || 0;
        }
      }
    });

    const monthlySales = Object.keys(monthlySalesMap).map(m => ({
      month: m,
      bookings: monthlySalesMap[m].bookings,
      revenue: monthlySalesMap[m].revenue
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalEvents,
        totalBookings,
        totalRevenue,
        roleDistribution,
        categoryDistribution,
        monthlySales: monthlySales.length > 0 ? monthlySales : [{ month: 'May', bookings: totalBookings, revenue: totalRevenue }]
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching stats' });
  }
});

// ==========================================
// 2. USER MANAGER ENDPOINTS
// ==========================================

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      users: [
        {
          _id: 'mock_u1',
          name: 'Bintu Medhi',
          email: 'bintu.admin@eventnova.com',
          role: 'admin',
          referralCode: 'bintu_888',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock_u2',
          name: 'Pulsar Entertainment',
          email: 'pulsar.org@eventnova.com',
          role: 'organizer',
          referralCode: 'pulsar_123',
          commissionBalance: 45000,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock_u3',
          name: 'Rahul Sen',
          email: 'rahul.aff@eventnova.com',
          role: 'affiliate',
          referralCode: 'rahul_99',
          commissionBalance: 12400,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock_u4',
          name: 'Aditya Das',
          email: 'aditya@gmail.com',
          role: 'user',
          referralCode: 'aditya_321',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock_u5',
          name: 'Nisha Borgohain',
          email: 'nisha@yahoo.com',
          role: 'user',
          referralCode: 'nisha_542',
          commissionBalance: 0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]
    });
  }

  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching users' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'organizer', 'affiliate', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'User role updated successfully (Offline Demo Mode)'
    });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error updating user role' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully (Offline Demo Mode)'
    });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error deleting user' });
  }
});

// ==========================================
// 3. EVENT MODERATION ENDPOINTS
// ==========================================

// Get all events
router.get('/events', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      events: [
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
      ]
    });
  }

  try {
    const events = await Event.find()
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching events' });
  }
});

// Toggle event status
router.put('/events/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'Event status updated successfully (Offline Demo Mode)'
    });
  }

  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error updating event status' });
  }
});

// Delete event
router.delete('/events/:id', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully (Offline Demo Mode)'
    });
  }

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error deleting event' });
  }
});

// ==========================================
// 4. TICKET TRANSACTIONS ENDPOINTS
// ==========================================

// Get all tickets
router.get('/tickets', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      tickets: [
        {
          _id: 'mock_t1',
          userId: { name: 'Aditya Das', email: 'aditya@gmail.com' },
          eventId: { title: 'EDM Pulse Night 2026', category: 'Music' },
          tierName: 'VIP Pass',
          quantity: 2,
          totalAmount: 5998,
          paymentStatus: 'paid',
          checkedIn: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
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
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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
          createdAt: new Date()
        }
      ]
    });
  }

  try {
    const tickets = await Ticket.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title category')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching tickets' });
  }
});

// Update ticket status (payment status)
router.put('/tickets/:id/payment', adminAuth, async (req, res) => {
  const { paymentStatus } = req.body;
  if (!['pending', 'paid', 'refunded'].includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }

  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'Ticket payment status updated successfully (Offline Demo Mode)'
    });
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error updating ticket status' });
  }
});

// Delete ticket booking
router.delete('/tickets/:id', adminAuth, async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({
      success: true,
      message: 'Ticket transaction deleted successfully (Offline Demo Mode)'
    });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    await ticket.deleteOne();
    res.status(200).json({ success: true, message: 'Ticket transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error deleting ticket' });
  }
});

module.exports = router;
