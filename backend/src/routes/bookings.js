const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Import model Booking

// API đặt sân bóng
router.post('/', async (req, res) => {
  const { fieldId, date, startTime, endTime, totalAmount, userId, fieldType, paymentStatus, name, sdt } = req.body;
  console.log(req.body);

  try {
    // Tạo mới booking
    const newBooking = new Booking({
      fieldId,
      userId,
      date,
      startTime,
      endTime,
      totalAmount,
      paymentStatus,
      fieldType,
      name,
      sdt
    });

    await newBooking.save();

  

    res.status(201).json({ 
      message: 'Đặt sân thành công!', 
      booking: newBooking 
    });
  } catch (err) {
    console.error('Lỗi khi đặt sân:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Lấy danh sách đặt sân
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'fullname email phone') // Lấy thông tin user
      .populate('fieldId', 'name type price'); // Lấy thông tin sân
    console.log(bookings);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách đặt sân theo userId
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('userId', 'fullname email phone')
      .populate('fieldId', 'name type price');

    if (!bookings.length) {
      return res.status(404).json({ message: 'Người dùng này chưa đặt sân nào.' });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Xóa đặt sân
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Không tìm thấy đặt sân!' });
    }
    res.json({ message: 'Xóa đặt sân thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa đặt sân:', error);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Cập nhật đặt sân
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fieldId, date, startTime, endTime, totalAmount, paymentStatus, fieldType, name, sdt } = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        fieldId,
        date,
        startTime,
        endTime,
        totalAmount,
        paymentStatus,
        fieldType,
        name,
        sdt
      },
      { new: true }
    ).populate('userId', 'fullname email phone')
     .populate('fieldId', 'name type price');

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Không tìm thấy đặt sân!' });
    }

    res.json({ 
      message: 'Cập nhật đặt sân thành công!',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật đặt sân:', error);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Kiểm tra trùng lịch
router.post('/check-conflict', async (req, res) => {
  const { fieldId, date, startTime, endTime, bookingId } = req.body;

  try {
    // Tìm các booking trùng lịch
    const query = {
      fieldId,
      date,
      $or: [
        // Trường hợp 1: Booking mới bắt đầu trong khoảng thời gian của booking cũ
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        // Trường hợp 2: Booking mới bao trùm booking cũ
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        // Trường hợp 3: Booking mới kết thúc trong khoảng thời gian của booking cũ
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } }
      ]
    };

    // Nếu đang sửa booking, loại trừ booking hiện tại khỏi việc kiểm tra
    if (bookingId) {
      query._id = { $ne: bookingId };
    }

    const conflictingBookings = await Booking.find(query)
      .populate('userId', 'fullname')
      .populate('fieldId', 'name');

    if (conflictingBookings.length > 0) {
      return res.json({
        hasConflict: true,
        conflicts: conflictingBookings.map(b => ({
          time: `${b.startTime} - ${b.endTime}`,
          customer: b.userId?.fullname || b.name,
          field: b.fieldId?.name
        }))
      });
    }

    res.json({ hasConflict: false });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trùng lịch:', error);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Lấy thông tin đặt sân theo ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('fieldId', 'name type price')
      .populate('userId', 'fullname email phone');

    if (!booking) {
      return res.status(404).json({ error: 'Không tìm thấy đặt sân!' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đặt sân:', error);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

module.exports = router;