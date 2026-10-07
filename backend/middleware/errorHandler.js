const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.message || err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle CastError (invalid ObjectId / number)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found or invalid format: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
