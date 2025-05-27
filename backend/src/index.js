const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = express.Router();
const userRoutes = require('./routes/users'); // Import route users
const bookingRoutes = require('./routes/bookings'); // Import route bookings
const fieldRoutes = require('./routes/fields');
const deviceRoutes = require('./routes/devices');
const paymentRoutes = require('./routes/payment'); // Import route payment
const dashboardRoutes = require('./routes/dashboard');
const cron = require('node-cron');
const { checkAndSendReminders } = require('./services/emailService');

const app = express();
const port = 4000;

const uri = 'mongodb+srv://ducdung203:4YX56RFp7kjqzE8L@cluster0.5mjzo.mongodb.net/sanbong?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/fields', fieldRoutes); // Route cho sân bóng

app.use('/api/bookings', bookingRoutes); // Sử dụng route bookings

app.use('/api/devices', deviceRoutes);// Sử dụng route devices

app.use('/api/users', userRoutes); // Sử dụng route users

app.use('/api/payment', paymentRoutes); // Thêm route payment

app.use('/api/dashboard', dashboardRoutes);

// Lên lịch kiểm tra và gửi email mỗi 30 phút
cron.schedule('*/30 * * * *', () => {
  console.log('Checking for bookings to send reminders...');
  checkAndSendReminders();
});

// setInterval(() => {
//   console.log(`[${new Date().toLocaleTimeString()}] Kiểm tra đặt sân (mỗi 5s)...`);
//   checkAndSendReminders();
// }, 5000); // 5000 milliseconds = 5 giây

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});