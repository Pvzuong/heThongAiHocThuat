-- Migration 011: Thêm cột section và point_value cho câu hỏi đề thi
ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS section VARCHAR(10);
ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS point_value DECIMAL(4,2);
