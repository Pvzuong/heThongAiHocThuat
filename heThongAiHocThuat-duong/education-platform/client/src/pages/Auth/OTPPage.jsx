import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiBook, FiMail } from 'react-icons/fi';
import { verifyEmail, resendOTP } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const OTPPage = () => {
  const [otp, setOtp]           = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;
  // mode: 'register' (đăng ký mới) | 'verify' (tài khoản chưa xác nhận)
  const mode = location.state?.mode || 'register';

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      setOtp([...pasted.split(''), ...Array(OTP_LENGTH - pasted.length).fill('')]);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return setError('Vui lòng nhập đủ 6 chữ số');
    setError('');
    setLoading(true);
    try {
      const res = await verifyEmail(email, code);
      const userData = res.data.user;
      login(res.data.access_token, userData);
      if (userData.role === 'admin') navigate('/admin', { replace: true });
      else {
        const onboarded = localStorage.getItem('lh_onboarded');
        navigate(onboarded ? '/dashboard' : '/onboarding', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không đúng hoặc đã hết hạn');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await resendOTP(email);
      setCountdown(RESEND_COUNTDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể gửi lại mã');
    } finally {
      setResending(false);
    }
  };

  const subtitle = mode === 'verify'
    ? 'Tài khoản của bạn chưa được xác nhận. Kiểm tra email để lấy mã.'
    : 'Mã xác nhận đã được gửi đến';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <FiBook size={32} />
          <h1>LearnHub</h1>
        </div>

        <div className="otp-email-badge">
          <FiMail size={18} />
          <span>{email}</span>
        </div>

        <h2 className="auth-title">Xác nhận email</h2>
        <p className="auth-subtitle">{subtitle}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="otp-input"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Đang xác nhận...' : 'Xác nhận'}
          </button>
        </form>

        <div className="otp-resend">
          {countdown > 0 ? (
            <p>Gửi lại mã sau <strong>{countdown}s</strong></p>
          ) : (
            <button className="btn-link" onClick={handleResend} disabled={resending}>
              {resending ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
          )}
        </div>

        <p className="auth-back">
          <Link to="/register">← Quay lại đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default OTPPage;
