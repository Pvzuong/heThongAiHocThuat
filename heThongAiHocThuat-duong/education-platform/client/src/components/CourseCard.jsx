import { useNavigate } from 'react-router-dom';

const SUBJECT_ICONS = { toan: '🔢', default: '📚' };
const SUBJECT_BG = {
  toan: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  default: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const pct = course.total_lessons > 0
    ? Math.round((course.completed_lessons / course.total_lessons) * 100)
    : 0;
  const done = pct === 100;
  const courseUrl = `/pho-thong/${course.grade_slug}/${course.subject_slug}`;
  const nextLesson = course.nextLesson || course.next_lesson;

  return (
    <div className="pf-course-card" onClick={() => navigate(courseUrl)}>
      <div
        className="pf-course-preview"
        style={{ background: SUBJECT_BG[course.subject_slug] || SUBJECT_BG.default }}
      >
        <span className="pf-course-preview-icon">
          {SUBJECT_ICONS[course.subject_slug] || SUBJECT_ICONS.default}
        </span>
      </div>

      <div className="pf-course-body">
        <span className={`pf-course-badge ${done ? 'pf-course-badge--green' : 'pf-course-badge--blue'}`}>
          {done ? 'Hoàn thành' : 'Đang học'}
        </span>

        <div className="pf-course-title">
          {course.subject_name} — {course.grade_name}
        </div>

        <div className="pf-course-progress">
          <div className="pf-course-progress-bar">
            <div className="pf-course-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="pf-course-progress-pct">{pct}%</span>
        </div>

        <button
          className="pf-course-continue-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(nextLesson ? `/lesson/${nextLesson.id}` : courseUrl);
          }}
        >
          Tiếp tục học →
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
