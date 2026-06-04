const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlacementStatus,
  getPlacementTest,
  submitPlacementTest,
} = require('../controllers/placementController');

// GET /api/placement/:gradeSlug/:subjectSlug/status
router.get('/:gradeSlug/:subjectSlug/status', auth, getPlacementStatus);

// GET /api/placement/:gradeSlug/:subjectSlug/test
router.get('/:gradeSlug/:subjectSlug/test', auth, getPlacementTest);

// POST /api/placement/:gradeSlug/:subjectSlug/submit
router.post('/:gradeSlug/:subjectSlug/submit', auth, submitPlacementTest);

module.exports = router;
