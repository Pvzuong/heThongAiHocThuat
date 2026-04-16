const express = require('express');
const router = express.Router();
const { getGrades, getSubjectsByGrade } = require('../controllers/gradeController');

router.get('/', getGrades);
router.get('/:gradeSlug/subjects', getSubjectsByGrade);

module.exports = router;
