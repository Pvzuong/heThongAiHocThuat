import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubjectsByGrade } from '../../api/subjectApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const SUBJECT_ICONS = { toan: '🔢', 'tieng-viet': '📖', default: '📚' };

const SubjectList = () => {
  const { gradeSlug } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradeName = gradeSlug.replace('lop-', 'Lớp ');

  useEffect(() => {
    getSubjectsByGrade(gradeSlug)
      .then((res) => setSubjects(res.data))
      .catch(() => setError('Không thể tải danh sách môn học'))
      .finally(() => setLoading(false));
  }, [gradeSlug]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong">Phổ thông</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{gradeName}</span>
        </div>
        <h1>{gradeName}</h1>
        <p>Chọn môn học để bắt đầu</p>
      </div>

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
    </div>
  );
};

export default SubjectList;
