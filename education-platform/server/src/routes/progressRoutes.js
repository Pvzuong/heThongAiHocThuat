const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProgressOverview, completeLesson, getChapterProgress } = require('../controllers/progressController');

router.get('/overview', auth, getProgressOverview);
router.post('/lesson/:lessonId/complete', auth, completeLesson);
router.get('/chapter/:chapterId', auth, getChapterProgress);

module.exports = router;
