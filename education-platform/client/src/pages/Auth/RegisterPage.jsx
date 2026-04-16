import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBook, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { register as registerApi } from '../../api/authApi';

const RegisterPage = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Mật khẩu xác nhận không khớp');
    }
    if (password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    setLoading(true);
    try {
      await registerApi(email, password);
      navigate('/verify-otp', { state: { email, mode: 'register' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <FiBook size={32} />
          <h1>LearnHub</h1>
        </div>

        <h2 className="auth-title">Tạo tài khoản</h2>
        <p className="auth-subtitle">Bắt đầu hành trình học tập của bạn</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <FiMail size={15} /> Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock size={15} /> Mật khẩu
            </label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
              >
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">
              <FiLock size={15} /> Xác nhận mật khẩu
            </label>
            <input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Đang gửi mã...' : (
              <><span>Tiếp theo</span><FiArrowRight /></>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập</Link>
        </p>

        <p className="auth-back">
          <Link to="/">← Quay về trang chủ</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
