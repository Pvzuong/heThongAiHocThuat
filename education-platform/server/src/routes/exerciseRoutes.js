const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getExercisesByLesson, submitExercise } = require('../controllers/exerciseController');

router.get('/lesson/:lessonId', auth, getExercisesByLesson);
router.post('/:exerciseId/submit', auth, submitExercise);

module.exports = router;
