import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { register as registerApi } from '../../api/authApi';

const RegisterPage = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    if (password.length < 6)  return setError('Mật khẩu phải có ít nhất 6 ký tự');

    setLoading(true);
    try {
      await registerApi(email, password, 'student');
      navigate('/verify-otp', { state: { email, mode: 'register' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-blob auth-left-blob--1" />
        <div className="auth-left-blob auth-left-blob--2" />
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">🚀</div>
            <span className="auth-left-logo-text">LearnHub</span>
          </div>
          <h1 className="auth-left-title">Bắt đầu học thông minh hôm nay</h1>
          <p className="auth-left-sub">
            Miễn phí hoàn toàn. AI cá nhân hóa lộ trình học của bạn ngay sau khi đăng ký.
          </p>
          <div className="auth-left-features">
            {[
              { icon: '⚡', text: 'Tạo tài khoản trong 30 giây' },
              { icon: '🤖', text: 'AI Coach phân tích và đồng hành' },
              { icon: '🎯', text: 'Kế hoạch học tập cá nhân hoá' },
              { icon: '🏆', text: 'Gamification giữ động lực mỗi ngày' },
            ].map(f => (
              <div key={f.text} className="auth-left-feature">
                <div className="auth-left-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo-sm">
            <div className="auth-logo-sm-icon">L</div>
            LearnHub
          </div>

          <h2 className="auth-title">Tạo tài khoản miễn phí</h2>
          <p className="auth-subtitle">Học thông minh hơn với trợ lý AI của bạn</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label"><FiMail size={14} /> Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label"><FiLock size={14} /> Mật khẩu</label>
              <div className="input-with-icon">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><FiLock size={14} /> Xác nhận mật khẩu</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : <><span>Đăng ký ngay</span><FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
          <p className="auth-back"><Link to="/">← Quay về trang chủ</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
