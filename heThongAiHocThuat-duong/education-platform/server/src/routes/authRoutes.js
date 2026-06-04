const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRegister, validateLogin, validateVerifyEmail, validateResendOTP } = require('../validators/authValidator');
const {
  registerHandler,
  verifyEmailHandler,
  resendOTPHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
  getMeHandler,
} = require('../controllers/authController');

router.post('/register', validateRegister, registerHandler);
router.post('/verify-email', validateVerifyEmail, verifyEmailHandler);
router.post('/resend-otp', validateResendOTP, resendOTPHandler);
router.post('/login', validateLogin, loginHandler);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logoutHandler);
router.get('/me', auth, getMeHandler);

module.exports = router;
