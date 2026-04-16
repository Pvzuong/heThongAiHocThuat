-- Database Schema for Hệ thống AI Học thuật (Personalized Learning System)
-- PostgreSQL Database Setup với cấu trúc tiếng Việt

-- Create database
CREATE DATABASE he_thong_ai_hoc_thuat
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Connect to the database
\c he_thong_ai_hoc_thuat;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng Role (Vai trò)
CREATE TABLE Role (
    MaRole SERIAL PRIMARY KEY,
    Ten VARCHAR(100) NOT NULL,
    ChucVu VARCHAR(100)
);

-- Bảng nguoi_dung (Người dùng)
CREATE TABLE nguoi_dung (
    Ma_nguoi_dung SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    Ho_ten VARCHAR(255),
    Vai_tro INT,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role
    FOREIGN KEY (Vai_tro)
    REFERENCES Role(MaRole)
);

-- Bảng mon_hoc (Môn học)
CREATE TABLE mon_hoc (
    Ma_MH SERIAL PRIMARY KEY,
    Ten_MH VARCHAR(255) NOT NULL,
    Mo_ta TEXT,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chuong (Chương)
CREATE TABLE chuong (
    Ma_chuong SERIAL PRIMARY KEY,
    Ten_chuong VARCHAR(255),
    Thu_tu_chuong INT,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Ma_MH INT,
    CONSTRAINT fk_monhoc
    FOREIGN KEY (Ma_MH)
    REFERENCES mon_hoc(Ma_MH)
);

-- Bảng bai_hoc (Bài học)
CREATE TABLE bai_hoc (
    Ma_BH SERIAL PRIMARY KEY,
    Tieu_de VARCHAR(255),
    Noi_dung TEXT,
    Loai_noi_dung VARCHAR(100),
    Thu_tu_BH INT,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Ma_chuong INT,
    CONSTRAINT fk_chuong
    FOREIGN KEY (Ma_chuong)
    REFERENCES chuong(Ma_chuong)
);

-- Bảng cau_hoi (Câu hỏi)
CREATE TABLE cau_hoi (
    Ma_CH SERIAL PRIMARY KEY,
    Loai VARCHAR(100),
    Do_kho VARCHAR(50),
    Chu_de VARCHAR(255),
    Noi_dung TEXT,
    Lua_chon TEXT,
    Dap_an VARCHAR(255),
    Giai_thich TEXT,
    Trang_thai BOOLEAN DEFAULT TRUE,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Ma_BH INT,
    Ma_MH INT,

    CONSTRAINT fk_baihoc
        FOREIGN KEY (Ma_BH)
        REFERENCES bai_hoc(Ma_BH),

    CONSTRAINT fk_monhoc_ch
        FOREIGN KEY (Ma_MH)
        REFERENCES mon_hoc(Ma_MH)
);

-- Bảng mau_cau_hoi (Mẫu câu hỏi)
CREATE TABLE mau_cau_hoi (
    Ma_mau SERIAL PRIMARY KEY,
    Chu_de VARCHAR(255),
    Do_kho VARCHAR(50),
    Noi_dung TEXT,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Ma_nguoi_dung INT,
    CONSTRAINT fk_user_template
    FOREIGN KEY (Ma_nguoi_dung)
    REFERENCES nguoi_dung(Ma_nguoi_dung)
);

-- Bảng ket_qua_dau_vao (Kết quả đầu vào)
CREATE TABLE ket_qua_dau_vao (
    Ma_KQ SERIAL PRIMARY KEY,
    Diem_chu_de JSONB,
    Cap_do VARCHAR(100),
    Ngay_hoan_thanh TIMESTAMP,

    Ma_nguoi_dung INT,
    Ma_MH INT,

    CONSTRAINT fk_user_kq
        FOREIGN KEY (Ma_nguoi_dung)
        REFERENCES nguoi_dung(Ma_nguoi_dung),

    CONSTRAINT fk_monhoc_kq
        FOREIGN KEY (Ma_MH)
        REFERENCES mon_hoc(Ma_MH)
);

-- Bảng lo_trinh_hoc (Lộ trình học)
CREATE TABLE lo_trinh_hoc (
    Ma_LT SERIAL PRIMARY KEY,
    Danh_sach_bai JSONB,
    Ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Ngay_cap_nhat TIMESTAMP,

    Ma_nguoi_dung INT,
    Ma_MH INT,

    CONSTRAINT fk_user_lt
        FOREIGN KEY (Ma_nguoi_dung)
        REFERENCES nguoi_dung(Ma_nguoi_dung),

    CONSTRAINT fk_monhoc_lt
        FOREIGN KEY (Ma_MH)
        REFERENCES mon_hoc(Ma_MH)
);

-- Bảng bai_kiem_tra (Bài kiểm tra)
CREATE TABLE bai_kiem_tra (
    Ma_BKT SERIAL PRIMARY KEY,
    Trang_thai VARCHAR(50),
    Diem_so FLOAT,
    Thoi_gian_lam INT,
    Ngay_hoan_thanh TIMESTAMP,

    Ma_nguoi_dung INT,
    Ma_MH INT,
    Ma_BH INT,

    CONSTRAINT fk_user_bkt  FOREIGN KEY (Ma_nguoi_dung)
        REFERENCES nguoi_dung(Ma_nguoi_dung),

    CONSTRAINT fk_monhoc_bkt
        FOREIGN KEY (Ma_MH)
        REFERENCES mon_hoc(Ma_MH),

    CONSTRAINT fk_baihoc_bkt
        FOREIGN KEY (Ma_BH)
        REFERENCES bai_hoc(Ma_BH)
);

-- Bảng cau_tra_loi (Câu trả lời)
CREATE TABLE cau_tra_loi (
    Ma_CTL SERIAL PRIMARY KEY,
    CTL_nguoi_dung TEXT,
    Dung BOOLEAN,
    Thoi_gian_lam INT,

    Ma_BKT INT,
    Ma_CH INT,

    CONSTRAINT fk_bkt_ctl
    FOREIGN KEY (Ma_BKT)
    REFERENCES bai_kiem_tra(Ma_BKT),

    CONSTRAINT fk_ch_ctl
    FOREIGN KEY (Ma_CH)
    REFERENCES cau_hoi(Ma_CH)
);

-- Tạo indexes để tối ưu performance
CREATE INDEX idx_nguoi_dung_email ON nguoi_dung(email);
CREATE INDEX idx_nguoi_dung_vai_tro ON nguoi_dung(Vai_tro);
CREATE INDEX idx_mon_hoc_ten ON mon_hoc(Ten_MH);
CREATE INDEX idx_chuong_monhoc ON chuong(Ma_MH);
CREATE INDEX idx_bai_hoc_chuong ON bai_hoc(Ma_chuong);
CREATE INDEX idx_cau_hoi_baihoc ON cau_hoi(Ma_BH);
CREATE INDEX idx_cau_hoi_monhoc ON cau_hoi(Ma_MH);
CREATE INDEX idx_bai_kiem_tra_user ON bai_kiem_tra(Ma_nguoi_dung);
CREATE INDEX idx_lo_trinh_hoc_user ON lo_trinh_hoc(Ma_nguoi_dung);

-- Insert dữ liệu mẫu
INSERT INTO Role (Ten, ChucVu) VALUES
('Admin', 'Quản trị viên hệ thống'),
('Teacher', 'Giảng viên'),
('Student', 'Học viên');

INSERT INTO nguoi_dung (email, password_hash, Ho_ten, Vai_tro) VALUES
('admin@hethongai.edu.vn', '$2b$10$dummy.hash.for.demo', 'Quản trị viên', 1),
('teacher@hethongai.edu.vn', '$2b$10$dummy.hash.for.demo', 'Giảng viên Demo', 2),
('student@hethongai.edu.vn', '$2b$10$dummy.hash.for.demo', 'Học viên Demo', 3);

INSERT INTO mon_hoc (Ten_MH, Mo_ta) VALUES
('Toán học', 'Môn học cơ bản về toán học'),
('Ngôn ngữ lập trình Python', 'Khóa học lập trình Python từ cơ bản đến nâng cao'),
('Trí tuệ nhân tạo', 'Giới thiệu về AI và Machine Learning');

INSERT INTO chuong (Ten_chuong, Thu_tu_chuong, Ma_MH) VALUES
('Chương 1: Số học', 1, 1),
('Chương 2: Đại số', 2, 1),
('Chương 1: Cài đặt Python', 1, 2),
('Chương 2: Cấu trúc dữ liệu', 2, 2);

INSERT INTO bai_hoc (Tieu_de, Noi_dung, Loai_noi_dung, Thu_tu_BH, Ma_chuong) VALUES
('Bài 1: Phép cộng', 'Nội dung bài học về phép cộng', 'text', 1, 1),
('Bài 2: Phép nhân', 'Nội dung bài học về phép nhân', 'video', 2, 1),
('Bài 1: Cài đặt Python', 'Hướng dẫn cài đặt Python', 'text', 1, 3),
('Bài 2: Hello World', 'Viết chương trình đầu tiên', 'interactive', 2, 3);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE he_thong_ai_hoc_thuat TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Comments for documentation
COMMENT ON DATABASE he_thong_ai_hoc_thuat IS 'Database for Hệ thống AI Học thuật - Personalized Learning Platform';
COMMENT ON TABLE nguoi_dung IS 'Bảng chứa thông tin người dùng';
COMMENT ON TABLE mon_hoc IS 'Bảng chứa thông tin môn học';
COMMENT ON TABLE chuong IS 'Bảng chứa thông tin chương';
COMMENT ON TABLE bai_hoc IS 'Bảng chứa thông tin bài học';
COMMENT ON TABLE cau_hoi IS 'Bảng chứa câu hỏi trắc nghiệm';
COMMENT ON TABLE lo_trinh_hoc IS 'Bảng chứa lộ trình học cá nhân hóa';