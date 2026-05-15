const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Gemini quota exceeded
  if (err.message?.includes('429') || err.message?.includes('Too Many Requests') || err.message?.includes('quota')) {
    return res.status(429).json({ error: 'Hết lượt tạo câu hỏi AI trong hôm nay (giới hạn miễn phí). Vui lòng thử lại vào ngày mai hoặc liên hệ admin để nâng cấp API key.' });
  }

  const status = err.status || 500;
  const message = err.message || 'Lỗi server nội bộ';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
