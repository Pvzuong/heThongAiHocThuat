import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { login as loginApi } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      const userData = res.data.user;
      login(res.data.access_token, userData);
      if (userData.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.needVerify) {
        navigate('/verify-otp', { state: { email: data.email, mode: 'verify' } });
        return;
      }
      setError(data?.error || 'Email hoặc mật khẩu không đúng');
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
          <h1 className="auth-left-title">Học thông minh hơn với AI</h1>
          <p className="auth-left-sub">
            Trợ lý học tập AI đồng hành cùng bạn mỗi ngày — cá nhân hóa, gamification, và kết quả thực sự.
          </p>
          <div className="auth-left-features">
            {[
              { icon: '🤖', text: 'AI Coach phân tích điểm yếu của bạn' },
              { icon: '🔥', text: 'Streak & XP giữ động lực học mỗi ngày' },
              { icon: '🏆', text: 'Leaderboard cạnh tranh với bạn bè' },
              { icon: '📚', text: 'Chương trình SGK lớp 6–12 đầy đủ' },
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

          <h2 className="auth-title">Chào mừng quay lại! 👋</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục hành trình học tập</p>

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
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : <><span>Đăng nhập</span><FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
          </p>
          <p className="auth-back"><Link to="/">← Quay về trang chủ</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
