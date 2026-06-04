const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiQueue } = require('../utils/requestQueue');

// ─── Constants ────────────────────────────────────────────────

const DIFFICULTY_DESC = {
  easy: {
    thcs: 'dễ, kiến thức cơ bản, áp dụng trực tiếp công thức',
    thpt: 'dễ, nhận biết và hiểu, áp dụng công thức đã học trực tiếp',
  },
  medium: {
    thcs: 'trung bình, yêu cầu hiểu và vận dụng, bài toán có nhiều bước',
    thpt: 'trung bình, vận dụng kiến thức, bài toán đa bước',
  },
  hard: {
    thcs: 'khó, yêu cầu tư duy cao, bài toán phức tạp nhiều bước',
    thpt: 'khó, vận dụng cao, bài toán tổng hợp nhiều kiến thức',
  },
};

function getDifficultyDesc(difficulty, educationLevel) {
  const map = DIFFICULTY_DESC[difficulty] || DIFFICULTY_DESC.medium;
  if (!educationLevel || !map[educationLevel]) {
    return educationLevel === 'thpt' ? map.thpt : map.thcs;
  }
  return map[educationLevel];
}

// ─── Question Generators ──────────────────────────────────────

function buildSingleQuestionPrompt({ subject, grade, topic, difficulty, educationLevel, questionType }) {
  const diffDesc = getDifficultyDesc(difficulty, educationLevel);
  const topicStr = topic ? `Chủ đề: ${topic}` : `tổng hợp kiến thức`;

  const levelLabel = educationLevel === 'thcs' ? 'THCS' : 'THPT';
  return `Tạo 1 câu ${subject} ${levelLabel} lớp ${grade} (${topicStr}, ${diffDesc}), ${questionType === 'multiple_choice' ? '4 đáp án A/B/C/D' : 'điền khuyết (___)'}. JSON: {"question_text":"...","question_type":"${questionType}","options":${questionType === 'multiple_choice' ? '["A","B","C","D"]' : 'null'},"correct_answer":"...","explanation":"..."}`;
}

function buildBatchExamPrompt({ subject, grade, topic, difficulty, educationLevel, mcCount, fillBlankCount }) {
  const diffDesc = getDifficultyDesc(difficulty, educationLevel);
  const topicStr = topic || `lớp ${grade}`;
  const levelLabel = educationLevel === 'thcs' ? 'THCS' : 'THPT';
  const totalCount = mcCount + fillBlankCount;

  return `Tạo ${totalCount} câu ${subject} ${levelLabel} lớp ${grade} (${topicStr}, ${diffDesc}): ${mcCount} MC + ${fillBlankCount} fill.
JSON: [{"question_text":"...","question_type":"multiple_choice","options":["A","B","C","D"],"correct_answer":"...","explanation":"..."},...]`;
}

// ─── Parse & Validate ─────────────────────────────────────────

function parseGeminiResponse(responseText) {
  let text = responseText.trim();
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
  if (jsonMatch) text = jsonMatch[1].trim();
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) text = arrayMatch[0];
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini trả về JSON không hợp lệ: ${err.message}`);
  }
}

function parseGeminiObject(responseText) {
  let text = responseText.trim();
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
  if (jsonMatch) text = jsonMatch[1].trim();
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) text = objMatch[0];
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini trả về JSON không hợp lệ: ${err.message}`);
  }
}

// Hàm này sẽ trả về null nếu câu hỏi không hợp lệ, hoặc object đã được làm sạch nếu hợp lệ
function validateAndCleanQuestion(q, idx, allowedTypes = null) {
  if (!q.question_text || typeof q.question_text !== 'string' || !q.question_text.trim()) return null;
  if (!['multiple_choice', 'fill_in_blank'].includes(q.question_type)) return null;
  if (allowedTypes && !allowedTypes.includes(q.question_type)) return null;
  if (!q.correct_answer && q.correct_answer !== 0) return null;

  if (q.question_type === 'multiple_choice') {
    if (!Array.isArray(q.options) || q.options.length < 3) return null;
    const stripped = q.options.map(o => String(o).replace(/^[A-Da-d][.)]\s*/, '').trim());
    const correctStr = String(q.correct_answer).replace(/^[A-Da-d][.)]\s*/, '').trim();
    if (!stripped.includes(correctStr)) {
      const idx2 = parseInt(q.correct_answer);
      if (!isNaN(idx2) && stripped[idx2]) q.correct_answer = stripped[idx2];
      else return null;
    } else {
      q.correct_answer = correctStr;
    }
    q.options = stripped;
  }

  if (q.question_type === 'fill_in_blank' && !q.question_text.includes('___')) {
    q.question_text = q.question_text + ' = ___';
  }

  return {
    question_text: q.question_text.trim(),
    question_type: q.question_type,
    options: q.question_type === 'multiple_choice' ? q.options.map(String) : null,
    correct_answer: q.question_type === 'essay' ? (q.correct_answer || '') : String(q.correct_answer),
    explanation: q.explanation || '',
    image_svg: q.image_svg || null,
    section: q.section || null,
    point_value: parseFloat(q.point_value) || 1,
  };
}

// ─── Core Generation ──────────────────────────────────────────

async function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  return genAI.getGenerativeModel({ model: modelName });
}

async function generateWithRetry(model, prompt, maxRetries = 2) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const text = await geminiQueue.add(async () => {
        const result = await model.generateContent(
          i === 0 ? prompt : prompt + '\n\nQUAN TRỌNG: Chỉ trả về JSON thuần túy, KHÔNG có text nào khác.'
        );
        return result.response.text();
      });
      return text;
    } catch (err) {
      lastError = err;
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastError;
}

// ─── Public: Generate Questions (old format, backward compat) ─

async function generateQuestions(config) {
  const model = await getModel();
  const { numberOfQuestions = 5, grade, topic, difficulty, questionTypes = ['multiple_choice', 'fill_in_blank'], subject = 'Toán', educationLevel = 'thcs' } = config;

  let allQuestions = [];
  let attempts = 0;
  const maxAttempts = 2;

  while (allQuestions.length < numberOfQuestions && attempts < maxAttempts) {
    const needed = numberOfQuestions - allQuestions.length;
    const mcCount = Math.ceil(needed * 0.7);
    const fillBlankCount = needed - mcCount;

    const prompt = buildBatchExamPrompt({
      subject, grade, topic, difficulty, educationLevel,
      mcCount, fillBlankCount
    });
    const text = await generateWithRetry(model, prompt);
    const parsed = Array.isArray(parseGeminiResponse(text)) ? parseGeminiResponse(text) : [parseGeminiResponse(text)];
    const cleaned = parsed.map((q, i) => validateAndCleanQuestion(q, i, questionTypes)).filter(Boolean);

    allQuestions.push(...cleaned);
    attempts++;
  }

  if (allQuestions.length === 0) throw new Error('Gemini không thể tạo câu hỏi hợp lệ. Vui lòng thử lại.');
  return allQuestions.slice(0, numberOfQuestions);
}

// ─── Public: Generate Exam (advanced, with sections) ─────────

async function generateExam(config) {
  const {
    subject = 'Toán',
    grade = 1,
    topic,
    difficulty = 'medium',
    educationLevel = 'thcs',
    programType = 'pho_thong',
    mcCount: reqMc,
    fillBlankCount: reqFill,
    numberOfQuestions = 5,
  } = config;

  const model = await getModel();

  // Tính số câu (chỉ MC + Fill)
  let mcCount = typeof reqMc === 'number' ? reqMc : Math.round(numberOfQuestions * 0.7);
  let fillBlankCount = typeof reqFill === 'number' ? reqFill : numberOfQuestions - mcCount;

  const BATCH_SIZE = 5;
  let allQuestions = [];

  if (numberOfQuestions <= BATCH_SIZE) {
    // Single batch
    const prompt = buildBatchExamPrompt({ subject, grade, topic, difficulty, educationLevel, mcCount, essayCount, fillBlankCount });
    const text = await generateWithRetry(model, prompt);
    const parsed = parseGeminiResponse(text);
    allQuestions = parsed.map((q, i) => validateAndCleanQuestion(q, i)).filter(Boolean);
  } else {
    // Multi-batch for large exams
    const batches = [];
    let remainMc = mcCount, remainEssay = essayCount, remainFill = fillBlankCount;

    while (remainMc + remainEssay + remainFill > 0) {
      const batchMc = Math.min(remainMc, Math.ceil(BATCH_SIZE * mcCount / numberOfQuestions));
      const batchEssay = Math.min(remainEssay, Math.ceil(BATCH_SIZE * essayCount / numberOfQuestions));
      const batchFill = Math.min(remainFill, BATCH_SIZE - batchMc - batchEssay);
      if (batchMc + batchEssay + batchFill === 0) break;

      batches.push({ batchMc, batchEssay, batchFill });
      remainMc -= batchMc;
      remainEssay -= batchEssay;
      remainFill -= batchFill;
    }

    const existingTexts = [];
    for (const batch of batches) {
      const prompt = buildBatchExamPrompt({
        subject, grade, topic, difficulty, educationLevel,
        mcCount: batch.batchMc, essayCount: batch.batchEssay, fillBlankCount: batch.batchFill,
        existingTexts,
      });
      const text = await generateWithRetry(model, prompt);
      const parsed = parseGeminiResponse(text);
      const cleaned = parsed.map((q, i) => validateAndCleanQuestion(q, i)).filter(Boolean);
      allQuestions.push(...cleaned);
      existingTexts.push(...cleaned.slice(0, 3).map(q => q.question_text.slice(0, 50)));
      // Avoid rate limit
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  if (allQuestions.length === 0) throw new Error('Không tạo được câu hỏi hợp lệ. Vui lòng thử lại.');

  // Gán section nếu thiếu
  allQuestions = allQuestions.map(q => {
    if (!q.section) {
      return q.question_type === 'multiple_choice' ? { ...q, section: 'A' } : { ...q, section: 'B' };
    }
    return q;
  });

  // Build sections metadata
  const hasMc = allQuestions.some(q => q.section === 'A');
  const hasFill = allQuestions.some(q => q.section === 'B');
  const mcTotalPoints = hasMc ? parseFloat(((mcCount / numberOfQuestions) * 10).toFixed(1)) : 0;
  const fillTotalPoints = hasFill ? parseFloat(((fillBlankCount / numberOfQuestions) * 10).toFixed(1)) : 0;

  const sections = [];
  if (hasMc) sections.push({ id: 'A', title: 'Phần A. Trắc nghiệm', instruction: 'Khoanh tròn vào chữ cái trước câu trả lời đúng:', total_points: mcTotalPoints });
  if (hasFill) sections.push({ id: 'B', title: 'Phần B. Điền vào chỗ trống', instruction: 'Điền đáp án thích hợp vào chỗ trống:', total_points: fillTotalPoints });

  return { questions: allQuestions, sections };
}

// ─── Public: Regenerate single question ──────────────────────

async function regenerateSingleQuestion(config) {
  const { subject = 'Toán', grade, topic, difficulty, educationLevel = 'thcs', questionType = 'multiple_choice' } = config;
  const model = await getModel();
  const prompt = buildSingleQuestionPrompt({ subject, grade, topic, difficulty, educationLevel, questionType });
  const text = await generateWithRetry(model, prompt);
  const parsed = parseGeminiObject(text);
  const cleaned = validateAndCleanQuestion(parsed, 0);
  if (!cleaned) throw new Error('Không tạo được câu hỏi hợp lệ');
  return cleaned;
}

module.exports = { generateQuestions, generateExam, regenerateSingleQuestion };
