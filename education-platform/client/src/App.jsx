import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/global.css';

// Pages tải ngay
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import OTPPage from './pages/Auth/OTPPage';

// Pages lazy load (bước 7-9 sẽ implement)
const GradeList         = lazy(() => import('./pages/PhoThong/GradeList'));
const SubjectList       = lazy(() => import('./pages/PhoThong/SubjectList'));
const ChapterList       = lazy(() => import('./pages/PhoThong/ChapterList'));
const LessonDetail      = lazy(() => import('./pages/PhoThong/LessonDetail'));
const ExercisePage      = lazy(() => import('./pages/PhoThong/ExercisePage'));

const PathList          = lazy(() => import('./pages/DaiHoc/PathList'));
const PathDetail        = lazy(() => import('./pages/DaiHoc/PathDetail'));
const ModuleDetail      = lazy(() => import('./pages/DaiHoc/ModuleDetail'));
const PlacementTest     = lazy(() => import('./pages/DaiHoc/PlacementTest'));
const SkillLessonDetail = lazy(() => import('./pages/DaiHoc/SkillLessonDetail'));

const DashboardPage     = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ProfilePage       = lazy(() => import('./pages/Profile/ProfilePage'));
const AdminLayout       = lazy(() => import('./pages/Admin/AdminLayout'));
const SearchPage        = lazy(() => import('./pages/Search/SearchPage'));

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth — không có Navbar/Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />

          {/* Main layout — có Navbar + Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Phổ thông */}
            <Route path="/pho-thong" element={<GradeList />} />
            <Route path="/pho-thong/:gradeSlug" element={<SubjectList />} />
            <Route path="/pho-thong/:gradeSlug/:subjectSlug" element={<ChapterList />} />
            <Route path="/lesson/:lessonId" element={<LessonDetail />} />
            <Route path="/lesson/:lessonId/exercises" element={
              <ProtectedRoute><ExercisePage /></ProtectedRoute>
            } />

            {/* Skill paths */}
            <Route path="/skill-paths" element={<PathList />} />
            <Route path="/skill-paths/:pathSlug" element={<PathDetail />} />
            <Route path="/skill-paths/:pathSlug/placement-test" element={<PlacementTest />} />
            <Route path="/skill-paths/module/:moduleId" element={<ModuleDetail />} />
            <Route path="/skill-paths/lesson/:lessonId" element={<SkillLessonDetail />} />

            {/* Search */}
            <Route path="/search" element={<SearchPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />

            {/* Profile */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Admin — AdminLayout dùng Routes nội bộ với /* */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
            } />

          </Route>
        </Routes>
      </Suspense>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
