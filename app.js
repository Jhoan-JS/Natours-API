const express = require('express');
const morgan = require('morgan');

const AppError = require('./src/utils/AppError');

const globalErrorHandler = require('./src/controllers/error.controller');

const tourRouter = require('./src/routes/tours.routes');

const userRouter = require('./src/routes/users.routes');
//initialization
const app = express();

//middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//routes
// app.  get('/', (req, res) => {
//   res.json({ message: 'Hi from the server side ', app: 'Natours' });
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//unhandler routes middleware

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  const err = new AppError(`Can't find ${req.originalUrl}`, 404);

  next(err);
});

//global error handler middlaware

app.use(globalErrorHandler);

module.exports = app;
