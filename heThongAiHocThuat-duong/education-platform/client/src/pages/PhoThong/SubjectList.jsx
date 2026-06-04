import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubjectsByGrade } from '../../api/subjectApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const SUBJECT_ICONS = { toan: '🔢', 'tieng-viet': '📖', default: '📚' };

const getLevelFromGrade = (gradeSlug) => {
  const num = parseInt(gradeSlug.replace('lop-', ''));
  if (num <= 5) return { slug: 'cap-1', name: 'Cấp 1' };
  if (num <= 9) return { slug: 'cap-2', name: 'Cấp 2' };
  return { slug: 'cap-3', name: 'Cấp 3' };
};

const SubjectList = () => {
  const { gradeSlug } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradeName = gradeSlug.replace('lop-', 'Lớp ');
  const level = getLevelFromGrade(gradeSlug);

  useEffect(() => {
    getSubjectsByGrade(gradeSlug)
      .then((res) => setSubjects(res.data))
      .catch(() => setError('error'))
      .finally(() => setLoading(false));
  }, [gradeSlug]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong">Phổ thông</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong" state={{ level: level.slug }}>{level.name}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{gradeName}</span>
        </div>
        <h1>{gradeName}</h1>
        <p>Chọn môn học để bắt đầu</p>
      </div>

      {error || subjects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📚</span>
          <h3>Chưa có môn học</h3>
          <p>Nội dung cho {gradeName} đang được chuẩn bị. Vui lòng quay lại sau!</p>
          <Link to="/pho-thong" state={{ level: level.slug }} className="btn btn--outline" style={{ marginTop: '1rem' }}>
            ← Chọn lớp khác
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/pho-thong/${gradeSlug}/${subject.slug}`}
              className="subject-card"
            >
              <span className="subject-icon">
                {SUBJECT_ICONS[subject.slug] || SUBJECT_ICONS.default}
              </span>
              <h3>{subject.name}</h3>
              {subject.description && <p>{subject.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectList;
