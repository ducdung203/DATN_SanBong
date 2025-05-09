const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const secretKey = 'your_secret_key'; // Đổi key này thành một giá trị mạnh, dùng env là tốt nhất

// Đăng ký
router.post('/register', async (req, res) => {
  
  const { email, password, role, fullname, phone} = req.body;
  try {
    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Tên email đã tồn tại!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role, fullname, phone });
    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Đăng ký lỗi:', err); // thêm dòng này
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Tài khoản không tồn tại!' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mật khẩu không đúng!' });

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.json({
      token,
      role: user.role,
      fullname: user.fullname,
      email: user.email, // Thêm email vào phản hồi
      phone: user.phone, // Thêm số điện thoại vào phản hồi
    });
  } catch (err) {
    res.status(500).json({ error: 'Đã xảy ra lỗi!' });
  }
});

// Route bảo vệ (chỉ admin được phép)
router.get('/admin', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ Bearer

  if (!token) return res.status(401).json({ error: 'Không có token!' });

  try {
    const decoded = jwt.verify(token, secretKey);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập!' });
    }
    res.json({ message: 'Chào mừng Admin!' });
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token không được cung cấp!' });

  try {
    const decoded = jwt.verify(token, 'your_secret_key'); // Thay 'secret_key' bằng khóa bí mật của bạn
    const user = await User.findById(decoded.id).select('-password'); // Không trả về mật khẩu
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại!' });

    res.json({ user, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ!' });
  }
});



// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Không trả về mật khẩu
    res.json(users);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thêm người dùng mới
router.post('/', async (req, res) => {
  const { email, password, role, fullname, phone } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !fullname || !phone) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin: email, mật khẩu, họ tên và số điện thoại!' });
    }

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã tồn tại!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role, fullname, phone });
    await newUser.save();

    res.status(201).json({ message: 'Thêm người dùng thành công!', user: newUser });
  } catch (err) {
    console.error('Lỗi khi thêm người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Cập nhật người dùng
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fullname, phone, role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullname, phone, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại!' });
    }

    res.json({ message: 'Cập nhật người dùng thành công!', user: updatedUser });
  } catch (err) {
    console.error('Lỗi khi cập nhật người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xóa người dùng
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại!' });
    }

    res.json({ message: 'Xóa người dùng thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

module.exports = router;
