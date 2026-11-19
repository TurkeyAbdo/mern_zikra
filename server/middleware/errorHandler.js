export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.code === 11000)
    return res.status(409).json({ error: 'That email is already registered.' });
  if (err.code === 'LIMIT_FILE_SIZE')
    return res
      .status(413)
      .json({ error: 'Choose an image smaller than 8 MB.' });
  if (err.name === 'MulterError' || err.name === 'ValidationError') {
    return res
      .status(400)
      .json({ error: 'Please check the submitted fields and image.' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res
    .status(status)
    .json({
      error:
        status < 500
          ? err.message
          : 'The request could not be completed. Please try again.',
    });
}
