const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const vnpayConfig = require('../config/vnpay');
const Booking = require('../models/Booking');

// API tạo URL thanh toán VNPAY
router.post('/create_payment_url', async (req, res) => {
  try {
    const { bookingId, amount, bankCode = '' } = req.body;

    // Kiểm tra và lấy thông tin booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin đặt sân!' });
    }

    // Tạo thông tin thanh toán
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let orderId = moment(date).format('DDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    let returnUrl = vnpayConfig.vnp_ReturnUrl;

    let locale = 'vn';
    let currCode = 'VND';
    let vnp_Params = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan dat san ' + bookingId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    if (bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp các tham số theo thứ tự alphabet
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi ký tự cần ký
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL thanh toán
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    // Cập nhật trạng thái booking
    booking.paymentStatus = 'pending';
    await booking.save();

    res.json({ code: '00', data: vnpUrl });
  } catch (err) {
    console.error('Lỗi khi tạo URL thanh toán:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// API xử lý kết quả thanh toán từ VNPAY
router.get('/vnpay_return', async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    // Xóa chữ ký khỏi danh sách tham số
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại các tham số
    vnp_Params = sortObject(vnp_Params);

    // Tạo và kiểm tra chữ ký
    let secretKey = vnpayConfig.vnp_HashSecret;
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    // Kiểm tra chữ ký hợp lệ
    if (secureHash === signed) {
      if (rspCode === "00") {
        // Thanh toán thành công
        // Cập nhật trạng thái booking
        const bookingId = vnp_Params['vnp_OrderInfo'].split(' ').pop();
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          await booking.save();
        }

        // Chuyển hướng về trang thành công
        res.redirect('/payment/success');
      } else {
        // Thanh toán thất bại
        // Cập nhật trạng thái booking
        const bookingId = vnp_Params['vnp_OrderInfo'].split(' ').pop();
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'failed';
          await booking.save();
        }

        // Chuyển hướng về trang thất bại
        res.redirect('/payment/failed');
      }
    } else {
      // Chữ ký không hợp lệ
      res.redirect('/payment/failed');
    }
  } catch (err) {
    console.error('Lỗi khi xử lý kết quả thanh toán:', err);
    res.redirect('/payment/failed');
  }
});

// Hàm sắp xếp object theo alphabet
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = router;