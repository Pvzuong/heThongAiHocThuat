-- Migration 013: Tạo bảng bài kiểm tra đầu vào cho phần phổ thông
CREATE TABLE school_placement_results (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade_subject_id INT NOT NULL REFERENCES grade_subjects(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percent DECIMAL(5,2) NOT NULL,
    chapter_scores JSONB,                  -- {"chapter_id": score_percent, ...}
    mastered_chapter_ids JSONB,            -- [chapter_id1, chapter_id2, ...]
    recommended_chapter_id INT REFERENCES chapters(id),
    answers JSONB,                         -- [{"exercise_id": int, "user_answer": ..., "is_correct": bool}, ...]
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, grade_subject_id)
);

CREATE INDEX idx_placement_user ON school_placement_results(user_id);
CREATE INDEX idx_placement_grade_subject ON school_placement_results(grade_subject_id);
