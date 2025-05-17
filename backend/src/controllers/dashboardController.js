const Booking = require('../models/Booking');
const Field = require('../models/Field');
const User = require('../models/User');

// Lấy thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const tzDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const yyyy = tzDate.getFullYear();
    const mm = String(tzDate.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const dd = String(tzDate.getDate()).padStart(2, '0');

    const yyyyMMdd = `${yyyy}-${mm}-${dd}`;


    const totalFields = await Field.countDocuments();
    const todayBookings = await Booking.countDocuments({
      date: yyyyMMdd,
    });
    const todayRevenue = await Booking.aggregate([
      { $match: { date: yyyyMMdd, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({
      totalFields,
      todayBookings,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách booking hôm nay
exports.getTodayBookings = async (req, res) => {
  try {
    const today = new Date();
    const tzDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const yyyy = tzDate.getFullYear();
    const mm = String(tzDate.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const dd = String(tzDate.getDate()).padStart(2, '0');

    const yyyyMMdd = `${yyyy}-${mm}-${dd}`;
    console.log('Today (VN):', yyyyMMdd); 
    
    const bookings = await Booking.find({ date:  yyyyMMdd })
    // Kiểm tra nếu có userId thì mới populate
    for (let booking of bookings) {
      if (booking.userId) {
        await booking.populate('userId');
      }
      if (booking.fieldId) {
        await booking.populate('fieldId');
      }
    }
    res.json(bookings);
    console.log('Bookings today:', bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};