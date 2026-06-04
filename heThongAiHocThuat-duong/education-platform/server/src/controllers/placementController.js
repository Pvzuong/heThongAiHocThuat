const pool = require('../config/db');

// Helper: Check answer correctness (reused from exerciseController)
const checkAnswer = (type, userAnswer, correctAnswer) => {
  if (type === 'multiple_choice' || type === 'fill_blank') {
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer.answer).trim().toLowerCase();
  }
  if (type === 'matching') {
    const userPairs = JSON.stringify(userAnswer?.pairs?.map(p => p.sort()) ?? []);
    const correctPairs = JSON.stringify(correctAnswer.pairs?.map(p => [...p].sort()) ?? []);
    return userPairs === correctPairs;
  }
  return false;
};

// GET /api/placement/:gradeSlug/:subjectSlug/status
// Kiểm tra xem Student đã làm placement test cho môn này chưa
const getPlacementStatus = async (req, res, next) => {
  try {
    const { gradeSlug, subjectSlug } = req.params;
    const userId = req.user.id;

    // Resolve grade_subject từ slugs
    const gradeSubjectResult = await pool.query(`
      SELECT gs.id
      FROM grade_subjects gs
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id
      WHERE g.slug = $1 AND s.slug = $2 AND gs.is_active = true
      LIMIT 1
    `, [gradeSlug, subjectSlug]);

    if (gradeSubjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy môn học này' });
    }

    const gradeSubjectId = gradeSubjectResult.rows[0].id;

    // Kiểm tra xem user đã làm placement test cho môn này chưa
    const placementResult = await pool.query(`
      SELECT
        id,
        total_questions,
        correct_count,
        score_percent,
        chapter_scores,
        mastered_chapter_ids,
        recommended_chapter_id,
        taken_at
      FROM school_placement_results
      WHERE user_id = $1 AND grade_subject_id = $2
      ORDER BY taken_at DESC
      LIMIT 1
    `, [userId, gradeSubjectId]);

    if (placementResult.rows.length === 0) {
      return res.json({
        has_taken: false,
        result: null,
      });
    }

    const result = placementResult.rows[0];
    return res.json({
      has_taken: true,
      result: {
        id: result.id,
        total_questions: result.total_questions,
        correct_count: result.correct_count,
        score_percent: result.score_percent,
        chapter_scores: result.chapter_scores,
        mastered_chapter_ids: result.mastered_chapter_ids,
        recommended_chapter_id: result.recommended_chapter_id,
        taken_at: result.taken_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/placement/:gradeSlug/:subjectSlug/test
// Lấy câu hỏi cho bài kiểm tra đầu vào
// Lấy 3-5 câu từ mỗi chương
const getPlacementTest = async (req, res, next) => {
  try {
    const { gradeSlug, subjectSlug } = req.params;
    const QUESTIONS_PER_CHAPTER = 4; // 3-5 câu mỗi chương

    // Resolve grade_subject
    const gradeSubjectResult = await pool.query(`
      SELECT gs.id
      FROM grade_subjects gs
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id
      WHERE g.slug = $1 AND s.slug = $2 AND gs.is_active = true
      LIMIT 1
    `, [gradeSlug, subjectSlug]);

    if (gradeSubjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy môn học' });
    }

    const gradeSubjectId = gradeSubjectResult.rows[0].id;

    // Lấy chapters theo sort_order
    const chaptersResult = await pool.query(`
      SELECT id, title, sort_order
      FROM chapters
      WHERE grade_subject_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [gradeSubjectId]);

    if (chaptersResult.rows.length === 0) {
      return res.status(400).json({ error: 'Chương của môn học này chưa có bài tập để kiểm tra' });
    }

    const chapters = chaptersResult.rows;

    // Lấy exercises từ lessons thuộc mỗi chapter
    // KHÔNG trả về correct_answer
    const questions = [];

    for (const chapter of chapters) {
      const exercisesResult = await pool.query(`
        SELECT
          e.id,
          e.exercise_type,
          e.question_text,
          e.question_image_url,
          e.options,
          e.difficulty,
          e.sort_order,
          ch.id AS chapter_id,
          ch.title AS chapter_title
        FROM exercises e
        JOIN lessons l ON l.id = e.lesson_id
        JOIN chapters ch ON ch.id = l.chapter_id
        WHERE ch.id = $1 AND e.is_active = true
        ORDER BY e.sort_order, e.id
        LIMIT $2
      `, [chapter.id, QUESTIONS_PER_CHAPTER]);

      questions.push(...exercisesResult.rows);
    }

    if (questions.length === 0) {
      return res.status(400).json({ error: 'Chương của môn học này chưa có bài tập để kiểm tra' });
    }

    res.json({
      grade_subject_id: gradeSubjectId,
      total_questions: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        exercise_type: q.exercise_type,
        question_text: q.question_text,
        question_image_url: q.question_image_url,
        options: q.options,
        difficulty: q.difficulty,
        chapter_id: q.chapter_id,
        chapter_title: q.chapter_title,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/placement/:gradeSlug/:subjectSlug/submit
// Chấm điểm, xác định mastered chapters, cập nhật progress
const submitPlacementTest = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { gradeSlug, subjectSlug } = req.params;
    const { answers } = req.body; // [{ exercise_id, user_answer }, ...]
    const userId = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers phải là mảng' });
    }

    // Resolve grade_subject
    const gradeSubjectResult = await client.query(`
      SELECT gs.id FROM grade_subjects gs
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id
      WHERE g.slug = $1 AND s.slug = $2 AND gs.is_active = true
      LIMIT 1
    `, [gradeSlug, subjectSlug]);

    if (gradeSubjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy môn học' });
    }

    const gradeSubjectId = gradeSubjectResult.rows[0].id;

    // Lấy danh sách chapters
    const chaptersResult = await client.query(`
      SELECT id, title, sort_order
      FROM chapters
      WHERE grade_subject_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [gradeSubjectId]);

    if (chaptersResult.rows.length === 0) {
      return res.status(400).json({ error: 'Không có chương nào' });
    }

    const chapters = chaptersResult.rows;

    // Chấm điểm từng câu hỏi
    const scoreByChapter = {};
    const answersWithCorrectness = [];
    let correctCount = 0;

    // Initialize chapter scores
    chapters.forEach(ch => {
      scoreByChapter[ch.id] = { correct: 0, total: 0 };
    });

    for (const answer of answers) {
      const exerciseResult = await client.query(`
        SELECT e.id, e.exercise_type, e.correct_answer, l.chapter_id
        FROM exercises e
        JOIN lessons l ON l.id = e.lesson_id
        WHERE e.id = $1 AND e.is_active = true
      `, [answer.exercise_id]);

      if (exerciseResult.rows.length === 0) {
        continue; // Bỏ qua exercise không tồn tại
      }

      const exercise = exerciseResult.rows[0];
      const isCorrect = checkAnswer(exercise.exercise_type, answer.user_answer, exercise.correct_answer);

      answersWithCorrectness.push({
        exercise_id: exercise.id,
        user_answer: answer.user_answer,
        is_correct: isCorrect,
      });

      if (isCorrect) {
        correctCount++;
      }

      // Tính điểm theo chapter
      const chapterId = exercise.chapter_id;
      if (scoreByChapter[chapterId]) {
        scoreByChapter[chapterId].correct += isCorrect ? 1 : 0;
        scoreByChapter[chapterId].total += 1;
      }
    }

    // Tính score_percent của từng chapter
    const chapterScores = {};
    chapters.forEach(ch => {
      const { correct, total } = scoreByChapter[ch.id];
      chapterScores[ch.id] = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;
    });

    // Xác định mastered chapters (>= 70%)
    const masteredChapterIds = chapters
      .filter(ch => chapterScores[ch.id] >= 70)
      .map(ch => ch.id);

    // Xác định recommended_chapter_id: chương đầu tiên chưa đạt hoặc không mastered
    let recommendedChapterId = null;
    for (const chapter of chapters) {
      if (!masteredChapterIds.includes(chapter.id)) {
        recommendedChapterId = chapter.id;
        break;
      }
    }
    // Nếu tất cả đều mastered, recommended là chương cuối cùng
    if (!recommendedChapterId && chapters.length > 0) {
      recommendedChapterId = chapters[chapters.length - 1].id;
    }

    const totalQuestions = answers.length;
    const scorePercent = totalQuestions > 0
      ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
      : 0;

    // BEGIN transaction
    await client.query('BEGIN');

    // Lưu school_placement_results
    await client.query(`
      INSERT INTO school_placement_results
        (user_id, grade_subject_id, total_questions, correct_count, score_percent,
         chapter_scores, mastered_chapter_ids, recommended_chapter_id, answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, grade_subject_id)
      DO UPDATE SET
        total_questions = $3,
        correct_count = $4,
        score_percent = $5,
        chapter_scores = $6,
        mastered_chapter_ids = $7,
        recommended_chapter_id = $8,
        answers = $9,
        taken_at = CURRENT_TIMESTAMP
    `, [
      userId,
      gradeSubjectId,
      totalQuestions,
      correctCount,
      scorePercent,
      JSON.stringify(chapterScores),
      JSON.stringify(masteredChapterIds),
      recommendedChapterId,
      JSON.stringify(answersWithCorrectness),
    ]);

    // Cập nhật lesson_progress và chapter_progress cho các chương mastered
    for (const chapterId of masteredChapterIds) {
      // Lấy tất cả lessons của chapter
      const lessonsResult = await client.query(`
        SELECT id FROM lessons WHERE chapter_id = $1 AND is_active = true
      `, [chapterId]);

      // Đánh dấu hoàn thành tất cả lessons (nếu chưa hoàn thành)
      for (const lesson of lessonsResult.rows) {
        await client.query(`
          INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at, last_accessed_at)
          VALUES ($1, $2, true, NOW(), NOW())
          ON CONFLICT (user_id, lesson_id)
          DO UPDATE SET
            is_completed = true,
            completed_at = CASE WHEN excluded.is_completed THEN lesson_progress.completed_at ELSE NOW() END,
            last_accessed_at = NOW()
        `, [userId, lesson.id]);
      }

      // Cập nhật chapter_progress
      const totalLessons = lessonsResult.rows.length;
      await client.query(`
        INSERT INTO chapter_progress
          (user_id, chapter_id, total_lessons, completed_lessons, progress_percent, updated_at)
        VALUES ($1, $2, $3, $3, 100, NOW())
        ON CONFLICT (user_id, chapter_id)
        DO UPDATE SET
          total_lessons = $3,
          completed_lessons = $3,
          progress_percent = 100,
          updated_at = NOW()
      `, [userId, chapterId, totalLessons]);
    }

    // COMMIT transaction
    await client.query('COMMIT');

    res.json({
      total_questions: totalQuestions,
      correct_count: correctCount,
      score_percent: scorePercent,
      chapter_scores: chapterScores,
      mastered_chapter_ids: masteredChapterIds,
      recommended_chapter_id: recommendedChapterId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  getPlacementStatus,
  getPlacementTest,
  submitPlacementTest,
};
