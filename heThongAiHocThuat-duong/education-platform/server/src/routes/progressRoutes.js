const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProgressOverview, completeLesson, getChapterProgress, getHeatmap, getCoursesInProgress } = require('../controllers/progressController');

router.get('/overview', auth, getProgressOverview);
router.post('/lesson/:lessonId/complete', auth, completeLesson);
router.get('/chapter/:chapterId', auth, getChapterProgress);
router.get('/heatmap', auth, getHeatmap);
router.get('/courses', auth, getCoursesInProgress);

module.exports = router;
