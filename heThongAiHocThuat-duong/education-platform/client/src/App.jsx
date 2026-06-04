import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Base styles (giữ nguyên cho các trang cũ)
import './styles/global.css';
// Design System v3 (override variables + new components)
import './styles/design-system.css';
import './styles/dashboard.css';
import './styles/homepage.css';

// Pages tải ngay (auth — không lazy)
import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import OTPPage      from './pages/Auth/OTPPage';

// Student pages (lazy)
const HomePage         = lazy(() => import('./pages/Home/HomePage'));
const DashboardPage    = lazy(() => import('./pages/Dashboard/DashboardPage'));
const OnboardingPage   = lazy(() => import('./pages/Onboarding/OnboardingPage'));

const GradeList        = lazy(() => import('./pages/PhoThong/GradeList'));
const SubjectList      = lazy(() => import('./pages/PhoThong/SubjectList'));
const ChapterList      = lazy(() => import('./pages/PhoThong/ChapterList'));
const LessonDetail     = lazy(() => import('./pages/PhoThong/LessonDetail'));
const ExercisePage     = lazy(() => import('./pages/PhoThong/ExercisePage'));

const PathList         = lazy(() => import('./pages/DaiHoc/PathList'));
const PathDetail       = lazy(() => import('./pages/DaiHoc/PathDetail'));
const ModuleDetail     = lazy(() => import('./pages/DaiHoc/ModuleDetail'));
const PlacementTest    = lazy(() => import('./pages/DaiHoc/PlacementTest'));
const SkillLessonDetail= lazy(() => import('./pages/DaiHoc/SkillLessonDetail'));

const PracticeSetup    = lazy(() => import('./pages/Practice/PracticeSetup'));
const PracticeArena    = lazy(() => import('./pages/Practice/PracticeArena'));
const PracticeLeaderboard = lazy(() => import('./pages/Practice/PracticeLeaderboard'));
const AIQuestionGenerator = lazy(() => import('./pages/Practice/AIQuestionGenerator'));
const AIPracticeArena  = lazy(() => import('./pages/Practice/AIPracticeArena'));
const AIResultPage     = lazy(() => import('./pages/Practice/AIResultPage'));
const AICollectionHistory = lazy(() => import('./pages/Practice/AICollectionHistory'));
const RankingPage      = lazy(() => import('./pages/Ranking/RankingPage'));
const ProfilePage      = lazy(() => import('./pages/Profile/ProfilePage'));
const SearchPage       = lazy(() => import('./pages/Search/SearchPage'));

// Admin
const AdminLayout      = lazy(() => import('./pages/Admin/AdminLayout'));

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
          <Routes>
            {/* ── Auth (no layout) ───────────────────── */}
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/register"   element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OTPPage />} />

            {/* ── Onboarding (no layout) ─────────────── */}
            <Route path="/onboarding" element={
              <ProtectedRoute><OnboardingPage /></ProtectedRoute>
            } />

            {/* ── Main Layout ────────────────────────── */}
            <Route element={<MainLayout />}>
              <Route path="/"       element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />

              {/* Dashboard — redirect nếu chưa onboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />

              {/* Học bài phổ thông (lớp 6-12) */}
              <Route path="/pho-thong"                              element={<GradeList />} />
              <Route path="/pho-thong/:gradeSlug"                  element={<SubjectList />} />
              <Route path="/pho-thong/:gradeSlug/:subjectSlug"     element={<ChapterList />} />
              <Route path="/lesson/:lessonId"                       element={<LessonDetail />} />
              <Route path="/lesson/:lessonId/exercises"            element={
                <ProtectedRoute><ExercisePage /></ProtectedRoute>
              } />

              {/* Skill Paths */}
              <Route path="/skill-paths"                            element={<PathList />} />
              <Route path="/skill-paths/:pathSlug"                 element={<PathDetail />} />
              <Route path="/skill-paths/:pathSlug/placement-test"  element={<PlacementTest />} />
              <Route path="/skill-paths/module/:moduleId"          element={<ModuleDetail />} />
              <Route path="/skill-paths/lesson/:lessonId"          element={<SkillLessonDetail />} />

              {/* Practice */}
              <Route path="/practice"                              element={
                <ProtectedRoute><PracticeSetup /></ProtectedRoute>
              } />
              <Route path="/practice/arena"                        element={
                <ProtectedRoute><PracticeArena /></ProtectedRoute>
              } />
              <Route path="/practice/leaderboard"                  element={<PracticeLeaderboard />} />
              <Route path="/practice/ai-generator"                 element={
                <ProtectedRoute><AIQuestionGenerator /></ProtectedRoute>
              } />
              <Route path="/practice/ai-arena/:collectionId"       element={
                <ProtectedRoute><AIPracticeArena /></ProtectedRoute>
              } />
              <Route path="/practice/ai-result/:collectionId"      element={
                <ProtectedRoute><AIResultPage /></ProtectedRoute>
              } />
              <Route path="/practice/ai-history"                   element={
                <ProtectedRoute><AICollectionHistory /></ProtectedRoute>
              } />

              {/* AI Coach = AI Question Generator */}
              <Route path="/ai-coach" element={
                <ProtectedRoute><AIQuestionGenerator /></ProtectedRoute>
              } />

              {/* Ranking */}
              <Route path="/ranking" element={<RankingPage />} />

              {/* Profile */}
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
              } />

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
