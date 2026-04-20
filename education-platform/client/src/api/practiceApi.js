import axiosInstance from './axiosInstance';

// Lấy câu hỏi luyện tập
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
