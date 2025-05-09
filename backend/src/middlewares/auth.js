const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Không có token!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; // Lưu thông tin người dùng vào req
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

module.exports = authenticateToken;