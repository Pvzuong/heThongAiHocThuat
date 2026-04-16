const transporter = require('../config/email');
require('dotenv').config();

const sendOTP = async (email, otpCode) => {
  const mailOptions = {
    from: `"LearnHub" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Mã xác thực đăng nhập - LearnHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1d4ed8; margin-bottom: 8px;">LearnHub</h2>
        <p style="color: #374151;">Xin chào,</p>
        <p style="color: #374151;">Mã xác thực đăng nhập của bạn là:</p>
        <div style="background: #eff6ff; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${otpCode}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
        <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
