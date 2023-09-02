const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;

/* eslint-disable max-len */
const {MONGO_DB_USR, MONGO_DB_PWD, MONGO_DB_HOST, MONGO_DB_PORT, MONGO_DB_NAME} =
  process.env;
const credentials = MONGO_DB_USR ? `${MONGO_DB_USR}:${MONGO_DB_PWD}@` : '';
const mongoURI = `mongodb://${credentials}${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_NAME}`;

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
