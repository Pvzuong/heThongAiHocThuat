import axiosInstance from './axiosInstance';

// Lấy câu hỏi luyện tập (phổ thông)
export const getPracticeQuestions = (params) =>
  axiosInstance.get('/practice/questions', { params });

// Lưu kết quả phiên
export const savePracticeSession = (data) =>
  axiosInstance.post('/practice/sessions', data);

// Leaderboard
export const getPracticeLeaderboard = (params) =>
  axiosInstance.get('/practice/leaderboard', { params });

// Lịch sử của tôi
export const getMySessions = (params) =>
  axiosInstance.get('/practice/my-sessions', { params });

// Danh sách skill paths + modules (cho luyện tập kỹ năng)
export const getSkillPathsForPractice = () =>
  axiosInstance.get('/practice/skill-paths');

// Lấy câu hỏi theo skill path/module
export const getSkillQuestions = (params) =>
  axiosInstance.get('/practice/skill-questions', { params });
