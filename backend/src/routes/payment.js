// routes/payment.js
const express = require('express');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = mongoose.models.Booking || require('../models/Booking');

const config = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || 'YG2WVOQB',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || 'GVXTG448COOTCIYY0NUAKCARTTPYA7WU',
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:4000/api/payment/vnpay_return',
  vnp_ClientUrl: process.env.VNP_CLIENT_URL || 'http://localhost:5173',
  vnp_ApiUrl: process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};

router.post('/create_payment_url', async (req, res) => {
  try {
    // 1. Validate input
    const { amount, bookingInfo } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ'
      });
    }

    if (!bookingInfo || !bookingInfo.fieldId || !bookingInfo.userId || !bookingInfo.date || 
        !bookingInfo.startTime || !bookingInfo.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đặt sân'
      });
    }

    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    // Tạo mã đơn hàng unique
    const orderId = moment(date).format('DDHHmmss') + '_' + Math.random().toString(36).slice(2, 8);
    const vnpAmount = Math.round(amount * 100);
    
    // Tạo orderInfo bằng JSON và encode
    const orderInfo = Buffer.from(JSON.stringify({
      orderId,
      fieldId: bookingInfo.fieldId,
      userId: bookingInfo.userId,
      date: bookingInfo.date,
      startTime: bookingInfo.startTime,
      endTime: bookingInfo.endTime,
      amount: amount
    })).toString('base64');

    // Create VNPAY parameters object
    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: vnpAmount,
      vnp_ReturnUrl: config.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Thêm bankCode nếu được truyền vào từ request
    const bankCode = req.body.bankCode;
    if (bankCode && bankCode.length > 0) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }    // Sắp xếp các tham số theo thứ tự alphabet    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi ký đúng chuẩn VNPAY
    const signData = Object.keys(vnp_Params)
      .sort()
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Thêm chữ ký vào params
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL thanh toán
    const paymentUrl = config.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });

    // Lưu thông tin để kiểm tra sau này
    console.log('Payment URL created:', {
      amount: vnpAmount,
      orderId,
      orderInfo
    });

    res.json({
      success: true,
      paymentUrl: paymentUrl
    });
} catch (error) {
    console.error('Error creating payment URL:', error);
 }}
);
 
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

router.get('/vnpay_return', async (req, res) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  console.log('Thông tin callback từ VNPay (raw):', req.query);
  console.log('Chữ ký từ VNPay:', secureHash);

  // Xóa các tham số không cần thiết
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sắp xếp các tham số theo thứ tự alphabet
  const sortedParams = sortObject(vnp_Params);

  console.log('Các tham số sau khi sắp xếp:', sortedParams);
  // Tạo chuỗi ký theo cách của VNPay
  const signData = Object.keys(sortedParams)
    .sort()
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');

  console.log('Chuỗi dữ liệu để ký:', signData);

  // Tạo chữ ký
  const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  console.log('Chữ ký được tạo lại:', signed);

  console.log('So sánh chữ ký:', {
    'Chữ ký từ VNPay': secureHash,
    'Chữ ký được tạo lại': signed,
    'Giống nhau?': secureHash === signed
  });

  // So sánh chữ ký
  if (secureHash === signed) {
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = vnp_Params['vnp_Amount'] / 100;

    // Kiểm tra mã phản hồi từ VNPay
    if (rspCode === '00') {
      try {
        // Tạo booking mới với trạng thái đã thanh toán
        const booking = {
          fieldId: vnp_Params['vnp_OrderInfo'].split('_')[1],
          userId: vnp_Params['vnp_OrderInfo'].split('_')[2],
          date: vnp_Params['vnp_OrderInfo'].split('_')[3],
          startTime: vnp_Params['vnp_OrderInfo'].split('_')[4],
          endTime: vnp_Params['vnp_OrderInfo'].split('_')[5],
          totalAmount: amount,
          paymentMethod: 'vnpay',
          paymentStatus: 'paid',
          vnpayTransactionId: vnp_Params['vnp_TransactionNo'],
          vnpayBankCode: vnp_Params['vnp_BankCode'],
          vnpayPayDate: vnp_Params['vnp_PayDate']
        };

        console.log('Thông tin booking:', booking);

        // Lưu booking vào database
        const newBooking = await Booking.create(booking);

        // Chuyển hướng đến trang thành công với thông tin booking
        res.redirect(`${config.vnp_ClientUrl}/payment-success?bookingId=${newBooking._id}`);
      } catch (error) {
        console.error('Lỗi khi tạo booking:', error);
        res.redirect(`${config.vnp_ClientUrl}/payment-fail?error=booking_creation_failed`);
      }
    } else {
      // Thanh toán thất bại
      res.redirect(`${config.vnp_ClientUrl}/payment-fail?error=payment_failed&code=${rspCode}`);
    }
  } else {
    // Chữ ký không hợp lệ
    console.error('Chi tiết lỗi chữ ký:', {
      'Chữ ký từ VNPay': secureHash,
      'Chữ ký được tạo lại': signed,
      'Chuỗi dữ liệu': signData,
      'Tham số gốc': vnp_Params,
      'Tham số đã sắp xếp': sortedParams,
      'Secret Key': config.vnp_HashSecret
    });
    res.redirect(`${config.vnp_ClientUrl}/payment-fail?error=invalid_signature`);
  }
});

module.exports = router;
