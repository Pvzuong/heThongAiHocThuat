CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE exercise_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
    user_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chapter_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
    total_lessons INT DEFAULT 0,
    completed_lessons INT DEFAULT 0,
    progress_percent DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id, exercise_id);
