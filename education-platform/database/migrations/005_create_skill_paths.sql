CREATE TABLE skill_paths (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    estimated_hours INT,
    difficulty VARCHAR(20) DEFAULT 'beginner',  -- beginner, intermediate, advanced
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_modules (
    id SERIAL PRIMARY KEY,
    path_id INT REFERENCES skill_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    estimated_hours INT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE skill_lessons (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES skill_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content_html TEXT,                  -- NULL = placeholder "Nội dung sắp có"
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_path_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_id INT REFERENCES skill_paths(id) ON DELETE CASCADE,
    current_module_id INT REFERENCES skill_modules(id),
    current_lesson_id INT REFERENCES skill_lessons(id),
    progress_percent DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, path_id)
);

CREATE TABLE placement_tests (
    id SERIAL PRIMARY KEY,
    path_id INT REFERENCES skill_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE placement_questions (
    id SERIAL PRIMARY KEY,
    test_id INT REFERENCES placement_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    module_id INT REFERENCES skill_modules(id),
    sort_order INT DEFAULT 0
);

CREATE TABLE placement_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id INT REFERENCES placement_tests(id),
    score JSONB,
    recommended_start_module_id INT REFERENCES skill_modules(id),
    taken_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skill_modules_path ON skill_modules(path_id, sort_order);
CREATE INDEX idx_skill_lessons_module ON skill_lessons(module_id, sort_order);
