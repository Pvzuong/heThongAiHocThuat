const express = require('express');
const router = express.Router();
const { getChaptersBySubject } = require('../controllers/chapterController');

router.get('/:gradeSlug/:subjectSlug/chapters', getChaptersBySubject);

module.exports = router;
