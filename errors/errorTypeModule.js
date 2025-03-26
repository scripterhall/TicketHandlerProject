const AppError = require('./../utils/appError');

exports.handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

exports.handleDuplicateFieldDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: / ${value} /. Please use another value.`;
  return new AppError(message, 400);
};

exports.handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data . ${errors.join(', ')}`;
  return new AppError(message, 400);
};

exports.handleJWTError = () => {
  return new AppError('Invalid token. Please log in again !', 401);
};

exports.handleJWTExpired = () => {
  return new AppError('Your token has expired . Please log in again !', 401);
};

