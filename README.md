# Hệ thống AI Học thuật - Personalized Learning Platform

Nền tảng học tập cá nhân hóa tích hợp trí tuệ nhân tạo, được xây dựng với React + Vite.

## 🚀 Tính năng chính

- **Học tập cá nhân hóa**: AI phân tích kết quả đầu vào và tạo lộ trình học phù hợp
- **Quản lý môn học**: Tổ chức nội dung theo môn học → chương → bài học
- **Ngân hàng câu hỏi**: Hệ thống câu hỏi trắc nghiệm với nhiều độ khó
- **Bài kiểm tra tự động**: Tạo bài kiểm tra và chấm điểm tự động
- **Theo dõi tiến độ**: Giám sát quá trình học tập của học viên
- **Mẫu câu hỏi**: Thư viện câu hỏi mẫu cho giảng viên

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19 + Vite
- **Backend**: Node.js + Express (sẽ được thêm)
- **Database**: PostgreSQL
- **AI/ML**: Python + TensorFlow/PyTorch (sẽ được tích hợp)
- **Styling**: CSS Modules + Tailwind CSS (sẽ được thêm)

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm hoặc yarn

## ⚡ Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd heThongAiHocThuat
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Thiết lập Database

#### Cài đặt PostgreSQL

- Tải và cài đặt PostgreSQL từ [postgresql.org](https://www.postgresql.org/download/)
- Tạo user và database mới

#### Chạy script database

```bash
# Kết nối đến PostgreSQL và chạy file database.sql
psql -U postgres -d postgres -f database.sql
```

#### Hoặc sử dụng pgAdmin

1. Mở pgAdmin
2. Tạo database mới: `he_thong_ai_hoc_thuat`
3. Chạy file `database.sql` trong Query Tool

### 4. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/he_thong_ai_hoc_thuat
JWT_SECRET=your-secret-key
AI_API_KEY=your-ai-api-key
```

### 5. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173

## 📁 Cấu trúc dự án

```
heThongAiHocThuat/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS styles
│   └── lib/               # Library configurations
├── database.sql           # PostgreSQL schema
├── package.json
├── vite.config.js
└── README.md
```

## 🗄️ Cấu trúc Database

Database bao gồm các bảng chính:

### 👥 Quản lý người dùng

- **`Role`** - Định nghĩa vai trò (Admin, Teacher, Student)
- **`nguoi_dung`** - Thông tin tài khoản người dùng

### 📚 Quản lý nội dung học tập

- **`mon_hoc`** - Danh mục môn học
- **`chuong`** - Các chương trong môn học
- **`bai_hoc`** - Bài học cụ thể

### ❓ Hệ thống câu hỏi và kiểm tra

- **`cau_hoi`** - Ngân hàng câu hỏi trắc nghiệm
- **`mau_cau_hoi`** - Mẫu câu hỏi cho giảng viên
- **`bai_kiem_tra`** - Bài kiểm tra của học viên
- **`cau_tra_loi`** - Câu trả lời của học viên

### 🤖 AI và cá nhân hóa

- **`ket_qua_dau_vao`** - Kết quả bài test đầu vào
- **`lo_trinh_hoc`** - Lộ trình học cá nhân hóa

Chi tiết schema xem file `database.sql`.

## 🔧 Scripts có sẵn

```bash
npm run dev          # Chạy dev server
npm run build        # Build cho production
npm run preview      # Preview build
npm run lint         # Chạy ESLint
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phân phối dưới giấy phép MIT.

## 📧 Liên hệ

- Email: contact@hethongai.edu.vn
- Website: https://hethongai.edu.vn
