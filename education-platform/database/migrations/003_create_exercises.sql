CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'fill_blank', 'matching');

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    exercise_type exercise_type NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    options JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    difficulty INT DEFAULT 1,           -- 1: dễ, 2: trung bình, 3: khó
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Ví dụ JSONB:
-- multiple_choice:
--   options: ["5", "6", "7", "8"]
--   correct_answer: {"answer": "7"}
--
-- fill_blank:
--   question_text: "3 + ___ = 7"
--   correct_answer: {"answer": "4"}
--
-- matching:
--   options: {"left": ["3+2", "4+1", "2+3"], "right": ["5", "5", "5"]}
--   correct_answer: {"pairs": [[0,0], [1,0], [2,0]]}

CREATE INDEX idx_exercises_lesson ON exercises(lesson_id, sort_order);
