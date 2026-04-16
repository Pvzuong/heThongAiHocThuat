CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,          -- 'Cấp 1', 'Cấp 2', 'Cấp 3'
    slug VARCHAR(50) UNIQUE NOT NULL,   -- 'cap-1', 'cap-2', 'cap-3'
    description TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    education_level_id INT REFERENCES education_levels(id),
    grade_number INT NOT NULL,          -- 1, 2, 3, 4, 5, 6...12
    name VARCHAR(50) NOT NULL,          -- 'Lớp 1', 'Lớp 2'...
    slug VARCHAR(50) UNIQUE NOT NULL,   -- 'lop-1', 'lop-2'...
    sort_order INT DEFAULT 0
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,         -- 'Toán', 'Tiếng Việt'...
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Bảng liên kết: môn nào dạy ở lớp nào
CREATE TABLE grade_subjects (
    id SERIAL PRIMARY KEY,
    grade_id INT REFERENCES grades(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(grade_id, subject_id)
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    grade_subject_id INT REFERENCES grade_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) DEFAULT 'theory',  -- 'theory', 'example', 'practice'
    content_html TEXT,
    content_json JSONB,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapters_grade_subject ON chapters(grade_subject_id, sort_order);
CREATE INDEX idx_lessons_chapter ON lessons(chapter_id, sort_order);
