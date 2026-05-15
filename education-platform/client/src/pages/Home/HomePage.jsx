import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronRight, FiChevronLeft, FiCode } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getPaths } from '../../api/pathApi';

/* ── Môn học hiện có trong hệ thống ─────────────────────── */
const SUBJECTS = [
  {
    icon: 'π',
    title: 'Toán học',
    sub: 'Số học, hình học, đại số theo chương trình SGK',
    to: '/pho-thong',
    variant: 'blue',
  },
];

/* ── Banner data (same as old slider) ───────────────── */
const BANNERS = [
  {
    id: 1,
    tag: 'Phổ thông · Lớp 1 → 5',
    title: 'Toán Tiểu Học',
    desc: 'Chương trình SGK chuẩn — từ số đếm, phép tính đến hình học và phân số.',
    to: '/pho-thong',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    visual: [
      { emoji: '🔢', label: '1 + 1 = 2',  rotate: '-6deg', top: '8%',  left: '6%'  },
      { emoji: '📐', label: 'Hình học',    rotate: '5deg',  bottom: '12%', left: '4%' },
      { emoji: '✖️', label: '3 × 4 = 12', rotate: '-3deg', top: '12%', right: '6%' },
      { emoji: '🧮', label: 'Toán lớp 5', rotate: '4deg',  bottom: '14%', right: '4%' },
    ],
  },
  {
    id: 2,
    tag: 'Kỹ năng nghề nghiệp',
    title: 'Front-end Developer',
    desc: 'Lộ trình bài bản từ HTML/CSS đến React — xây dựng giao diện thực tế.',
    to: '/skill-paths',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    visual: [
      { emoji: '💻', label: 'HTML & CSS',  rotate: '-5deg', top: '8%',  left: '4%'  },
      { emoji: '⚡', label: 'JavaScript',  rotate: '6deg',  bottom: '12%', left: '2%' },
      { emoji: '⚛️', label: 'React',       rotate: '-4deg', top: '10%', right: '5%' },
      { emoji: '🎨', label: 'UI / UX',     rotate: '3deg',  bottom: '12%', right: '3%' },
    ],
  },
  {
    id: 3,
    tag: 'Kỹ năng nghề nghiệp',
    title: 'Back-end Developer',
    desc: 'Node.js, Express, PostgreSQL và JWT Auth — xây dựng REST API hoàn chỉnh.',
    to: '/skill-paths',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    visual: [
      { emoji: '🟢', label: 'Node.js',     rotate: '-6deg', top: '8%',  left: '4%'  },
      { emoji: '🗄️', label: 'PostgreSQL',  rotate: '5deg',  bottom: '12%', left: '2%' },
      { emoji: '🔐', label: 'JWT Auth',    rotate: '-3deg', top: '10%', right: '5%' },
      { emoji: '🌐', label: 'REST API',    rotate: '4deg',  bottom: '12%', right: '3%' },
    ],
  },
];

/* ── Mini banner slider (nhận current từ cha) ─────────── */
const MiniSlider = ({ current, viewportRef, goTo, resetTimer }) => {
  const slideW = viewportRef.current?.offsetWidth ?? 0;

  return (
    <div className="hp-minislider" ref={viewportRef}>
      <div
        className="hp-minislider-track"
        style={{
          transform: `translateX(${-current * slideW}px)`,
          transition: 'transform .55s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {BANNERS.map((b) => (
          <div key={b.id} className="hp-minislider-slide" style={{ background: b.gradient }}>
            <div className="hp-minislider-overlay" />

            <div className="hp-minislider-left">
              <span className="hp-minislider-tag">{b.tag}</span>
              <h3 className="hp-minislider-title">{b.title}</h3>
              <p className="hp-minislider-desc">{b.desc}</p>
              <Link to={b.to} className="hp-minislider-cta" draggable={false}>
                Xem ngay →
              </Link>
            </div>

            <div className="hp-minislider-right" aria-hidden="true">
              {b.visual.map((v, i) => (
                <div
                  key={i}
                  className="hp-minislider-deco"
                  style={{
                    transform: `rotate(${v.rotate})`,
                    top: v.top,
                    bottom: v.bottom,
                    left: v.left,
                    right: v.right,
                  }}
                >
                  <span className="hp-minislider-deco-emoji">{v.emoji}</span>
                  <span className="hp-minislider-deco-label">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="hp-minislider-dots">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`hp-minislider-dot${i === current ? ' hp-minislider-dot--active' : ''}`}
            onClick={() => { goTo(i); resetTimer(); }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Hero frame: state + arrows ngoài rìa + frame ─────── */
const HeroFrame = () => {
  const total = BANNERS.length;
  const [current, setCurrent] = useState(0);
  const viewportRef = useRef(null);
  const timerRef   = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 3200);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  return (
    <div className="hp-frame-wrap" aria-hidden="true">
      {/* Mũi tên trái — ngoài frame */}
      <button
        className="hp-frame-arrow"
        onClick={() => { goTo(current - 1); resetTimer(); }}
        aria-label="Trước"
      >
        <FiChevronLeft size={15} />
      </button>

      {/* Frame */}
      <div className="hp-hero-frame">
        <div className="hp-frame-bar">
          <span className="hp-frame-dot hp-frame-dot--red" />
          <span className="hp-frame-dot hp-frame-dot--yellow" />
          <span className="hp-frame-dot hp-frame-dot--green" />
        </div>
        <MiniSlider
          current={current}
          viewportRef={viewportRef}
          goTo={goTo}
          resetTimer={resetTimer}
        />
      </div>

      {/* Mũi tên phải — ngoài frame */}
      <button
        className="hp-frame-arrow"
        onClick={() => { goTo(current + 1); resetTimer(); }}
        aria-label="Tiếp"
      >
        <FiChevronRight size={15} />
      </button>
    </div>
  );
};

/* ── Mini card (vertical: icon → title → sub) ──────────── */
const MiniCard = ({ to, iconEl, iconVariant, title, sub }) => (
  <Link to={to} className="hp-mini-card">
    <div className={`hp-mini-card-icon hp-mini-card-icon--${iconVariant}`}>{iconEl}</div>
    <span className="hp-mini-card-title">{title}</span>
    <span className="hp-mini-card-sub">{sub}</span>
  </Link>
);

const SkeletonCard = () => <div className="hp-mini-card hp-mini-card--skeleton" />;

/* ── Practice card ─────────────────────────────────────── */
const PracticeCard = ({ user }) => (
  <div className="hp-practice-card">
    <div className="hp-practice-body">
      <div className="hp-practice-icon-circle">⏱</div>
      <div>
        <h3 className="hp-practice-title">Luyện tập<br />Nhanh</h3>
        <p className="hp-practice-desc">
          15 phút mỗi ngày đủ giúp cố kiến thức. AI sẽ tạo bài tập
          dựa trên tiến độ của bạn.
        </p>
      </div>
    </div>
    <Link to={user ? '/practice' : '/login'} className="hp-practice-btn">
      ▶ Bắt đầu luyện tập
    </Link>
  </div>
);

/* ── Stats card ────────────────────────────────────────── */
const STATS = [
  { icon: '📚', num: '5',   label: 'Lớp học',  color: 'blue'   },
  { icon: '📖', num: '13+', label: 'Bài học',  color: 'teal'   },
  { icon: '📝', num: '19+', label: 'Bài tập',  color: 'blue'   },
  { icon: '🗺️', num: '2',   label: 'Lộ trình', color: 'purple' },
];

const StatsCard = () => (
  <div className="hp-stats-card">
    <h3 className="hp-stats-title">Tổng quan học tập</h3>
    <div className="hp-stats-row">
      {STATS.map(({ icon, num, label, color }) => (
        <div key={label} className="hp-stat-item">
          <div className={`hp-stat-icon-circle hp-stat-icon-circle--${color}`}>{icon}</div>
          <span className="hp-stat-num">{num}</span>
          <span className="hp-stat-label">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main page ─────────────────────────────────────────── */
const HomePage = () => {
  const { user } = useAuth();
  const [paths,   setPaths]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaths().then(r => setPaths(r.data.slice(0, 4))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="hp-page">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="hp-hero">
        <div className="hp-hero-text">
          <h1 className="hp-hero-title">
            Chào mừng bạn đến với{' '}
            <span className="hp-hero-brand">LearnHub!</span>
          </h1>
          <p className="hp-hero-sub">
            Tiếp tục hành trình học tập của bạn. Khám phá các lộ trình mới
            và rèn luyện kỹ năng mỗi ngày.
          </p>

          {/* mini subject/path chips */}
          <div className="hp-hero-chips">
            <span className="hp-hero-chip hp-hero-chip--blue">📚 Phổ thông</span>
            <span className="hp-hero-chip hp-hero-chip--purple">💻 Kỹ năng</span>
            <span className="hp-hero-chip hp-hero-chip--teal">⚡ Luyện tập AI</span>
          </div>

          <Link
            to={user ? '/skill-paths' : '/login'}
            className="btn btn--primary hp-hero-cta"
          >
            Bắt đầu ngay <FiArrowRight size={16} />
          </Link>
        </div>

        <div className="hp-hero-visual">
          <HeroFrame />
        </div>

      </section>

      {/* ══ TWO COLUMNS ═══════════════════════════════════════ */}
      <section className="hp-sections">

        <div className="hp-section">
          <div className="hp-section-hd">
            <h2 className="hp-section-title">Học phổ thông</h2>
            <Link to="/pho-thong" className="hp-section-link">
              Xem tất cả <FiChevronRight size={13} />
            </Link>
          </div>
          <div className="hp-section-cards">
            {SUBJECTS.map(s => (
              <MiniCard
                key={s.to}
                to={s.to}
                iconEl={<span className="hp-subject-icon">{s.icon}</span>}
                iconVariant={s.variant}
                title={s.title}
                sub={s.sub}
              />
            ))}
          </div>
        </div>

        <div className="hp-section">
          <div className="hp-section-hd">
            <h2 className="hp-section-title">Kỹ năng nghề nghiệp</h2>
            <Link to="/skill-paths" className="hp-section-link">
              Khám phá <FiChevronRight size={13} />
            </Link>
          </div>
          <div className="hp-section-cards">
            {loading
              ? [1, 2].map(i => <SkeletonCard key={i} />)
              : paths.map(p => (
                  <MiniCard
                    key={p.slug}
                    to={`/skill-paths/${p.slug}`}
                    iconEl={<FiCode size={18} />}
                    iconVariant="purple"
                    title={p.title}
                    sub={(p.description || '').slice(0, 58) + '…'}
                  />
                ))
            }
          </div>
        </div>

      </section>

      {/* ══ BOTTOM ════════════════════════════════════════════ */}
      <section className="hp-bottom">
        <PracticeCard user={user} />
        <StatsCard />
      </section>

    </div>
  );
};

export default HomePage;
