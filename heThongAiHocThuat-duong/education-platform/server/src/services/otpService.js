const crypto = require('crypto');

const generateOTP = () => {
  // Tạo số ngẫu nhiên 6 chữ số
  return String(crypto.randomInt(100000, 999999));
};

const OTP_EXPIRE_MINUTES = 5;

module.exports = { generateOTP, OTP_EXPIRE_MINUTES };
