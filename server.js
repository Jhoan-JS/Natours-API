//listening
require('dotenv').config({ path: `${__dirname}/.env` });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);

  console.log('UNCAUGTH EXCEPTION! Shutting down');
  process.exit(1);
  //we need close the server before kill the application
});

// start database
require('./src/config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`app running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);

  console.log('UNHANDLE REJECTION! Shutting down');

  //Close server before kill the application
  server.close(() => {
    process.exit(1);
  });
});
