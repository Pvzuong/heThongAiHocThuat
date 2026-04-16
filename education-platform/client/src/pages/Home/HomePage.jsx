import { Link } from 'react-router-dom';
import { FiBookOpen, FiCode, FiArrowRight } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Học tập không giới hạn,<br />
          <span className="hero-highlight">miễn phí hoàn toàn</span>
        </h1>
        <p className="hero-subtitle">
          Nền tảng học tập trực tuyến dành cho học sinh tiểu học và người đi làm
          muốn nâng cao kỹ năng nghề nghiệp.
        </p>
        {!user && (
          <Link to="/login" className="btn btn--primary btn--lg">
            Bắt đầu học ngay <FiArrowRight />
          </Link>
        )}
      </section>

      {/* Entry points */}
      <section className="entry-section">
        <div className="entry-card">
          <div className="entry-icon entry-icon--blue">
            <FiBookOpen size={40} />
          </div>
          <h2>Học phổ thông</h2>
          <p>Môn học theo chương trình SGK — chọn cấp học, chọn lớp rồi học từng bài có bài tập đi kèm.</p>
          <ul className="entry-features">
            <li>Cấp 1 · Cấp 2 · Cấp 3</li>
            <li>Lý thuyết + bài tập tương tác (trắc nghiệm, điền khuyết, ghép đôi)</li>
            <li>Theo dõi tiến độ từng chương</li>
          </ul>
          <Link to="/pho-thong" className="btn btn--primary">
            Chọn cấp học <FiArrowRight />
          </Link>
        </div>

        <div className="entry-card">
          <div className="entry-icon entry-icon--purple">
            <FiCode size={40} />
          </div>
          <h2>Kỹ năng nghề nghiệp</h2>
          <p>Lộ trình học Frontend & Backend Developer — từ cơ bản đến sẵn sàng đi làm.</p>
          <ul className="entry-features">
            <li>Lộ trình có cấu trúc rõ ràng</li>
            <li>Bài test đánh giá trình độ đầu vào</li>
            <li>Nội dung cập nhật liên tục</li>
          </ul>
          <Link to="/skill-paths" className="btn btn--purple">
            Xem lộ trình <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">5</span>
          <span className="stat-label">Lớp học</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">13+</span>
          <span className="stat-label">Bài học</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">19+</span>
          <span className="stat-label">Bài tập</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">2</span>
          <span className="stat-label">Lộ trình kỹ năng</span>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
