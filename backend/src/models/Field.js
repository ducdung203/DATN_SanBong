const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên sân
  type: { type: String, required: true }, // Loại sân: 5 người, 7 người, 11 người
  price: { type: Number, required: true }, // Giá thuê sân
  hours: { type: String, required: true }, // Thời gian hoạt động (vd: 6:00 - 22:00)
  status: { type: String, default: 'Hoạt động' }, // Trạng thái: Hoạt động, Bảo trì, Đóng cửa
});

module.exports = mongoose.model('Field', fieldSchema);