import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <span>🚀</span> LearnHub
      </div>
      <p className="footer-desc">
        AI Learning Companion — Đồng hành cùng hành trình học tập của bạn mỗi ngày.
      </p>
      <div className="footer-links">
        <Link to="/pho-thong">Học THCS/THPT</Link>
        <Link to="/skill-paths">Kỹ năng nghề</Link>
        <Link to="/practice">Luyện tập</Link>
        <Link to="/ai-coach">AI Coach</Link>
        <Link to="/ranking">Ranking</Link>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} LearnHub. AI Learning Companion.</p>
    </div>
  </footer>
);

export default Footer;
