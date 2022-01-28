//listening
require('dotenv').config({ path: `${__dirname}/.env` });

// start database
require('./src/config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}...`);
});
