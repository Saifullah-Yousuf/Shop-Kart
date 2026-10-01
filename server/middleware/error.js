exports.notFound = (req, res) => res.status(404).json({ message: `Not found: ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = field === 'email' ? 'Email already registered' : `This ${field} already exists`;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 2 MB' : err.message; }
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
