const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  getUsers, updateUser, deleteUser,
  createChapter, updateChapter, deleteChapter,
  createLesson, updateLesson, deleteLesson,
  createExercise, updateExercise, deleteExercise,
  createSkillModule, updateSkillModule, deleteSkillModule,
  createSkillLesson, updateSkillLesson, deleteSkillLesson,
  getSubjects, createSubject, updateSubject, deleteSubjectFromGrade,
} = require('../controllers/adminController');
const { getGeminiSettings, updateGeminiSettings, testGenerate } = require('../controllers/geminiController');

// Tất cả admin routes đều cần auth + role admin
router.use(auth, requireRole('admin'));

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Chapters
router.post('/chapters', createChapter);
router.put('/chapters/:id', updateChapter);
router.delete('/chapters/:id', deleteChapter);

// Lessons
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Exercises
router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

// Skill modules
router.post('/skill-modules', createSkillModule);
router.put('/skill-modules/:id', updateSkillModule);
router.delete('/skill-modules/:id', deleteSkillModule);

// Skill lessons
router.post('/skill-lessons', createSkillLesson);
router.put('/skill-lessons/:id', updateSkillLesson);
router.delete('/skill-lessons/:id', deleteSkillLesson);

// Subjects (môn học)
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
// Xoá môn khỏi lớp — dùng /grade-subjects/:id để tránh xung đột với /subjects/:id
router.delete('/grade-subjects/:gradeSubjectId', deleteSubjectFromGrade);

// Gemini
router.get('/gemini/settings', getGeminiSettings);
router.put('/gemini/settings', updateGeminiSettings);
router.post('/gemini/generate', testGenerate);

module.exports = router;
