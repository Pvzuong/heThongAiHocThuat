-- Bảng lưu kết quả mỗi phiên luyện tập nhanh
CREATE TABLE practice_sessions (
  id               SERIAL PRIMARY KEY,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  grade_slug       VARCHAR(100) NOT NULL,
  subject_slug     VARCHAR(100) NOT NULL,
  chapter_id       INT,              -- NULL = tất cả chương
  difficulty       INT NOT NULL,     -- 1: Dễ | 2: Trung bình | 3: Khó
  total_questions  INT DEFAULT 0,
  correct_count    INT DEFAULT 0,
  wrong_count      INT DEFAULT 0,
  score            INT DEFAULT 0,
  max_streak       INT DEFAULT 0,    -- chuỗi đúng liên tiếp dài nhất
  duration_seconds INT DEFAULT 0,   -- thời gian thực tế đã dùng (giây)
  played_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id, played_at DESC);
CREATE INDEX idx_practice_sessions_rank ON practice_sessions(score DESC, played_at DESC);
CREATE INDEX idx_practice_sessions_subject ON practice_sessions(grade_slug, subject_slug, difficulty);
