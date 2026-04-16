import { Link } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <FiBook size={20} />
        <span>LearnHub</span>
      </div>
      <p className="footer-desc">Nền tảng học tập trực tuyến miễn phí cho học sinh và người đi làm.</p>
      <div className="footer-links">
        <Link to="/pho-thong">Học phổ thông</Link>
        <Link to="/skill-paths">Kỹ năng nghề nghiệp</Link>
        <Link to="/dashboard">Tiến độ của tôi</Link>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} LearnHub. Tất cả quyền được bảo lưu.</p>
    </div>
  </footer>
);

export default Footer;
