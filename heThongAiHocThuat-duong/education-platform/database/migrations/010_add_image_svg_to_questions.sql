-- Migration 010: Thêm cột image_svg cho câu hỏi cần hình minh họa
ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS image_svg TEXT;
