import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const GOALS = [
  { id: 'score',    icon: '📈', label: 'Tăng điểm trên trường' },
  { id: 'thpt',     icon: '🎓', label: 'Ôn thi THPT Quốc gia' },
  { id: 'code',     icon: '💻', label: 'Học lập trình' },
  { id: 'skill',    icon: '🛠', label: 'Học nghề / kỹ năng mới' },
  { id: 'english',  icon: '🌍', label: 'Cải thiện tiếng Anh' },
];

const GROUPS = [
  { id: 'thcs',  icon: '📚', label: 'THCS',     sub: 'Lớp 6 - 9' },
  { id: 'thpt',  icon: '🎓', label: 'THPT',      sub: 'Lớp 10 - 12' },
  { id: 'sv',    icon: '🏫', label: 'Sinh viên', sub: 'Đại học / Cao đẳng' },
  { id: 'skill', icon: '💼', label: 'Học nghề',  sub: 'Kỹ năng nghề nghiệp' },
];

const AI_PLANS = {
  thcs:  { title: 'Toán lớp 9', goal: 'Nắm vững chương trình THCS', weeks: ['Hàm số & Đồ thị', 'Phương trình bậc hai', 'Hình học không gian'] },
  thpt:  { title: 'Toán lớp 12', goal: 'Chuẩn bị thi THPT', weeks: ['Đạo hàm & Tích phân', 'Hàm số & Đồ thị', 'Lượng giác'] },
  sv:    { title: 'Frontend Developer', goal: 'Xây dựng kỹ năng lập trình', weeks: ['HTML & CSS cơ bản', 'JavaScript nâng cao', 'React Framework'] },
  skill: { title: 'Backend Developer', goal: 'Trở thành developer chuyên nghiệp', weeks: ['Node.js & Express', 'Cơ sở dữ liệu', 'REST API & Auth'] },
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step,  setStep]  = useState(1);
  const [goals, setGoals] = useState([]);
  const [group, setGroup] = useState('');

  const toggleGoal = (id) => setGoals(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]);

  const plan = AI_PLANS[group] || AI_PLANS.thcs;

  const finish = () => {
    localStorage.setItem('lh_onboarded', '1');
    localStorage.setItem('lh_group', group);
    localStorage.setItem('lh_goals', JSON.stringify(goals));
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div className="onboarding-dots">
          {[1,2,3].map(s => (
            <div key={s} className={`onboarding-dot${step >= s ? ' onboarding-dot--active' : ''}`} />
          ))}
        </div>

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">🎯</div>
            <h2>Mục tiêu của bạn là gì?</h2>
            <p>Chọn một hoặc nhiều mục tiêu để AI cá nhân hóa kế hoạch học tập.</p>
            <div className="onboarding-options">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className={`onboarding-option${goals.includes(g.id) ? ' onboarding-option--selected' : ''}`}
                  onClick={() => toggleGoal(g.id)}
                >
                  <span className="onboarding-option-icon">{g.icon}</span>
                  <span>{g.label}</span>
                  {goals.includes(g.id) && <FiCheck className="onboarding-option-check" />}
                </button>
              ))}
            </div>
            <button
              className="btn btn--primary btn--full btn--lg"
              disabled={goals.length === 0}
              onClick={() => setStep(2)}
            >
              Tiếp tục <FiArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Group */}
        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">👋</div>
            <h2>Bạn thuộc nhóm nào?</h2>
            <p>Giúp AI tạo kế hoạch phù hợp với trình độ của bạn.</p>
            <div className="onboarding-groups">
              {GROUPS.map(g => (
                <button
                  key={g.id}
                  className={`onboarding-group${group === g.id ? ' onboarding-group--selected' : ''}`}
                  onClick={() => setGroup(g.id)}
                >
                  <span className="onboarding-group-icon">{g.icon}</span>
                  <div>
                    <div className="onboarding-group-label">{g.label}</div>
                    <div className="onboarding-group-sub">{g.sub}</div>
                  </div>
                  {group === g.id && <FiCheck className="onboarding-group-check" />}
                </button>
              ))}
            </div>
            <button
              className="btn btn--primary btn--full btn--lg"
              disabled={!group}
              onClick={() => setStep(3)}
            >
              Tiếp tục <FiArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: AI Plan */}
        {step === 3 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">🤖</div>
            <h2>AI đã tạo kế hoạch cho bạn!</h2>
            <p>Dựa trên mục tiêu và nhóm của bạn, đây là kế hoạch 90 ngày:</p>

            <div className="onboarding-plan">
              <div className="onboarding-plan-header">
                <span className="onboarding-plan-icon">📚</span>
                <div>
                  <div className="onboarding-plan-title">{plan.title}</div>
                  <div className="onboarding-plan-goal">Mục tiêu: {plan.goal}</div>
                </div>
              </div>
              <div className="onboarding-plan-weeks">
                <div className="onboarding-plan-label">Kế hoạch tuần này:</div>
                {plan.weeks.map((w, i) => (
                  <div key={i} className="onboarding-plan-week">
                    <span className="onboarding-week-num">Tuần {i + 1}</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn--primary btn--full btn--lg" onClick={finish}>
              🚀 Bắt đầu học ngay!
            </button>
            <button className="btn btn--ghost btn--full btn--sm" style={{ marginTop: 8 }} onClick={finish}>
              Bỏ qua, tự khám phá
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
