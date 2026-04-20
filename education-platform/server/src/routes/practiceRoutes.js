const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPracticeQuestions,
  savePracticeSession,
  getLeaderboard,
  getMySessions,
} = require('../controllers/practiceController');

// Lấy câu hỏi — cần đăng nhập
router.get('/questions', auth, getPracticeQuestions);

// Lưu kết quả phiên — cần đăng nhập
router.post('/sessions', auth, savePracticeSession);

// Leaderboard — cần đăng nhập
router.get('/leaderboard', auth, getLeaderboard);

// Lịch sử phiên của user hiện tại — cần đăng nhập
router.get('/my-sessions', auth, getMySessions);

module.exports = router;
