const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.port || 3000;
const {MONGO_DB_USR, MONGO_DB_PWD, MONGO_DB_HOST, MONGO_DB_PORT} =
  process.env;
const credentials = MONGO_DB_USR ? `${MONGO_DB_USR}:${MONGO_DB_PWD}@` : '';
const mongoURI = `mongodb://${credentials}${MONGO_DB_HOST}:${MONGO_DB_PORT}/`;

mongoose
    .connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
      app.listen(port, (arg) => {
        console.log(`Server started @ ${port}.`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
