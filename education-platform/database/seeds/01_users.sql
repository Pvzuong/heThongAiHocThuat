-- Seed users
-- Mật khẩu: student@test.com → password123
--           admin@test.com   → admin123
-- Hash được tạo bằng bcryptjs với 10 rounds

INSERT INTO users (email, password_hash, display_name, role, is_active, is_verified) VALUES
(
  'student@test.com',
  '$2b$10$Vy7hcyZySgCQCZyTeCh.f.61//cq9DKBG5u1b/Q60Eboa4q56kvra',
  'Học Sinh Test',
  'student',
  true,
  true
),
(
  'admin@test.com',
  '$2b$10$jdTQoxx.P6Wq0KHYUwj0zunqH3RZDuJ3DaC3p5jLX1wh/qFh9mSfS',
  'Admin Test',
  'admin',
  true,
  true
);
