const errorType = require('./errorTypeModule');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api'))
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  else
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      //console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      //console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(err.statusCode).render('error', {
        status: 'error',
        msg: 'PLease try again later',
      });
    }
  }
};

//global error handler for error handling requests and responses from server and sending them to client
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message };
    if (error.name === 'CastError') {
      error = errorType.handleCastErrorDB(error);
    }
    if (error.code === 11000) error = errorType.handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = errorType.handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = errorType.handleJWTError();
    if (error.name === 'TokenExpiredError')
      error = errorType.handleJWTExpired();
    sendErrorProd(error, req, res);
  }
};