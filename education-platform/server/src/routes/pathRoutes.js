const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPaths,
  getPathBySlug,
  getModuleById,
  getSkillLessonById,
  getPlacementTest,
  submitPlacementTest,
} = require('../controllers/pathController');

// Thứ tự quan trọng: route tĩnh phải đứng trước route động
router.get('/', getPaths);
router.get('/modules/:moduleId', getModuleById);
router.get('/lessons/:lessonId', getSkillLessonById);
router.post('/placement-test/:testId/submit', auth, submitPlacementTest);
router.get('/:pathSlug/placement-test', getPlacementTest);
router.get('/:pathSlug', getPathBySlug);

module.exports = router;
