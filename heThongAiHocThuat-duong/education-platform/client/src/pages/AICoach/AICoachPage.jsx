import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSend, FiRefreshCw } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import useAuth from '../../hooks/useAuth';

/* ── Quick Actions ─────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: '💡 Hôm nay nên học gì?',    id: 'hom-nay-hoc-gi',  text: 'Hôm nay tôi nên học gì để cải thiện tiến độ?' },
  { label: '🎯 Luyện điểm yếu của tôi', id: 'luyen-diem-yeu',   text: 'Hãy tạo bài tập để luyện các điểm yếu của tôi.' },
  { label: '⚡ Tạo quiz 5 câu nhanh',    id: 'quiz-nhanh',       text: 'Tạo cho tôi 5 câu trắc nghiệm Toán lớp 9 độ khó trung bình.' },
  { label: '📖 Giải thích dễ hiểu hơn', id: 'giai-thich',        text: 'Hãy giải thích khái niệm hàm số bậc hai một cách dễ hiểu nhất.' },
];

const AI_NAME = 'Lumi';

/* ── Message bubble ─────────────────────────────────── */
const Bubble = ({ msg }) => (
  <div className={`coach-bubble coach-bubble--${msg.role}`}>
    {msg.role === 'assistant' && (
      <div className="coach-bubble-avatar">L</div>
    )}
    <div className="coach-bubble-content">
      {msg.text.split('\n').map((line, i) => (
        <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>{line || <br />}</p>
      ))}
    </div>
  </div>
);

/* ── Main ─────────────────────────────────────────────── */
const AICoachPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const initQ = searchParams.get('q');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Xin chào${user?.display_name ? ', ' + user.display_name : ''}! 👋 Mình là **${AI_NAME}** — trợ lý học tập AI của bạn.\n\nMình có thể giúp bạn:\n• Lên kế hoạch học tập hàng ngày\n• Tạo bài tập theo yêu cầu\n• Giải thích bài học khó\n• Phân tích điểm mạnh, điểm yếu\n\nBạn muốn bắt đầu từ đâu? 🎯`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-fill từ query param
  useEffect(() => {
    if (!initQ) return;
    const action = QUICK_ACTIONS.find(a => a.id === initQ);
    if (action) handleSend(action.text);
  }, []); // eslint-disable-line

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Tạo phản hồi AI dựa trên nội dung tin nhắn người dùng
      // (sẽ tích hợp Gemini chat API khi có endpoint riêng)
      await new Promise(r => setTimeout(r, 800)); // simulate thinking
      let aiText = generateChatResponse(trimmed, user);

      setMessages(prev => [...prev, { role: 'assistant', text: aiText }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Xin lỗi, mình gặp lỗi kết nối. Bạn thử lại nhé! 🔄',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      text: `Đã xoá lịch sử chat. Mình là ${AI_NAME}, bạn cần gì mình giúp? 😊`,
    }]);
  };

  return (
    <div className="coach-page">
      {/* Header */}
      <div className="coach-header">
        <div className="coach-header-left">
          <div className="coach-avatar-lg">L</div>
          <div>
            <div className="coach-name">{AI_NAME} <span className="coach-online">● Online</span></div>
            <div className="coach-sub">AI Learning Companion của bạn</div>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={clearChat}>
          <FiRefreshCw size={14} /> Xoá chat
        </button>
      </div>

      {/* Quick Actions */}
      <div className="coach-quick-actions">
        {QUICK_ACTIONS.map(a => (
          <button key={a.id} className="coach-quick-btn" onClick={() => handleSend(a.text)}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="coach-messages">
        {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
        {loading && (
          <div className="coach-bubble coach-bubble--assistant">
            <div className="coach-bubble-avatar">L</div>
            <div className="coach-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="coach-input-area">
        <textarea
          ref={inputRef}
          className="coach-input"
          placeholder="Hỏi Lumi bất cứ điều gì về học tập..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="btn btn--primary btn--icon coach-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
};

/* ── Local AI response (fallback khi không có chat API) ── */
function generateChatResponse(input, user) {
  const name = user?.display_name || 'bạn';
  const lower = input.toLowerCase();

  if (lower.includes('hôm nay') || lower.includes('học gì')) {
    return `Chào ${name}! Hôm nay mình gợi ý bạn:\n\n📚 **Học lý thuyết:** Ôn lại 1 bài mới trong chương trình\n⚡ **Luyện tập:** Làm 10 câu trắc nghiệm để củng cố\n🎯 **Mục tiêu:** Duy trì streak học tập mỗi ngày\n\nBạn muốn mình tạo bài tập cho môn nào không? 😊`;
  }

  if (lower.includes('điểm yếu') || lower.includes('luyện')) {
    return `Để luyện điểm yếu hiệu quả, ${name} nên:\n\n1️⃣ **Xác định chủ đề yếu** — xem dashboard tiến độ\n2️⃣ **Luyện 15 phút/ngày** — đều đặn hơn học dồn\n3️⃣ **Làm bài sai lại** — hiểu tại sao sai trước khi qua bài mới\n\nBạn đang yếu môn nào? Mình tạo bài tập riêng cho bạn nhé! 💪`;
  }

  if (lower.includes('quiz') || lower.includes('bài tập') || lower.includes('câu hỏi')) {
    return `Mình gợi ý một số câu hỏi Toán lớp 9:\n\n**Câu 1:** Giải phương trình: x² - 5x + 6 = 0\nA. x = 2 hoặc x = 3 ✅\nB. x = 1 hoặc x = 6\nC. x = -2 hoặc x = -3\nD. x = 2 hoặc x = -3\n\n**Câu 2:** Rút gọn: √(x² - 4x + 4) với x < 2\nA. x - 2\nB. 2 - x ✅\nC. |x - 2|\nD. x + 2\n\nBạn muốn thêm câu hỏi hoặc chọn chủ đề khác không? 📝`;
  }

  if (lower.includes('giải thích') || lower.includes('hàm số') || lower.includes('khái niệm')) {
    return `**Hàm số bậc hai** y = ax² + bx + c (a ≠ 0)\n\n🔑 **Đặc điểm chính:**\n• Đồ thị là **parabola** (đường cong hình chữ U hoặc ∩)\n• Nếu a > 0: cong lên ∪, có **điểm cực tiểu**\n• Nếu a < 0: cong xuống ∩, có **điểm cực đại**\n\n📌 **Đỉnh của parabola:** x = -b/(2a)\n\n💡 **Mẹo nhớ:** "a dương thì cười (∪), a âm thì buồn (∩)"\n\nBạn muốn mình giải thích phần nào thêm? 😊`;
  }

  if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
    return `Chào ${name}! 👋 Mình là Lumi, trợ lý học tập AI của bạn.\n\nMình có thể giúp bạn:\n• 📚 Lên kế hoạch học hôm nay\n• ⚡ Tạo bài tập theo yêu cầu\n• 🎯 Giải thích bài khó\n• 📊 Phân tích tiến độ học tập\n\nBạn cần mình giúp gì hôm nay? 🌟`;
  }

  // Default
  return `Cảm ơn ${name} đã chia sẻ! 😊\n\nMình hiểu bạn đang hỏi về: "${input.slice(0, 60)}..."\n\nĐể mình giúp tốt hơn, bạn có thể:\n• Nói rõ hơn môn học và lớp bạn đang học\n• Hoặc chọn một trong các gợi ý phía trên\n\nMình luôn ở đây để đồng hành cùng bạn! 🤖✨`;
}

export default AICoachPage;
