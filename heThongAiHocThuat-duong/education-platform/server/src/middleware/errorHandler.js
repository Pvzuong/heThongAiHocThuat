const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Gemini quota exceeded
  if (
    err.message?.includes('429') ||
    err.message?.includes('Too Many Requests') ||
    err.message?.includes('quota')
  ) {
    return res.status(429).json({
      error: 'Hết lượt tạo câu hỏi AI trong hôm nay (giới hạn miễn phí). Vui lòng thử lại vào ngày mai hoặc liên hệ admin để nâng cấp API key.',
    });
  }

  const status = err.status || 500;

  // Production: không lộ stack trace hoặc message nội bộ cho lỗi 500
  if (status === 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Lỗi server nội bộ. Vui lòng thử lại sau.' });
  }

  res.status(status).json({ error: err.message || 'Lỗi server nội bộ' });
};

module.exports = errorHandler;
