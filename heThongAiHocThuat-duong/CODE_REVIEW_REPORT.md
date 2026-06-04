# 📋 CODE REVIEW REPORT — Education Platform (LearnHub)

**Review Date:** 06/06/2026  
**Overall Score:** 7.1/10  
**Status:** GOOD, Production-Ready with Critical Fixes Needed  

---

## 🎯 EXECUTIVE SUMMARY

LearnHub có **kiến trúc tốt**, **bảo mật auth chuẩn**, nhưng cần **fix XSS vulnerabilities** và **bổ sung tests** trước khi deploy production.

### Điểm Mạnh:
- ✅ MVC architecture rõ ràng
- ✅ OTP authentication solid
- ✅ Database schema tốt
- ✅ Parameterized queries (không SQL injection)
- ✅ JWT token handling (httpOnly cookies)
- ✅ Role-based access control

### Điểm Yếu:
- ❌ **XSS vulnerability** via `dangerouslySetInnerHTML` (5+ vị trí)
- ❌ Không có tests (0/10)
- ❌ SELECT * anti-pattern
- ❌ Không có error boundaries
- ❌ Performance: N+1 queries, no caching
- ❌ No TypeScript

---

## 🔴 CRITICAL ISSUES (Phải fix trước deploy)

### Issue #1: XSS Vulnerability via dangerouslySetInnerHTML

**Severity:** HIGH  
**Impact:** Malicious lesson content có thể execute JavaScript  
**Locations:**
- `client/src/pages/PhoThong/LessonDetail.jsx:62`
- `client/src/pages/DaiHoc/SkillLessonDetail.jsx`
- `client/src/pages/Practice/AIPracticeArena.jsx`
- `client/src/pages/Practice/ExamPaperA4.jsx`
- Multiple places in PlacementTestModal

**Fix:**

```javascript
// BEFORE (VULNERABLE):
<div dangerouslySetInnerHTML={{ __html: lesson.content_html }} />

// AFTER (SECURE):
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content_html) }} />
```

**Action:**
```bash
npm install dompurify
```

**Timeline:** 🔴 URGENT (Day 1)

---

### Issue #2: No React Error Boundaries

**Severity:** HIGH  
**Impact:** One crashed component crashes entire app  

**Solution:**

```javascript
// client/src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-page">
        <h1>Có lỗi xảy ra</h1>
        <button onClick={() => window.location.reload()}>Tải lại</button>
      </div>;
    }
    return this.props.children;
  }
}
```

Usage in App.jsx:
```javascript
<ErrorBoundary>
  <ToastProvider>
    <Routes>...</Routes>
  </ToastProvider>
</ErrorBoundary>
```

**Timeline:** 🔴 URGENT (Day 1)

---

### Issue #3: Zero Test Coverage

**Severity:** HIGH  
**Impact:** No confidence in refactoring; bugs slip through  
**Current:** 0/10  
**Target:** >= 60% coverage  

**Minimum Tests Required:**

```javascript
// server/src/controllers/__tests__/authController.test.js
describe('Auth Controller', () => {
  test('register should generate OTP and send email', async () => {
    // Test register flow
  });

  test('verifyEmail should validate OTP and issue tokens', async () => {
    // Test OTP verification
  });

  test('login should return access + refresh tokens', async () => {
    // Test login
  });
});

// client/src/pages/Auth/__tests__/LoginPage.test.jsx
describe('LoginPage', () => {
  test('should render login form', () => {
    // Test render
  });

  test('should submit login credentials', async () => {
    // Test submit
  });
});
```

**Setup:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Timeline:** 🟡 HIGH (Week 1)

---

## 🟡 HIGH PRIORITY ISSUES (Nên fix trước production)

### Issue #4: SELECT * Anti-Pattern

**Severity:** MEDIUM  
**Files:** geminiController.js (multiple lines)  
**Impact:** Wasted bandwidth, brittle queries, maintenance burden

**Example:**
```sql
-- BEFORE (BAD):
SELECT * FROM exercises WHERE id = $1

-- AFTER (GOOD):
SELECT id, exercise_type, question_text, options, difficulty FROM exercises WHERE id = $1
```

**Action:** Replace all `SELECT *` with explicit columns  
**Timeline:** 🟡 HIGH (Week 1)

---

### Issue #5: Missing Input Validation

**Severity:** MEDIUM  
**Current:** Only on auth routes  
**Missing on:** Admin, Gemini, Practice endpoints

**Add Validators:**
```javascript
// server/src/validators/geminiValidator.js
const { body, validationResult } = require('express-validator');

exports.validateGenerateQuestions = [
  body('grade_number').isInt({ min: 6, max: 12 }),
  body('topic').isString().trim().notEmpty(),
  body('difficulty').isIn(['easy', 'medium', 'hard']),
  body('count').isInt({ min: 1, max: 50 }),
];

// Usage in routes:
router.post(
  '/generate',
  auth,
  validateGenerateQuestions,
  geminiController.generateQuestions
);
```

**Timeline:** 🟡 HIGH (Week 1)

---

### Issue #6: N+1 Query Problems

**Severity:** MEDIUM  
**Example:** lessonDetail.jsx makes 2 API calls sequentially

```javascript
// BEFORE (N+1):
const lesson = await getLesson(lessonId);        // 100ms
const exercises = await getExercises(lessonId);  // 100ms
// Total: 200ms

// AFTER (Optimized):
const data = await getLessonWithExercises(lessonId);  // 120ms
// Total: 120ms
```

**Action:** Create aggregated API endpoints  
**Timeline:** 🟡 HIGH (Week 2)

---

### Issue #7: Missing Pagination

**Severity:** MEDIUM  
**Affected Endpoints:**
- `GET /api/gemini/collections` - Returns ALL collections
- `GET /api/admin/users` - Already paginated ✓

**Add Pagination:**
```javascript
// server/src/controllers/geminiController.js
const getCollections = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT * FROM question_collections
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM question_collections WHERE user_id = $1`,
    [userId]
  );

  res.json({
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    pages: Math.ceil(countResult.rows[0].count / limit)
  });
};
```

**Timeline:** 🟡 HIGH (Week 2)

---

## 🟢 MEDIUM PRIORITY ISSUES (Nên fix trong next sprint)

### Issue #8: No Caching Strategy

**Severity:** MEDIUM  
**Problem:** Static content (grades, subjects, chapters) fetched every page load

**Solution:** Redis caching

```javascript
const redis = require('redis');
const client = redis.createClient();

const getGrades = async (req, res, next) => {
  const cacheKey = 'grades:all';
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Query DB
  const result = await pool.query('SELECT * FROM grades ORDER BY sort_order');
  
  // Cache 1 hour
  await client.setex(cacheKey, 3600, JSON.stringify(result.rows));
  
  res.json(result.rows);
};
```

**Timeline:** 🟢 MEDIUM (Next Sprint)

---

### Issue #9: No TypeScript

**Severity:** MEDIUM  
**Impact:** Type errors caught at runtime, not compile time

**Example problems:**
```javascript
// Without TypeScript, these pass compilation:
const lesson = { id: '123' };  // Should be number
const user = { email: 'test' }; // Missing required fields
```

**Action:** Migrate to TypeScript (Optional, low priority)  
**Timeline:** 🟢 MEDIUM (Later sprints)

---

### Issue #10: Missing Error Boundaries & Logging

**Severity:** MEDIUM  

**Structured Logging:**
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage:
logger.info('User registered', { userId, email });
logger.error('Gemini API failed', { error, status: err.status });
```

**Timeline:** 🟢 MEDIUM (Next Sprint)

---

## ✅ STRENGTHS TO MAINTAIN

1. **Architecture** - MVC pattern rõ ràng, dễ maintain
2. **Security** - Auth flow chuẩn, OTP solid
3. **Database** - Schema tốt, indexes hợp lý
4. **Code Style** - Consistent naming, error handling centralized
5. **Responsive Design** - Mobile-first, breakpoints đủ

---

## 📊 SCORING BREAKDOWN

| Aspect | Score | Priority |
|--------|-------|----------|
| Architecture | 8/10 | ✅ Keep |
| Security | 7/10 | 🔴 Fix XSS |
| Code Quality | 7.5/10 | 🟡 Refactor SELECT * |
| Database Design | 8.5/10 | ✅ Keep |
| API Design | 7.5/10 | 🟡 Add pagination |
| Frontend | 7.5/10 | 🔴 Add error boundary |
| Error Handling | 7/10 | 🟡 Improve logging |
| Performance | 6.5/10 | 🟡 Add caching |
| Testing | 0/10 | 🔴 Add tests |
| Documentation | 5/10 | 🟡 Add API docs |

**Overall: 7.1/10**

---

## 🚀 DEPLOYMENT CHECKLIST

### Phase 1: Critical Fixes (Week 1) 🔴

- [ ] Fix XSS vulnerabilities (DOMPurify)
- [ ] Add error boundaries
- [ ] Replace SELECT * with explicit columns
- [ ] Add basic unit tests (auth, utils)

### Phase 2: High Priority (Week 2) 🟡

- [ ] Add input validators to all endpoints
- [ ] Fix N+1 queries
- [ ] Add pagination to collections
- [ ] Add structured logging

### Phase 3: Medium Priority (Next Sprint) 🟢

- [ ] Implement Redis caching
- [ ] Add API documentation (Swagger)
- [ ] Increase test coverage to 60%+
- [ ] Performance optimization (lazy images, code splitting)

### Phase 4: Optional (Later) 📝

- [ ] Migrate to TypeScript
- [ ] Add monitoring (Sentry/DataDog)
- [ ] Setup CI/CD pipeline
- [ ] Add analytics tracking

---

## 📝 RECOMMENDATIONS

1. **Security First**
   - Deploy with XSS fix immediately
   - Use security headers (helmet.js)
   - Add rate limiting to all endpoints

2. **Quality Assurance**
   - Enforce minimum 60% test coverage
   - Setup pre-commit hooks (husky)
   - Code review on all PRs

3. **Performance**
   - Monitor query times (New Relic/DataDog)
   - Setup CDN for static assets
   - Implement proper caching strategy

4. **Developer Experience**
   - Add API documentation
   - Create contributing guidelines
   - Setup automated testing

---

## 🎓 NEXT STEPS

1. **Immediate (Today):** Fix XSS vulnerabilities
2. **This Week:** Add error boundaries + basic tests
3. **Next Week:** Refactor queries + add validation
4. **Next Sprint:** Caching + documentation
5. **Future:** TypeScript migration (optional)

---

**Report Generated:** 06/06/2026  
**Reviewer:** Code Review Agent  
**Recommendation:** PROCEED WITH FIXES → DEPLOY TO STAGING → TEST → PRODUCTION
