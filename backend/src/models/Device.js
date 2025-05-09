const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên thiết bị
  quantity: { type: Number, required: true }, // Số lượng
  status: { type: String, required: true }, // Trạng thái: Tốt, Cần sửa chữa, Hỏng
  location: { type: String, required: true }, // Vị trí
  lastMaintenance: { type: Date, required: true }, // Ngày bảo trì cuối cùng
});

module.exports = mongoose.model('Device', deviceSchema);