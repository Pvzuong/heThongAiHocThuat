# Frontend — React + Vite

Frontend của nền tảng giáo dục **HeThongAiHocThuat**.

## Chạy dev

```bash
npm install
npm run dev   # http://localhost:5173
```

> Cần backend đang chạy tại `http://localhost:5000` trước.

## Build production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── api/           # Axios API calls (authApi, lessonApi, pathApi, adminApi, searchApi...)
├── components/    # LoadingSpinner, ProtectedRoute, Layout (Navbar/Footer)
├── contexts/      # AuthContext, ToastContext
├── hooks/         # useAuth
├── pages/
│   ├── Auth/      # LoginPage, RegisterPage, OTPPage
│   ├── Home/      # HomePage
│   ├── PhoThong/  # GradeList, ChapterList, LessonDetail, ExercisePage
│   ├── DaiHoc/    # PathList, PathDetail, ModuleDetail, SkillLessonDetail, PlacementTest
│   ├── Dashboard/ # DashboardPage
│   ├── Admin/     # AdminLayout, ManageUsers, ManageLessons, GeminiSettings
│   └── Search/    # SearchPage
├── styles/
│   └── global.css # Design system (màu, button, form, responsive...)
├── utils/
│   └── tokenHelper.js  # Lưu access token trong memory
└── App.jsx        # Routes + Providers
```

## Proxy API

Vite proxy `/api` → `http://localhost:5000` (cấu hình trong `vite.config.js`).
Không cần CORS khi dev local.

## Xem toàn bộ hướng dẫn setup

Xem file [README.md](../README.md) ở thư mục gốc `education-platform/`.
