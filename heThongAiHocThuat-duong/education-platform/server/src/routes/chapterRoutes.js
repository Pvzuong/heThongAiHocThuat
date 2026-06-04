const express = require('express');
const router = express.Router();
const { getLessonsByChapter } = require('../controllers/chapterController');

router.get('/:chapterId/lessons', getLessonsByChapter);

module.exports = router;
