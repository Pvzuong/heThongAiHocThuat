-- ============================================================
-- SKILL PATHS
-- ============================================================

INSERT INTO skill_paths (title, slug, description, estimated_hours, difficulty, sort_order) VALUES
('Frontend Developer', 'frontend-developer', 'Lộ trình học lập trình Frontend từ cơ bản đến nâng cao: HTML, CSS, JavaScript, React', 120, 'beginner', 1),
('Backend Developer', 'backend-developer', 'Lộ trình học lập trình Backend: Node.js, REST API, Database, Authentication', 100, 'beginner', 2);

-- ============================================================
-- MODULES - FRONTEND (path_id = 1)
-- ============================================================
INSERT INTO skill_modules (path_id, title, slug, description, sort_order, estimated_hours) VALUES
(1, 'HTML/CSS Basics', 'html-css-basics', 'Nền tảng xây dựng giao diện web với HTML và CSS', 1, 25),
(1, 'JavaScript Fundamentals', 'javascript-fundamentals', 'Ngôn ngữ lập trình JavaScript từ cơ bản đến ES6+', 2, 35),
(1, 'React', 'react', 'Thư viện React để xây dựng giao diện người dùng động', 3, 40),
(1, 'Advanced Frontend', 'advanced-frontend', 'Tối ưu hiệu năng, testing và các kỹ thuật nâng cao', 4, 20);

-- MODULES - BACKEND (path_id = 2)
INSERT INTO skill_modules (path_id, title, slug, description, sort_order, estimated_hours) VALUES
(2, 'Node.js Basics', 'nodejs-basics', 'Lập trình phía server với Node.js và npm ecosystem', 1, 20),
(2, 'REST API Design', 'rest-api-design', 'Thiết kế và xây dựng RESTful API với Express.js', 2, 25),
(2, 'Database & SQL', 'database-sql', 'Cơ sở dữ liệu quan hệ với PostgreSQL và SQL cơ bản', 3, 30),
(2, 'Authentication & Security', 'authentication-security', 'Xác thực người dùng, JWT, bảo mật ứng dụng web', 4, 25);

-- ============================================================
-- SKILL LESSONS (tất cả content_html = NULL - placeholder)
-- ============================================================

-- Frontend Module 1: HTML/CSS (module_id = 1)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(1, 'HTML Tags cơ bản', 'html-tags-co-ban', NULL, 1),
(1, 'CSS Selectors và Box Model', 'css-selectors-box-model', NULL, 2),
(1, 'Flexbox và Grid Layout', 'flexbox-grid-layout', NULL, 3);

-- Frontend Module 2: JavaScript (module_id = 2)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(2, 'Biến, kiểu dữ liệu và toán tử', 'bien-kieu-du-lieu-toan-tu', NULL, 1),
(2, 'Hàm, vòng lặp và điều kiện', 'ham-vong-lap-dieu-kien', NULL, 2),
(2, 'DOM Manipulation và Events', 'dom-manipulation-events', NULL, 3);

-- Frontend Module 3: React (module_id = 3)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(3, 'Components và Props', 'components-va-props', NULL, 1),
(3, 'State và Hooks (useState, useEffect)', 'state-va-hooks', NULL, 2),
(3, 'React Router và quản lý state', 'react-router-quan-ly-state', NULL, 3);

-- Frontend Module 4: Advanced (module_id = 4)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(4, 'Performance Optimization', 'performance-optimization', NULL, 1),
(4, 'Testing với Jest và React Testing Library', 'testing-jest-rtl', NULL, 2),
(4, 'Deploy và CI/CD cơ bản', 'deploy-cicd', NULL, 3);

-- Backend Module 1: Node.js (module_id = 5)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(5, 'Node.js và npm cơ bản', 'nodejs-npm-co-ban', NULL, 1),
(5, 'File System và Async/Await', 'file-system-async-await', NULL, 2),
(5, 'HTTP Module và Express setup', 'http-module-express-setup', NULL, 3);

-- Backend Module 2: REST API (module_id = 6)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(6, 'RESTful API Design principles', 'restful-api-design', NULL, 1),
(6, 'Middleware và Error Handling', 'middleware-error-handling', NULL, 2),
(6, 'Validation và Input Sanitization', 'validation-input-sanitization', NULL, 3);

-- Backend Module 3: Database (module_id = 7)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(7, 'SQL cơ bản: SELECT, INSERT, UPDATE, DELETE', 'sql-co-ban', NULL, 1),
(7, 'JOIN, Index và Query Optimization', 'join-index-optimization', NULL, 2),
(7, 'Kết nối PostgreSQL với Node.js', 'ket-noi-postgresql-nodejs', NULL, 3);

-- Backend Module 4: Auth & Security (module_id = 8)
INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order) VALUES
(8, 'JWT Authentication', 'jwt-authentication', NULL, 1),
(8, 'Password Hashing và Session', 'password-hashing-session', NULL, 2),
(8, 'CORS, Rate Limiting và Security Headers', 'cors-rate-limiting-security', NULL, 3);

-- ============================================================
-- PLACEMENT TESTS
-- ============================================================

INSERT INTO placement_tests (path_id, title, description, is_active) VALUES
(1, 'Đánh giá trình độ Frontend', 'Bài kiểm tra giúp xác định bạn nên bắt đầu học từ module nào trong lộ trình Frontend Developer', true),
(2, 'Đánh giá trình độ Backend', 'Bài kiểm tra giúp xác định bạn nên bắt đầu học từ module nào trong lộ trình Backend Developer', true);

-- Câu hỏi Placement Test Frontend (test_id = 1)
INSERT INTO placement_questions (test_id, question_text, options, correct_answer, module_id, sort_order) VALUES
-- HTML/CSS questions (module_id = 1)
(1, 'Thẻ HTML nào dùng để tạo tiêu đề lớn nhất?',
  '["<h6>", "<h1>", "<title>", "<header>"]',
  '{"answer": "<h1>"}', 1, 1),

(1, 'Thuộc tính CSS nào dùng để thay đổi màu chữ?',
  '["background-color", "font-size", "color", "border"]',
  '{"answer": "color"}', 1, 2),

-- JavaScript questions (module_id = 2)
(1, 'Kết quả của typeof "hello" là gì?',
  '["string", "text", "char", "object"]',
  '{"answer": "string"}', 2, 3),

(1, 'Cách khai báo biến trong JavaScript hiện đại (ES6+)?',
  '["var x = 1", "let x = 1", "int x = 1", "string x = 1"]',
  '{"answer": "let x = 1"}', 2, 4),

-- React questions (module_id = 3)
(1, 'Hook nào dùng để quản lý state trong React?',
  '["useEffect", "useState", "useContext", "useRef"]',
  '{"answer": "useState"}', 3, 5),

(1, 'Props trong React là gì?',
  '["Dữ liệu nội bộ của component", "Dữ liệu truyền từ component cha xuống con", "Hook để fetch API", "CSS class của component"]',
  '{"answer": "Dữ liệu truyền từ component cha xuống con"}', 3, 6);

-- Câu hỏi Placement Test Backend (test_id = 2)
INSERT INTO placement_questions (test_id, question_text, options, correct_answer, module_id, sort_order) VALUES
-- Node.js questions (module_id = 5)
(2, 'Node.js chạy JavaScript ở đâu?',
  '["Trình duyệt", "Server (máy chủ)", "Database", "Mobile app"]',
  '{"answer": "Server (máy chủ)"}', 5, 1),

(2, 'npm là viết tắt của?',
  '["Node Package Manager", "New Project Module", "Node Program Method", "None"]',
  '{"answer": "Node Package Manager"}', 5, 2),

-- REST API questions (module_id = 6)
(2, 'HTTP method nào dùng để tạo mới dữ liệu?',
  '["GET", "POST", "PUT", "DELETE"]',
  '{"answer": "POST"}', 6, 3),

(2, 'Status code 404 có nghĩa là?',
  '["OK", "Server Error", "Not Found", "Unauthorized"]',
  '{"answer": "Not Found"}', 6, 4),

-- Database questions (module_id = 7)
(2, 'Câu lệnh SQL nào dùng để lấy dữ liệu?',
  '["INSERT", "UPDATE", "SELECT", "DELETE"]',
  '{"answer": "SELECT"}', 7, 5),

(2, 'PRIMARY KEY trong SQL dùng để làm gì?',
  '["Mã hoá dữ liệu", "Định danh duy nhất mỗi dòng", "Liên kết 2 bảng", "Tạo index tự động"]',
  '{"answer": "Định danh duy nhất mỗi dòng"}', 7, 6);
