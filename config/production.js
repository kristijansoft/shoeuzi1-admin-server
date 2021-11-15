'use strict';

module.exports = {
  env: 'production',
  db: 'mongodb+srv://shoeuzi-user:1GEBFCxnKxqcvFrm@cluster0.dbpci.mongodb.net/shoeuzi1?retryWrites=true&w=majority',
  port: process.env.PORT || 4000,
  jwtIssuer: 'shoeuzi',
};
