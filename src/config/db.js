const mongoose = require('mongoose');

const db = process.env.DATABASE_LOCA_URI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB is connected');
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
