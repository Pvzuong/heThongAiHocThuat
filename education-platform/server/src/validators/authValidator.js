const { body } = require('express-validator');

const validateRegister = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu'),
];

const validateVerifyEmail = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có đúng 6 chữ số')
    .isNumeric().withMessage('OTP chỉ chứa chữ số'),
];

const validateResendOTP = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
];

module.exports = { validateRegister, validateLogin, validateVerifyEmail, validateResendOTP };
