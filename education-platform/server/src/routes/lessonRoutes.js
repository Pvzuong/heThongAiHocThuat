const express = require('express');
const router = express.Router();
const { getLessonById } = require('../controllers/lessonController');

router.get('/:lessonId', getLessonById);

module.exports = router;
