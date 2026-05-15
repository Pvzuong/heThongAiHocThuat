const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Constants ────────────────────────────────────────────────

const DIFFICULTY_DESC = {
  easy: {
    tieu_hoc: 'dễ, phù hợp học sinh mới bắt đầu, phép tính đơn giản trong phạm vi nhỏ',
    thcs: 'dễ, kiến thức cơ bản, áp dụng trực tiếp công thức',
    thpt: 'dễ, nhận biết và hiểu, áp dụng công thức đã học trực tiếp',
    default: 'dễ, yêu cầu tư duy cơ bản',
  },
  medium: {
    tieu_hoc: 'trung bình, yêu cầu tư duy cơ bản, phép tính nhiều bước đơn giản',
    thcs: 'trung bình, yêu cầu hiểu và vận dụng, bài toán có nhiều bước',
    thpt: 'trung bình, vận dụng kiến thức, bài toán đa bước',
    default: 'trung bình, yêu cầu tư duy và vận dụng',
  },
  hard: {
    tieu_hoc: 'khó, yêu cầu tư duy logic, bài toán có lời văn hoặc nhiều bước tính',
    thcs: 'khó, yêu cầu tư duy cao, bài toán phức tạp nhiều bước',
    thpt: 'khó, vận dụng cao, bài toán tổng hợp nhiều kiến thức',
    default: 'khó, yêu cầu tư duy sâu và sáng tạo',
  },
};

function getDifficultyDesc(difficulty, educationLevel) {
  const level = educationLevel || 'default';
  const map = DIFFICULTY_DESC[difficulty] || DIFFICULTY_DESC.medium;
  return map[level] || map.default;
}

// ─── Question Generators ──────────────────────────────────────

function buildSingleQuestionPrompt({ subject, grade, topic, difficulty, educationLevel, questionType, existingTexts = [] }) {
  const diffDesc = getDifficultyDesc(difficulty, educationLevel);
  const topicStr = topic ? `Chủ đề: ${topic}` : `tổng hợp kiến thức`;
  const avoidStr = existingTexts.length > 0
    ? `\nKHÔNG tạo câu hỏi trùng ý với: ${existingTexts.slice(-5).join('; ')}`
    : '';

  let typeInstruction = '';
  if (questionType === 'multiple_choice') {
    typeInstruction = 'Tạo câu hỏi trắc nghiệm với đúng 4 đáp án A/B/C/D, chỉ có 1 đáp án đúng.';
  } else if (questionType === 'fill_in_blank') {
    typeInstruction = 'Tạo câu hỏi điền vào chỗ trống, dùng ___ để đánh dấu chỗ cần điền.';
  } else if (questionType === 'essay') {
    typeInstruction = 'Tạo câu hỏi tự luận, yêu cầu học sinh trình bày đầy đủ.';
  }

  return `Bạn là giáo viên ${subject} ${educationLevel === 'tieu_hoc' ? 'tiểu học' : educationLevel === 'thcs' ? 'THCS' : 'THPT'} Việt Nam.
Tạo MỘT câu hỏi ${subject} cho học sinh lớp ${grade}.
${topicStr}, Độ khó: ${diffDesc}.
${typeInstruction}${avoidStr}

Trả về JSON object DUY NHẤT:
{
  "question_text": "nội dung câu hỏi",
  "question_type": "${questionType}",
  "options": ${questionType === 'multiple_choice' ? '["đáp án A", "đáp án B", "đáp án C", "đáp án D"]' : 'null'},
  "correct_answer": "đáp án đúng",
  "explanation": "giải thích ngắn",
  "image_svg": null,
  "point_value": 1
}

CHỈ trả về JSON object, KHÔNG markdown, KHÔNG text khác.`;
}

function buildBatchExamPrompt({ subject, grade, topic, difficulty, educationLevel, mcCount, essayCount, fillBlankCount, existingTexts = [] }) {
  const diffDesc = getDifficultyDesc(difficulty, educationLevel);
  const topicStr = topic ? `Chủ đề: ${topic}` : `tổng hợp kiến thức lớp ${grade}`;
  const levelLabel = educationLevel === 'tieu_hoc' ? 'tiểu học' : educationLevel === 'thcs' ? 'THCS' : 'THPT';
  const avoidStr = existingTexts.length > 0 ? `\nKHÔNG trùng với: ${existingTexts.slice(-3).join('; ')}` : '';

  const sections = [];
  if (mcCount > 0) sections.push(`- Phần A (Trắc nghiệm): ĐÚNG ${mcCount} câu multiple_choice, mỗi câu có 4 đáp án, section: "A"`);
  if (fillBlankCount > 0) sections.push(`- Phần B (Điền khuyết): ĐÚNG ${fillBlankCount} câu fill_in_blank chứa ___ , section: "B"`);
  if (essayCount > 0) sections.push(`- Phần C (Tự luận): ĐÚNG ${essayCount} câu essay, section: "C"`);

  const totalCount = mcCount + essayCount + fillBlankCount;

  return `Bạn là giáo viên ${subject} ${levelLabel} Việt Nam. Tạo đề kiểm tra ${subject} cho học sinh lớp ${grade}.
Thông tin: ${topicStr}, độ khó: ${diffDesc}, chương trình SGK Việt Nam.${avoidStr}

Tạo ĐÚNG ${totalCount} câu theo các phần:
${sections.join('\n')}

Quy tắc BẮT BUỘC:
- multiple_choice: options là array 4 phần tử KHÔNG chứa chữ "A. B. C. D." ở đầu, correct_answer là ĐÚNG 1 trong 4 options đó
- fill_in_blank: question_text PHẢI chứa ___ 
- essay: question_text rõ ràng, không cần options
- Ngôn ngữ Tiếng Việt, đúng chương trình SGK lớp ${grade}
- Câu hỏi không trùng lặp nhau

Trả về JSON array ĐÚNG cấu trúc:
[
  {
    "question_text": "nội dung",
    "question_type": "multiple_choice|fill_in_blank|essay",
    "options": ["A","B","C","D"] hoặc null,
    "correct_answer": "đáp án",
    "explanation": "giải thích",
    "image_svg": null,
    "section": "A|B|C",
    "point_value": 0.5
  }
]

CHỈ trả về JSON array, KHÔNG markdown, KHÔNG text khác.`;
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

function validateAndCleanQuestion(q, idx, allowedTypes = null) {
  if (!q.question_text || typeof q.question_text !== 'string' || !q.question_text.trim()) return null;
  if (!['multiple_choice', 'fill_in_blank', 'essay'].includes(q.question_type)) return null;
  if (allowedTypes && !allowedTypes.includes(q.question_type)) return null;
  if (!q.correct_answer && q.correct_answer !== 0 && q.question_type !== 'essay') return null;

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
      const result = await model.generateContent(
        i === 0 ? prompt : prompt + '\n\nQUAN TRỌNG: Chỉ trả về JSON thuần túy, KHÔNG có text nào khác.'
      );
      return result.response.text();
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
  const { numberOfQuestions = 10, grade, topic, difficulty, questionTypes = ['multiple_choice'], subject = 'Toán', educationLevel = 'tieu_hoc' } = config;

  const mcCount = questionTypes.includes('multiple_choice') ? Math.ceil(numberOfQuestions * 0.6) : 0;
  const fillCount = questionTypes.includes('fill_in_blank') ? numberOfQuestions - mcCount : 0;
  const essayCount = questionTypes.includes('essay') ? numberOfQuestions - mcCount - fillCount : 0;
  const adjustedFill = numberOfQuestions - mcCount - essayCount;

  const prompt = buildBatchExamPrompt({ subject, grade, topic, difficulty, educationLevel, mcCount, essayCount, fillBlankCount: adjustedFill > 0 ? adjustedFill : 0 });
  const text = await generateWithRetry(model, prompt);
  const parsed = parseGeminiResponse(text);
  const cleaned = parsed.map((q, i) => validateAndCleanQuestion(q, i, questionTypes)).filter(Boolean);

  if (cleaned.length === 0) throw new Error('Gemini không thể tạo câu hỏi hợp lệ. Vui lòng thử lại.');
  return cleaned;
}

// ─── Public: Generate Exam (advanced, with sections) ─────────

async function generateExam(config) {
  const {
    subject = 'Toán',
    grade = 1,
    topic,
    difficulty = 'medium',
    educationLevel = 'tieu_hoc',
    programType = 'pho_thong',
    mcCount: reqMc,
    essayCount: reqEssay,
    fillBlankCount: reqFill,
    numberOfQuestions = 10,
  } = config;

  const model = await getModel();

  // Tính số câu theo loại
  let mcCount = typeof reqMc === 'number' ? reqMc : Math.round(numberOfQuestions * 0.5);
  let essayCount = typeof reqEssay === 'number' ? reqEssay : Math.round(numberOfQuestions * 0.2);
  let fillBlankCount = typeof reqFill === 'number' ? reqFill : numberOfQuestions - mcCount - essayCount;

  // Đảm bảo tổng đúng
  const total = mcCount + essayCount + fillBlankCount;
  if (total !== numberOfQuestions) {
    mcCount = numberOfQuestions - essayCount - fillBlankCount;
  }

  const BATCH_SIZE = 20;
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
      if (q.question_type === 'multiple_choice') return { ...q, section: 'A' };
      if (q.question_type === 'fill_in_blank') return { ...q, section: 'B' };
      return { ...q, section: 'C' };
    }
    return q;
  });

  // Build sections metadata
  const sections = [];
  const hasMc = allQuestions.some(q => q.section === 'A');
  const hasFill = allQuestions.some(q => q.section === 'B');
  const hasEssay = allQuestions.some(q => q.section === 'C');

  const totalPoints = 10;
  const mcTotalPoints = hasMc ? parseFloat(((mcCount / numberOfQuestions) * totalPoints).toFixed(1)) : 0;
  const fillTotalPoints = hasFill ? parseFloat(((fillBlankCount / numberOfQuestions) * totalPoints).toFixed(1)) : 0;
  const essayTotalPoints = hasEssay ? parseFloat((totalPoints - mcTotalPoints - fillTotalPoints).toFixed(1)) : 0;

  if (hasMc) sections.push({ id: 'A', title: 'Phần A. Trắc nghiệm', instruction: 'Khoanh tròn vào chữ cái trước câu trả lời đúng:', total_points: mcTotalPoints });
  if (hasFill) sections.push({ id: 'B', title: 'Phần B. Điền vào chỗ trống', instruction: 'Điền đáp án thích hợp vào chỗ trống:', total_points: fillTotalPoints });
  if (hasEssay) sections.push({ id: 'C', title: 'Phần C. Tự luận', instruction: 'Trình bày đầy đủ lời giải:', total_points: essayTotalPoints });

  return { questions: allQuestions, sections };
}

// ─── Public: Regenerate single question ──────────────────────

async function regenerateSingleQuestion(config) {
  const { subject = 'Toán', grade, topic, difficulty, educationLevel = 'tieu_hoc', questionType = 'multiple_choice', existingTexts = [] } = config;
  const model = await getModel();
  const prompt = buildSingleQuestionPrompt({ subject, grade, topic, difficulty, educationLevel, questionType, existingTexts });
  const text = await generateWithRetry(model, prompt);
  const parsed = parseGeminiObject(text);
  const cleaned = validateAndCleanQuestion(parsed, 0);
  if (!cleaned) throw new Error('Không tạo được câu hỏi hợp lệ');
  return cleaned;
}

module.exports = { generateQuestions, generateExam, regenerateSingleQuestion };
