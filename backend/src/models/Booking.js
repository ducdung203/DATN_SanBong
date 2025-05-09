const mongoose = require('mongoose');

// bookingSchema định nghĩa cấu trúc dữ liệu cho một đặt sân bóng trong MongoDB
// Các trường bao gồm:
// - customerName: Tên khách hàng (bắt buộc)
// - fieldId: ID của sân bóng được đặt (bắt buộc)
// - userId: ID của người đặt sân (bắt buộc)
// - date: Ngày đặt sân (bắt buộc)
// - startTime: Giờ bắt đầu đặt sân (bắt buộc)
// - endTime: Giờ kết thúc đặt sân (bắt buộc)
// - paymentStatus: Trạng thái thanh toán của đặt sân, mặc định là 'unpaid' (có thể là 'unpaid', 'paid', hoặc 'canceled')
// - type: Loại sân được đặt (bắt buộc)
const bookingSchema = new mongoose.Schema({
  // Thay String bằng ObjectId và thêm ref tới model 'Field'
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  // Thêm trường userId để lưu ID người đặt sân
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalAmount: { type: Number }, // 🟢 thêm dòng này
  paymentStatus: { type: String, default: 'unpaid' }, // 'unpaid', 'paid', 'canceled'
  fieldType: { type: String, required: true }, // Thêm trường type để lưu loại sân

  // 🆕 Thêm name và sdt (không bắt buộc)
  name: { type: String },
  sdt: { type: String },
});

module.exports = mongoose.model('Booking', bookingSchema);