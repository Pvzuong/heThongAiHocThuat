import { useEffect, useState } from 'react';
import { FiSave, FiZap } from 'react-icons/fi';
import { getGeminiSettings, updateGeminiSettings, testGeminiGenerate } from '../../api/adminApi';

const MODELS = [
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

const GeminiSettings = () => {
  const [form, setForm] = useState({
    gemini_api_key: '',
    gemini_model: 'gemini-pro',
    gemini_prompt_template: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getGeminiSettings()
      .then((res) => {
        setForm({
          gemini_api_key: res.data.gemini_api_key || '',
          gemini_model: res.data.gemini_model || 'gemini-pro',
          gemini_prompt_template: res.data.gemini_prompt_template || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      // Không gửi API key nếu đang hiển thị masked (****xxxx)
      const payload = { ...form };
      if (payload.gemini_api_key.startsWith('****')) {
        delete payload.gemini_api_key;
      }
      await updateGeminiSettings(payload);
      setSaveMsg('Đã lưu cài đặt!');
    } catch {
      setSaveMsg('Lỗi khi lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResult('');
    try {
      const res = await testGeminiGenerate(testPrompt);
      setTestResult(res.data.result);
    } catch (err) {
      setTestResult(`Lỗi: ${err.response?.data?.error || 'Không thể kết nối'}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="admin-loading">Đang tải cài đặt...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Cài đặt Gemini AI</h2>
        <span className="badge badge--blue">MVP Placeholder</span>
      </div>

      <form onSubmit={handleSave} className="admin-form">
        <div className="form-group">
          <label className="form-label">API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="Nhập Gemini API key..."
            value={form.gemini_api_key}
            onChange={(e) => setForm({ ...form, gemini_api_key: e.target.value })}
            autoComplete="off"
          />
          <span className="form-hint">Key sẽ được mã hoá. Hiện tại chỉ hiển thị 4 ký tự cuối.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <select
            className="form-input"
            value={form.gemini_model}
            onChange={(e) => setForm({ ...form, gemini_model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Prompt Template</label>
          <textarea
            className="form-input"
            rows={5}
            placeholder="Nhập template prompt mặc định cho việc tạo nội dung..."
            value={form.gemini_prompt_template}
            onChange={(e) => setForm({ ...form, gemini_prompt_template: e.target.value })}
          />
          <span className="form-hint">Template này sẽ được dùng khi auto-generate nội dung bài học.</span>
        </div>

        <div className="admin-form-footer">
          {saveMsg && (
            <span className={`admin-save-msg ${saveMsg.includes('Lỗi') ? 'admin-save-msg--error' : 'admin-save-msg--ok'}`}>
              {saveMsg}
            </span>
          )}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>

      {/* Test generate */}
      <div className="admin-divider" />
      <div className="admin-section-header">
        <h3>Thử nghiệm Generate</h3>
      </div>
      <div className="admin-test-area">
        <textarea
          className="form-input"
          rows={3}
          placeholder="Nhập prompt để thử..."
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
        />
        <button
          className="btn btn--secondary"
          onClick={handleTest}
          disabled={testing || !testPrompt.trim()}
        >
          <FiZap /> {testing ? 'Đang tạo...' : 'Thử generate'}
        </button>
        {testResult && (
          <div className="admin-test-result">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiSettings;
