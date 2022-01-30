const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operation, trusted error:send messagge to cliente
  if (err.isOperational) {
    console.log(err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or  other uknowm error: don't leak error details
  } else {
    //1) log error
    console.error('ERROR', err);

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very  wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.message.match(/"(.*?)"/)[1];
  console.log(value);
  const message = `Duplicate field value : ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  let { message } = err;
  message = message.replace('Validation failed', 'Invalid input data');
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = _.clone(err);
    let error = { ...err };
    //Properties don't work with oject shadow copy
    const { name, message } = err;
    error.message = message;
    // console.log(error);
    // console.log(name);
    if (name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldDB(error);
    } else if (name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    sendErrorProd(error, res);
  }
};
