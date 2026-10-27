export function notFound(req, _res, next) {
  const error = new Error('Route not found: ' + req.method + ' ' + req.originalUrl);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'An unexpected error occurred.';
  let code = error.code;

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((item) => item.message).join(' ');
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'The supplied identifier is invalid.';
    code = 'INVALID_ID';
  } else if (error.code === 11000) {
    status = 409;
    message = error.keyPattern && error.keyPattern.night
      ? 'This room is no longer available for one or more selected nights.'
      : 'An account with this email already exists.';
    code = error.keyPattern && error.keyPattern.night ? 'ROOM_UNAVAILABLE' : 'DUPLICATE_VALUE';
  } else if (error.name === 'MongoServerError' && error.code === 112) {
    status = 409;
    message = 'The room availability changed while you were booking. Please try again.';
    code = 'ROOM_UNAVAILABLE';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({
    error: { message: status >= 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : message, code }
  });
}
