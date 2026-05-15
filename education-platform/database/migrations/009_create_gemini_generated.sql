-- Migration 009: Gemini AI Question Generator
-- Tạo 4 bảng để lưu bộ câu hỏi sinh bằng AI

CREATE TABLE question_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_name VARCHAR(255) NOT NULL,
    grade_number INT NOT NULL,
    subject VARCHAR(50) DEFAULT 'toan',
    topic VARCHAR(255),
    difficulty VARCHAR(20) NOT NULL,
    question_count INT NOT NULL,
    duration_minutes INT,
    is_test BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES question_collections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    options JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_question_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES question_collections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES generated_questions(id) ON DELETE CASCADE,
    user_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_session_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES question_collections(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percent DECIMAL(5,2) NOT NULL,
    time_spent_seconds INT,
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gen_questions_collection ON generated_questions(collection_id, sort_order);
CREATE INDEX idx_gen_attempts_user ON generated_question_attempts(user_id, collection_id);
CREATE INDEX idx_gen_results_user ON generated_session_results(user_id);
CREATE INDEX idx_collections_user ON question_collections(user_id, created_at DESC);
