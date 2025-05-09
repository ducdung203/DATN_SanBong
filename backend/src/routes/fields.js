const express = require('express');
const router = express.Router();
const Field = require('../models/Field');
const Booking = require('../models/Booking'); // Import model Booking

// Lấy danh sách sân bóng
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find();
    res.json(fields);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sân bóng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thêm sân bóng mới
router.post('/', async (req, res) => {
  const { name, type, price, hours, status } = req.body;

  try {
    const newField = new Field({ name, type, price, hours, status });
    await newField.save();
    res.status(201).json({ message: 'Thêm sân bóng thành công!', field: newField });
  } catch (err) {
    console.error('Lỗi khi thêm sân bóng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sửa thông tin sân bóng
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, price, hours, status } = req.body;

  try {
    const updatedField = await Field.findByIdAndUpdate(
      id,
      { name, type, price, hours, status },
      { new: true }
    );
    if (!updatedField) {
      return res.status(404).json({ error: 'Không tìm thấy sân bóng!' });
    }
    res.json({ message: 'Cập nhật sân bóng thành công!', field: updatedField });
  } catch (err) {
    console.error('Lỗi khi cập nhật sân bóng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xóa sân bóng
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedField = await Field.findByIdAndDelete(id);
    if (!deletedField) {
      return res.status(404).json({ error: 'Không tìm thấy sân bóng!' });
    }
    res.json({ message: 'Xóa sân bóng thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa sân bóng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});



// API tìm kiếm sân không có lịch bị trùng giờ
router.post('/search', async (req, res) => {
  const { date, startTime, endTime, fieldType } = req.body;

  try {
    let query = {};

    if (fieldType) {
      query.type = fieldType;
    }

    // Tìm các sân không có lịch bị trùng giờ
    const fields = await Field.find(query).populate('bookings');

    const availableFields = fields.filter((field) => {
      return field.bookings.every((booking) => {
        return (
          booking.date !== date ||
          (booking.endTime <= startTime || booking.startTime >= endTime)
        );
      });
    });

    if (availableFields.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sân trống!' });
    }

    res.json(availableFields);
  } catch (err) {
    console.error('Lỗi khi tìm kiếm sân trống:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// API tìm kiếm sân dựa trên loại sân và giờ hoạt động, so sánh với lịch đặt
router.post('/search-fields', async (req, res) => {
  const { date, startTime, endTime, fieldType } = req.body;

  try {
    // Chuyển đổi startTime và endTime thành phút để dễ dàng so sánh
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
      
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    console.log('Thời gian bắt đầu (phút):', startMinutes); // Log thời gian bắt đầu
    console.log('Thời gian kết thúc (phút):', endMinutes); // Log thời gian kết thúc

    // Bước 1: Tìm các sân hoạt động và phù hợp với loại sân
    const fields = await Field.find({
      type: fieldType,
      status: 'Hoạt động',  // Chỉnh lại status
    });
    console.log('Danh sách sân tìm được:', fields); // Log danh sách sân tìm được

    if (fields.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sân phù hợp!' });
    }

    // Bước 2: Lọc các sân không bị trùng lịch đặt
    const availableFields = [];

    for (const field of fields) {
      // Tách giờ hoạt động của sân thành giờ bắt đầu và giờ kết thúc
      const [fieldStartTime, fieldEndTime] = field.hours.split(' - ');
      const fieldStartMinutes = timeToMinutes(fieldStartTime);
      const fieldEndMinutes = timeToMinutes(fieldEndTime);
      console.log(`Giờ hoạt động của sân ${field.name}: ${fieldStartMinutes} - ${fieldEndMinutes}`); // Log giờ hoạt động của sân

      // Kiểm tra xem thời gian đặt sân có nằm trong giờ hoạt động của sân không
      if (startMinutes < fieldStartMinutes || endMinutes > fieldEndMinutes) {
        console.log(`Sân ${field.name} không có trong giờ hoạt động!`);
        continue; // Nếu giờ đặt sân không hợp lệ, bỏ qua sân này
      }

      // Tìm tất cả các đặt sân trùng giờ
      const bookings = await Booking.find({
        fieldId: field._id,
        date: date,
        $or: [
          { startTime: { $lt: endMinutes, $gte: startMinutes } },
          { endTime: { $gt: startMinutes, $lte: endMinutes } },
          { startTime: { $lte: startMinutes }, endTime: { $gte: endMinutes } },
        ],
      });

      if (bookings.length === 0) {
        availableFields.push(field);  // Sân này không bị trùng giờ, thêm vào danh sách
      }
    }
    console.log('Danh sách sân trống:', availableFields.length); // Log danh sách sân trống

    // Trả về danh sách sân trống
    console.log('Danh sách sân trống:', availableFields); // Log danh sách sân trống
    res.json(availableFields);
  } catch (err) {
    console.error('Lỗi khi tìm kiếm sân:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});


module.exports = router;