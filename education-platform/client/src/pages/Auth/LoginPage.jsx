import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBook, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { login as loginApi } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.needVerify) {
        // Tài khoản chưa xác nhận → chuyển sang trang verify
        navigate('/verify-otp', { state: { email: data.email, mode: 'verify' } });
        return;
      }
      setError(data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
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

        <h2 className="auth-title">Đăng nhập</h2>
        <p className="auth-subtitle">Chào mừng bạn quay lại!</p>

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
                placeholder="Nhập mật khẩu"
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

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : (
              <><span>Đăng nhập</span><FiArrowRight /></>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </p>

        <p className="auth-back">
          <Link to="/">← Quay về trang chủ</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
