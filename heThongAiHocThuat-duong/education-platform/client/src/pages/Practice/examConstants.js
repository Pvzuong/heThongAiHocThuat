// Loại chương trình
export const PROGRAM_TYPES = [
  { value: 'pho_thong', label: 'Phổ thông' },
  { value: 'ky_nang', label: 'Kỹ năng nghề nghiệp' },
];

// Cấp học (chỉ áp dụng cho Phổ thông)
export const EDUCATION_LEVELS = [
  { value: 'tieu_hoc', label: 'Tiểu học', grades: [1,2,3,4,5] },
  { value: 'thcs', label: 'THCS', grades: [6,7,8,9] },
  { value: 'thpt', label: 'THPT', grades: [10,11,12] },
];

// Cấp độ kỹ năng nghề nghiệp (thay cho "cấp học")
export const SKILL_LEVELS = [
  { value: 'co_ban', label: 'Cơ bản', grades: [1] },
  { value: 'trung_cap', label: 'Trung cấp', grades: [2] },
  { value: 'nang_cao', label: 'Nâng cao', grades: [3] },
];

// Môn học theo loại chương trình + cấp học
export const SUBJECTS_BY_LEVEL = {
  pho_thong: {
    tieu_hoc: ['Toán','Tiếng Việt','Tự nhiên & Xã hội','Đạo đức','Tiếng Anh'],
    thcs: ['Toán','Ngữ văn','Vật lý','Hóa học','Sinh học','Lịch sử','Địa lý','Tiếng Anh'],
    thpt: ['Toán','Ngữ văn','Vật lý','Hóa học','Sinh học','Lịch sử','Địa lý','Tiếng Anh','GDCD'],
  },
  ky_nang: {
    co_ban:    ['Frontend Developer','Backend Developer','UI/UX Design','Digital Marketing','Data Analyst','Lập trình Python'],
    trung_cap: ['React / Next.js','Node.js / Express','DevOps cơ bản','Mobile App (Flutter)','Machine Learning cơ bản','SQL & Database'],
    nang_cao:  ['Kiến trúc phần mềm','Cloud AWS/GCP','AI & Deep Learning','Quản lý dự án IT','Security & Pentest','Full-stack nâng cao'],
  },
};

// Chủ đề theo môn kỹ năng nghề nghiệp
export const TOPICS_BY_SKILL_SUBJECT = {
  'Frontend Developer': ['HTML & CSS cơ bản','JavaScript cơ bản','Responsive Design','React cơ bản','State Management','API Integration','Tổng hợp'],
  'Backend Developer': ['Node.js cơ bản','REST API','Authentication','Database thiết kế','Middleware','Deployment','Tổng hợp'],
  'UI/UX Design': ['Design Thinking','Wireframing','Figma cơ bản','User Research','Prototype','Usability Testing','Tổng hợp'],
  'Digital Marketing': ['SEO cơ bản','Google Ads','Social Media Marketing','Email Marketing','Analytics','Content Marketing','Tổng hợp'],
  'Data Analyst': ['Excel nâng cao','SQL cơ bản','Python cho Data','Visualization','Statistics','Báo cáo & Dashboard','Tổng hợp'],
  'Lập trình Python': ['Cú pháp Python','Hàm & Module','OOP','File & I/O','Thư viện phổ biến','Project thực tế','Tổng hợp'],
  'React / Next.js': ['React Hooks','Component Design','Routing','SSR & SSG','Performance','Testing','Tổng hợp'],
  'Node.js / Express': ['Express routing','Middleware','JWT Auth','File upload','WebSocket','Microservices','Tổng hợp'],
  'DevOps cơ bản': ['Linux cơ bản','Docker','CI/CD Pipeline','Git workflow','Monitoring','Nginx','Tổng hợp'],
  'Mobile App (Flutter)': ['Dart cơ bản','Widget','State Management','Navigation','API calls','Build & Deploy','Tổng hợp'],
  'Machine Learning cơ bản': ['Thuật toán ML','Scikit-learn','Data preprocessing','Model evaluation','Regression','Classification','Tổng hợp'],
  'SQL & Database': ['SELECT cơ bản','JOIN','Subquery','Index & Performance','Stored Procedure','Database Design','Tổng hợp'],
  'Kiến trúc phần mềm': ['Design Patterns','SOLID principles','Microservices','Event-driven','Domain-driven Design','Tổng hợp'],
  'Cloud AWS/GCP': ['Cloud cơ bản','EC2 & Compute','Storage','Networking','Serverless','Cost Optimization','Tổng hợp'],
  'AI & Deep Learning': ['Neural Network','CNN','RNN & LSTM','NLP cơ bản','Transfer Learning','Model Deployment','Tổng hợp'],
  'Quản lý dự án IT': ['Agile & Scrum','Kanban','Sprint Planning','Risk Management','Stakeholder','KPI & Metrics','Tổng hợp'],
  'Security & Pentest': ['OWASP Top 10','Network Security','Pentest cơ bản','Web Vulnerabilities','Cryptography','Incident Response','Tổng hợp'],
  'Full-stack nâng cao': ['System Design','Scalability','Caching','Message Queue','API Gateway','Production Best Practices','Tổng hợp'],
};

// Chủ đề theo môn học phổ thông + lớp
export const TOPICS_BY_SUBJECT_GRADE = {
  'Toán': {
    1: ['Số đếm (1–10)','Phép cộng trong phạm vi 10','Phép trừ trong phạm vi 10','Số đếm (1–100)','Phép cộng trong phạm vi 100','Hình học cơ bản','Tổng hợp'],
    2: ['Phép cộng có nhớ','Phép trừ có nhớ','Bảng nhân 2,3,4,5','Bảng nhân 6,7,8,9','Phép chia','Hình chữ nhật, hình vuông','Tổng hợp'],
    3: ['Nhân số có 2 chữ số','Chia số có 2 chữ số','Phân số đơn giản','Chu vi hình chữ nhật','Diện tích hình chữ nhật','Bài toán có lời văn','Tổng hợp'],
    4: ['Phân số','Cộng trừ phân số','Nhân chia phân số','Số thập phân','Tìm x','Diện tích hình bình hành','Tổng hợp'],
    5: ['Số thập phân nâng cao','Tỉ số phần trăm','Thể tích hình hộp','Diện tích hình tròn','Bài toán chuyển động','Tổng hợp'],
    6: ['Số nguyên','Phân số','Tỉ số','Hình học phẳng','Thống kê','Tổng hợp'],
    7: ['Số hữu tỉ','Hàm số','Tam giác','Thống kê','Tổng hợp'],
    8: ['Đa thức','Phương trình','Bất phương trình','Hình học không gian','Tổng hợp'],
    9: ['Căn thức','Hàm số bậc nhất','Phương trình bậc hai','Hình học phẳng nâng cao','Tổng hợp'],
    10: ['Mệnh đề','Hàm số','Phương trình','Vectơ','Tổng hợp'],
    11: ['Giới hạn','Đạo hàm','Lượng giác','Tổ hợp xác suất','Tổng hợp'],
    12: ['Tích phân','Số phức','Hình học không gian','Tổng hợp'],
  },
  'Tiếng Việt': {
    1: ['Âm và chữ','Vần','Đọc hiểu','Tập viết','Tổng hợp'],
    2: ['Đọc hiểu','Chính tả','Luyện từ và câu','Tập làm văn','Tổng hợp'],
    3: ['Đọc hiểu','Từ và câu','Tập làm văn','Chính tả','Tổng hợp'],
    4: ['Đọc hiểu','Từ ghép, từ láy','Câu đơn, câu phức','Tập làm văn','Tổng hợp'],
    5: ['Đọc hiểu','Nghĩa của từ','Các kiểu câu','Tập làm văn','Tổng hợp'],
  },
  'Ngữ văn': {
    6: ['Văn bản tự sự','Văn miêu tả','Tiếng Việt cơ bản','Tổng hợp'],
    7: ['Văn bản nghị luận','Thơ trữ tình','Tiếng Việt nâng cao','Tổng hợp'],
    8: ['Văn học hiện đại','Nghị luận xã hội','Tiếng Việt thực hành','Tổng hợp'],
    9: ['Văn học trung đại','Nghị luận văn học','Ôn tập tổng hợp','Tổng hợp'],
    10: ['Văn học dân gian','Văn học trung đại','Nghị luận','Tổng hợp'],
    11: ['Văn học hiện đại','Thơ mới','Nghị luận xã hội','Tổng hợp'],
    12: ['Văn học sau 1945','Nghị luận văn học','Ôn thi','Tổng hợp'],
  },
  'Vật lý': {
    6: ['Đo lường','Lực','Áp suất','Nhiệt học','Tổng hợp'],
    7: ['Quang học','Âm học','Điện học cơ bản','Tổng hợp'],
    8: ['Cơ học','Nhiệt học nâng cao','Điện học','Tổng hợp'],
    9: ['Điện từ','Quang học nâng cao','Hạt nhân cơ bản','Tổng hợp'],
    10: ['Động học','Động lực học','Cân bằng vật rắn','Tổng hợp'],
    11: ['Điện trường','Dòng điện','Từ trường','Tổng hợp'],
    12: ['Dao động','Sóng','Lượng tử ánh sáng','Hạt nhân','Tổng hợp'],
  },
  'default': {
    default: ['Chương 1','Chương 2','Chương 3','Ôn tập','Tổng hợp'],
  },
};

export function getTopics(subject, grade, programType) {
  // Kỹ năng nghề nghiệp dùng bảng riêng
  if (programType === 'ky_nang') {
    return TOPICS_BY_SKILL_SUBJECT[subject] || ['Kiến thức cơ bản','Thực hành','Dự án','Tổng hợp'];
  }
  const bySubject = TOPICS_BY_SUBJECT_GRADE[subject];
  if (!bySubject) return TOPICS_BY_SUBJECT_GRADE['default']['default'];
  return bySubject[grade] || bySubject['default'] || TOPICS_BY_SUBJECT_GRADE['default']['default'];
}

export function getLevelsForProgram(programType) {
  if (programType === 'ky_nang') return SKILL_LEVELS;
  return EDUCATION_LEVELS;
}

export const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ', color: '#16a34a' },
  { value: 'medium', label: 'Trung bình', color: '#2563eb' },
  { value: 'hard', label: 'Khó', color: '#dc2626' },
];

export const DIFFICULTY_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

// Practice mode constants (luyện tập)
export const PRACTICE_GRADES = [6,7,8,9,10,11,12];

export const PRACTICE_TOPICS_BY_GRADE = {
  1: ['Số đếm (1–10)','Phép cộng trong phạm vi 10','Phép trừ trong phạm vi 10','Số đếm (1–100)','Hình học cơ bản','Tổng hợp'],
  2: ['Phép cộng có nhớ','Phép trừ có nhớ','Bảng nhân 2,3,4,5','Bảng nhân 6,7,8,9','Phép chia','Tổng hợp'],
  3: ['Nhân số có 2 chữ số','Chia số','Phân số đơn giản','Chu vi hình chữ nhật','Bài toán có lời văn','Tổng hợp'],
  4: ['Phân số','Cộng trừ phân số','Nhân chia phân số','Số thập phân','Diện tích','Tổng hợp'],
  5: ['Số thập phân nâng cao','Tỉ số phần trăm','Thể tích','Diện tích hình tròn','Chuyển động','Tổng hợp'],
  6: ['Số nguyên','Phân số','Tỉ số','Hình học phẳng','Thống kê','Tổng hợp'],
  7: ['Số hữu tỉ','Hàm số','Tam giác','Thống kê','Tổng hợp'],
  8: ['Đa thức','Phương trình','Bất phương trình','Hình học','Tổng hợp'],
  9: ['Căn thức','Hàm số bậc nhất','Phương trình bậc hai','Tổng hợp'],
  10: ['Mệnh đề','Hàm số','Phương trình','Vectơ','Tổng hợp'],
  11: ['Giới hạn','Đạo hàm','Lượng giác','Tổ hợp xác suất','Tổng hợp'],
  12: ['Tích phân','Số phức','Hình học không gian','Tổng hợp'],
};

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'fill_in_blank', label: 'Điền vào chỗ trống' },
];
