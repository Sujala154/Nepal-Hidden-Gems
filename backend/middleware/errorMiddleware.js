/**
 * Global Error Handler for Express.
 * This centralizes all error responses, making the code cleaner and more consistent.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the complete error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('SERVER ERROR 💥:', err);
  }

  // Handle specific Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(el => el.message).join(', ')
    });
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate field value: ${value}. Please use another value!`
    });
  }

  // Final generic error response
  res.status(err.statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
