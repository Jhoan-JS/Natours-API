const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
