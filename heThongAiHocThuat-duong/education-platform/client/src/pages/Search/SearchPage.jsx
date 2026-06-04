import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiBookOpen, FiSearch, FiTarget } from 'react-icons/fi';
import { searchContent } from '../../api/searchApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q || q.length < 2) { setResults(null); return; }
    setLoading(true);
    setError('');
    searchContent(q)
      .then((res) => setResults(res.data))
      .catch(() => setError('Không thể thực hiện tìm kiếm'))
      .finally(() => setLoading(false));
  }, [q]);

  const total = results
    ? (results.lessons?.length || 0) + (results.paths?.length || 0) + (results.skill_lessons?.length || 0)
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiSearch style={{ marginRight: 8 }} />Kết quả tìm kiếm</h1>
        {q && <p>Từ khoá: <strong>"{q}"</strong></p>}
      </div>

      {!q && (
        <div className="search-empty">
          <p>Nhập từ khoá vào thanh tìm kiếm phía trên để tìm bài học hoặc lộ trình.</p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <p className="form-error">{error}</p>}

      {results && !loading && (
        <>
          <p className="search-count">Tìm thấy <strong>{total}</strong> kết quả</p>

          {/* Lessons */}
          {results.lessons?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title"><FiBookOpen /> Bài học phổ thông</h2>
              <div className="search-results">
                {results.lessons.map((l) => (
                  <Link key={l.id} to={`/lesson/${l.id}`} className="search-result-item">
                    <div>
                      <span className="search-result-title">{l.title}</span>
                      <span className="search-result-meta">
                        {l.grade_name} · {l.chapter_title}
                      </span>
                    </div>
                    <span className="badge badge--blue">Phổ thông</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Skill Paths */}
          {results.paths?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title"><FiTarget /> Lộ trình kỹ năng</h2>
              <div className="search-results">
                {results.paths.map((p) => (
                  <Link key={p.id} to={`/skill-paths/${p.slug}`} className="search-result-item">
                    <div>
                      <span className="search-result-title">{p.title}</span>
                      <span className="search-result-meta">
                        {p.module_count} modules · {p.estimated_hours}h
                      </span>
                    </div>
                    <span className={`badge badge--${p.difficulty === 'beginner' ? 'green' : 'blue'}`}>
                      {p.difficulty === 'beginner' ? 'Cơ bản' : 'Trung cấp'}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Skill Lessons */}
          {results.skill_lessons?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-title"><FiBookOpen /> Bài học kỹ năng</h2>
              <div className="search-results">
                {results.skill_lessons.map((sl) => (
                  <Link key={sl.id} to={`/skill-paths/lesson/${sl.id}`} className="search-result-item">
                    <div>
                      <span className="search-result-title">{sl.title}</span>
                      <span className="search-result-meta">
                        {sl.path_title} · {sl.module_title}
                      </span>
                    </div>
                    <span className="badge badge--green">Kỹ năng</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {total === 0 && (
            <div className="search-empty">
              <p>Không tìm thấy kết quả nào cho "<strong>{q}</strong>".</p>
              <p>Hãy thử từ khoá khác hoặc duyệt qua các <Link to="/pho-thong">bài học phổ thông</Link>.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
