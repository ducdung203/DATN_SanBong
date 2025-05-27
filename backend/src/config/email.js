const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dungnguyenduc101@gmail.com', // Thay bằng email của bạn
    pass: 'zitr ooow bami igel' // Thay bằng app password từ Google Account
  }
});

module.exports = transporter;
