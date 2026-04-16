import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getGrades } from '../../api/subjectApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const LEVEL_ICONS = { 'cap-1': '🏫', 'cap-2': '🏛️', 'cap-3': '🎓' };
const GRADE_ICONS = ['🌱', '🌿', '🌳', '⭐', '🏆', '📘', '📗', '📙', '📕', '📓', '📔', '📒'];

const GradeList = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGrades()
      .then((res) => setLevels(res.data))
      .catch(() => setError('Không thể tải danh sách lớp'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;

  const currentLevel = levels.find((l) => l.slug === selectedLevel);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          {selectedLevel ? (
            <>
              <button className="breadcrumb-btn" onClick={() => setSelectedLevel(null)}>Phổ thông</button>
              <span className="breadcrumb-sep">›</span>
              <span>{currentLevel?.level}</span>
            </>
          ) : (
            <span>Phổ thông</span>
          )}
        </div>

        {/* Bước 1: Chọn cấp */}
        {!selectedLevel && (
          <>
            <h1>Chọn cấp học</h1>
            <p>Học toán theo chương trình sách giáo khoa</p>
          </>
        )}

        {/* Bước 2: Chọn lớp */}
        {selectedLevel && (
          <div className="grade-step-header">
            <button className="btn btn--outline btn--back" onClick={() => setSelectedLevel(null)}>
              <FiArrowLeft /> Chọn lại cấp
            </button>
            <div>
              <h1>{currentLevel?.level}</h1>
              <p>Chọn lớp để bắt đầu học</p>
            </div>
          </div>
        )}
      </div>

      {/* Bước 1: Hiển thị các cấp */}
      {!selectedLevel && (
        <div className="level-card-grid">
          {levels.map((level) => (
            <button
              key={level.slug}
              className="level-card"
              onClick={() => setSelectedLevel(level.slug)}
            >
              <span className="level-card-icon">{LEVEL_ICONS[level.slug] || '📚'}</span>
              <h2>{level.level}</h2>
              <p>{level.grades.length} lớp · {level.grades[0]?.name} – {level.grades[level.grades.length - 1]?.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Bước 2: Hiển thị các lớp trong cấp đã chọn */}
      {selectedLevel && currentLevel && (
        <div className="card-grid">
          {currentLevel.grades.map((grade, idx) => (
            <Link key={grade.id} to={`/pho-thong/${grade.slug}`} className="grade-card">
              <span className="grade-icon">{GRADE_ICONS[idx] || '📚'}</span>
              <h3>{grade.name}</h3>
              <p>Chương trình Toán</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeList;
