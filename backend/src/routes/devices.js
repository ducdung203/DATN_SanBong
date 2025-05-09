const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Lấy danh sách thiết bị
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách thiết bị:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thêm thiết bị mới
router.post('/', async (req, res) => {
  const { name, quantity, status, location, lastMaintenance } = req.body;

  try {
    const newDevice = new Device({ name, quantity, status, location, lastMaintenance });
    await newDevice.save();
    res.status(201).json({ message: 'Thêm thiết bị thành công!', device: newDevice });
  } catch (err) {
    console.error('Lỗi khi thêm thiết bị:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Cập nhật thiết bị
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, status, location, lastMaintenance } = req.body;

  try {
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'ID không hợp lệ hoặc không được cung cấp!' });
    }

    console.log('Dữ liệu nhận được từ frontend:', req.body); // Log dữ liệu nhận được
    console.log('ID nhận được:', id); // Log ID nhận được

    const updatedDevice = await Device.findByIdAndUpdate(
      id,
      { name, quantity, status, location, lastMaintenance },
      { new: true, runValidators: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({ error: 'Thiết bị không tồn tại!' });
    }

    res.json({ message: 'Cập nhật thiết bị thành công!', device: updatedDevice });
  } catch (err) {
    console.error('Lỗi khi cập nhật thiết bị:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xóa thiết bị
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDevice = await Device.findByIdAndDelete(id);

    if (!deletedDevice) {
      return res.status(404).json({ error: 'Thiết bị không tồn tại!' });
    }

    res.json({ message: 'Xóa thiết bị thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa thiết bị:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

module.exports = router;