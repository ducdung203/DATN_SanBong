const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'admin' hoặc 'user'
  fullname: { type: String, required: true}, 
  phone: { type: String, required: true }, // Thêm số điện thoại
});

module.exports = mongoose.model('User', userSchema);