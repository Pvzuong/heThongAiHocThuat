const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Lỗi server nội bộ';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
