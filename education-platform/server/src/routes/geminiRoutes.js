const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateQuestions, generateTest,
  getMyCollections, getCollectionDetail, deleteCollection,
  updateQuestion, deleteQuestion, regenerateQuestion,
  cloneCollection, submitCollectionResult,
} = require('../controllers/geminiController');

router.use(auth);

// Collections
router.post('/generate-questions', generateQuestions);
router.post('/generate-test', generateTest);
router.get('/collections', getMyCollections);
router.get('/collections/:id', getCollectionDetail);
router.delete('/collections/:id', deleteCollection);
router.post('/collections/:id/submit', submitCollectionResult);
router.post('/collections/:id/clone', cloneCollection);

// Question CRUD
router.put('/collections/:id/questions/:qid', updateQuestion);
router.delete('/collections/:id/questions/:qid', deleteQuestion);
router.post('/collections/:id/questions/:qid/regenerate', regenerateQuestion);

module.exports = router;
