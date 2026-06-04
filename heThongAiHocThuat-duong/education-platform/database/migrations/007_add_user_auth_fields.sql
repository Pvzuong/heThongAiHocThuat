-- Migration 007: Thêm password_hash và is_verified vào bảng users
-- Chạy migration này nếu đã tạo DB từ migration 001 cũ (trước khi có password auth)
-- Nếu tạo DB mới từ migration 001 đã cập nhật thì KHÔNG cần chạy file này

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Các user cũ (tạo trước khi có password auth) được coi là đã xác nhận
UPDATE users SET is_verified = true WHERE is_verified = false;
