import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  FiArrowRight, FiZap, FiBookOpen, FiCode,
  FiBarChart2, FiAward, FiSmartphone, FiTarget, FiCpu,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

/* ── Animated counter ─────────────────────────────── */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / (duration / 16));
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 16);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── HERO ─────────────────────────────────────────── */
const Hero = ({ user }) => {
  const navigate = useNavigate();

  const handleStudentCta = () => navigate(user ? '/dashboard' : '/register');
  const handleSkillCta   = () => navigate('/skill-paths');

  return (
    <section className="hp2-hero">
      <div className="hp2-hero-bg" aria-hidden="true">
        <div className="hp2-blob hp2-blob--1" />
        <div className="hp2-blob hp2-blob--2" />
        <div className="hp2-blob hp2-blob--3" />
      </div>

      <div className="hp2-hero-inner">
        <div className="hp2-hero-badge">✨ AI Learning Companion — Đồng hành học tập mỗi ngày</div>

        <h1 className="hp2-hero-title">
          Học thông minh hơn<br />
          <span className="hp2-hero-gradient">với trí tuệ nhân tạo</span>
        </h1>

        <p className="hp2-hero-desc">
          LearnHub cá nhân hóa hành trình học tập của bạn — bài học chuẩn SGK,
          luyện tập gamified và AI Coach đồng hành mỗi ngày.
        </p>

        <div className="hp2-hero-ctas">
          <button className="hp2-cta hp2-cta--student" onClick={handleStudentCta}>
            <FiBookOpen size={18} />
            <span>Học THCS / THPT</span>
            <FiArrowRight size={16} />
          </button>
          <button className="hp2-cta hp2-cta--skill" onClick={handleSkillCta}>
            <FiCode size={18} />
            <span>Học kỹ năng nghề</span>
            <FiArrowRight size={16} />
          </button>
        </div>

        {!user && (
          <p className="hp2-hero-note">
            Miễn phí hoàn toàn ·{' '}
            <Link to="/login" className="hp2-hero-login">Đã có tài khoản? Đăng nhập</Link>
          </p>
        )}
      </div>

      {/* Floating deco cards */}
      <div className="hp2-hero-deco" aria-hidden="true">
        <div className="hp2-deco-card hp2-deco-card--1">
          <span>📚</span> Lớp 6 → 12
        </div>
        <div className="hp2-deco-card hp2-deco-card--2">
          <span>🤖</span> AI Coach
        </div>
        <div className="hp2-deco-card hp2-deco-card--3">
          <span>🏆</span> Leaderboard
        </div>
        <div className="hp2-deco-card hp2-deco-card--4">
          <span>🔥</span> Daily Streak
        </div>
        <div className="hp2-deco-card hp2-deco-card--5">
          <span>⭐</span> XP & Level
        </div>
      </div>
    </section>
  );
};

/* ── PERSONA CARDS ────────────────────────────────── */
const PersonaCards = () => (
  <section className="hp2-section hp2-personas">
    <div className="hp2-section-inner">
      <div className="hp2-section-label">Dành cho bạn</div>
      <h2 className="hp2-section-title">Hai hành trình, một nền tảng</h2>
      <p className="hp2-section-desc">Chọn lộ trình phù hợp — AI sẽ cá nhân hóa toàn bộ trải nghiệm học tập của bạn</p>

      <div className="hp2-persona-grid hp2-persona-grid--2col">
        {/* Học sinh THCS/THPT */}
        <Link to="/pho-thong" className="hp2-persona-card hp2-persona-card--student">
          <div className="hp2-persona-icon">📚</div>
          <div className="hp2-persona-tag">Học sinh THCS / THPT</div>
          <h3>Lớp 6 đến 12</h3>
          <p>Học bài theo chương trình SGK, luyện tập gamified, AI Coach đồng hành và cạnh tranh trên bảng xếp hạng.</p>
          <ul className="hp2-persona-list">
            <li>✅ Bài học chuẩn SGK lớp 6–12</li>
            <li>✅ Luyện tập nhanh với Streak & XP</li>
            <li>✅ AI Coach phân tích điểm mạnh/yếu</li>
            <li>✅ Dashboard & heatmap tiến độ cá nhân</li>
          </ul>
          <span className="hp2-persona-cta">Bắt đầu học <FiArrowRight size={14} /></span>
        </Link>

        {/* Học kỹ năng nghề */}
        <Link to="/skill-paths" className="hp2-persona-card hp2-persona-card--skill">
          <div className="hp2-persona-icon">💻</div>
          <div className="hp2-persona-tag">Người học kỹ năng nghề</div>
          <h3>Lộ trình lập trình bài bản</h3>
          <p>Từ HTML/CSS đến React và Node.js — học theo lộ trình có cấu trúc, kiểm tra trình độ đầu vào và AI hỗ trợ.</p>
          <ul className="hp2-persona-list">
            <li>✅ Frontend & Backend Developer paths</li>
            <li>✅ Kiểm tra trình độ & lộ trình cá nhân</li>
            <li>✅ Bài học thực hành, ví dụ code thực tế</li>
            <li>✅ AI Coach giải thích mọi khái niệm</li>
          </ul>
          <span className="hp2-persona-cta">Khám phá lộ trình <FiArrowRight size={14} /></span>
        </Link>
      </div>
    </div>
  </section>
);

/* ── FEATURES ─────────────────────────────────────── */
const FEATURES = [
  { icon: <FiCpu    size={24} />, color: 'purple', title: 'AI Coach cá nhân',    desc: 'Lumi AI phân tích tiến độ, gợi ý học gì tiếp theo và giải thích bài khó mọi lúc.' },
  { icon: <FiAward  size={24} />, color: 'yellow', title: 'Gamification thực sự', desc: 'Streak, XP, Level, Badge và Leaderboard — học mỗi ngày thành thói quen vui.' },
  { icon: <FiBarChart2 size={24} />, color: 'blue',  title: 'Theo dõi tiến độ',    desc: 'Dashboard với heatmap hoạt động, tỉ lệ chính xác và lộ trình rõ ràng.' },
  { icon: <FiZap    size={24} />, color: 'orange', title: 'Luyện tập tức thì',    desc: 'Daily Challenge, Speed Run và AI Practice — nhiều mode, không bao giờ nhàm.' },
  { icon: <FiSmartphone size={24} />, color: 'teal', title: 'Mọi thiết bị',       desc: 'Responsive hoàn toàn — học mượt mà trên máy tính, tablet hay điện thoại.' },
  { icon: <FiTarget size={24} />, color: 'green',  title: 'Kiểm tra trình độ',   desc: 'Làm bài placement test để AI xác định điểm bắt đầu phù hợp nhất cho bạn.' },
];

const Features = () => (
  <section className="hp2-section hp2-features">
    <div className="hp2-section-inner">
      <div className="hp2-section-label">Tại sao chọn LearnHub?</div>
      <h2 className="hp2-section-title">Tính năng nổi bật</h2>
      <div className="hp2-feature-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="hp2-feature-card">
            <div className={`hp2-feature-icon hp2-feature-icon--${f.color}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── STATS ────────────────────────────────────────── */
const STAT_DATA = [
  { target: 120, suffix: '+', label: 'Bài học', icon: '📖' },
  { target: 500, suffix: '+', label: 'Câu hỏi luyện tập', icon: '📝' },
  { target: 7,   suffix: '',  label: 'Năm học (Lớp 6–12)', icon: '🎓' },
  { target: 2,   suffix: '',  label: 'Lộ trình kỹ năng', icon: '🗺️' },
];

const StatItem = ({ target, suffix, label, icon }) => {
  const [count, ref] = useCounter(target);
  return (
    <div className="hp2-stat-item" ref={ref}>
      <div className="hp2-stat-icon">{icon}</div>
      <div className="hp2-stat-num">{count}{suffix}</div>
      <div className="hp2-stat-label">{label}</div>
    </div>
  );
};

const Stats = () => (
  <section className="hp2-section hp2-stats-section">
    <div className="hp2-stats-inner">
      {STAT_DATA.map((s) => <StatItem key={s.label} {...s} />)}
    </div>
  </section>
);

/* ── HOW IT WORKS ─────────────────────────────────── */
const STEPS = [
  { num: '01', icon: '🎯', title: 'Kiểm tra trình độ', desc: 'Làm bài đánh giá ngắn để AI xác định điểm bắt đầu phù hợp nhất cho bạn.' },
  { num: '02', icon: '🚀', title: 'Học theo lộ trình AI', desc: 'AI Coach gợi ý bài học, luyện tập và nhắc nhở học mỗi ngày để duy trì streak.' },
  { num: '03', icon: '📊', title: 'Theo dõi tiến bộ', desc: 'Dashboard cá nhân, badge thành tích, heatmap hoạt động và bảng xếp hạng cộng đồng.' },
];

const HowItWorks = () => (
  <section className="hp2-section hp2-hiw">
    <div className="hp2-section-inner">
      <div className="hp2-section-label">Đơn giản & hiệu quả</div>
      <h2 className="hp2-section-title">Bắt đầu trong 3 bước</h2>
      <div className="hp2-hiw-steps">
        {STEPS.map((s, i) => (
          <div key={s.num} className="hp2-hiw-step">
            <div className="hp2-hiw-num">{s.num}</div>
            <div className="hp2-hiw-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {i < STEPS.length - 1 && <div className="hp2-hiw-arrow" aria-hidden="true">→</div>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── CTA BOTTOM ───────────────────────────────────── */
const CtaBottom = ({ user }) => (
  <section className="hp2-cta-bottom">
    <div className="hp2-cta-bottom-inner">
      <h2>Sẵn sàng bắt đầu hành trình học tập?</h2>
      <p>Miễn phí hoàn toàn — AI cá nhân hóa lộ trình học ngay hôm nay</p>
      <div className="hp2-cta-bottom-btns">
        {user ? (
          <Link to="/dashboard" className="hp2-cta-bottom-btn hp2-cta-bottom-btn--primary">
            Vào Dashboard <FiArrowRight size={16} />
          </Link>
        ) : (
          <>
            <Link to="/register" className="hp2-cta-bottom-btn hp2-cta-bottom-btn--primary">
              Đăng ký miễn phí <FiArrowRight size={16} />
            </Link>
            <Link to="/login" className="hp2-cta-bottom-btn hp2-cta-bottom-btn--outline">
              Đăng nhập
            </Link>
          </>
        )}
      </div>
      <div className="hp2-cta-bottom-note">
        <span>📚 Học sinh THCS/THPT</span>
        <span>·</span>
        <span>💻 Học kỹ năng nghề</span>
        <span>·</span>
        <span>🤖 AI Coach đồng hành</span>
      </div>
    </div>
  </section>
);

/* ── MAIN ─────────────────────────────────────────── */
const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="hp2-page">
      <Hero user={user} />
      <PersonaCards />
      <Features />
      <Stats />
      <HowItWorks />
      <CtaBottom user={user} />
    </div>
  );
};

export default HomePage;
