const transporter = require('../config/email');
const Booking = require('../models/Booking');
const { format } = require('date-fns');
const { vi } = require('date-fns/locale');

const sendBookingReminder = async (booking) => {
  try {
    // Tạo nội dung email
    const emailContent = {
      from: 'dungnguyenduc101@gmail.com', // Thay bằng email của bạn
      to: booking.email, // Email người nhận
      subject: 'Nhắc nhở lịch đặt sân bóng',
      html: `
        <h2>Xin chào !</h2>
        <p>Chúng tôi xin nhắc bạn về lịch đặt sân sắp tới:</p>
        <ul>
          <li>Sân: ${booking.fieldId.name}</li>
          <li>Ngày: ${format(new Date(booking.date), 'EEEE, dd/MM/yyyy', { locale: vi })}</li>
          <li>Thời gian: ${booking.startTime} - ${booking.endTime}</li>
          <li>Tổng tiền: ${booking.totalAmount.toLocaleString('vi-VN')}đ</li>
          <li>Trạng thái thanh toán: ${booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</li>
        </ul>
        <p>Vui lòng đến đúng giờ. Nếu cần hỗ trợ, hãy liên hệ với chúng tôi.</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
      `
    };

    // Gửi email
    await transporter.sendMail(emailContent);
    console.log('Đã gửi email nhắc nhở cho booking:', booking._id);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
};

const checkAndSendReminders = async () => {
  try {
    // Lấy thời gian hiện tại
    const now = new Date();
    console.log('Thời gian hiện tại:', now);
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    // Lấy thời gian 3 tiếng sau
    const threehours = new Date(vnNow.getTime() + (9 * 60 * 60 * 1000));
    console.log('Thời gian 3 tiếng sau:', threehours);

    // Tìm các booking trong khoảng thời gian cần nhắc nhở
    const bookings = await Booking.find({
      date: format(vnNow, 'yyyy-MM-dd'),
      startTime: {
        $gte: format(vnNow, 'HH:mm'),
        $lte: format(threehours, 'HH:mm')
      },
      reminderSent: { $ne: true } // Chỉ lấy những booking chưa gửi nhắc nhở
    }).populate('fieldId');

    // Gửi email cho từng booking
    for (const booking of bookings) {
      await sendBookingReminder(booking);
      
      // Cập nhật trạng thái đã gửi nhắc nhở
      console.log('Cập nhật trạng thái đã gửi nhắc nhở cho booking:');
      booking.reminderSent = true;
      await booking.save();
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra và gửi nhắc nhở:', error);
  }
};

module.exports = {
  sendBookingReminder,
  checkAndSendReminders
};
