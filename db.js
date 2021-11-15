const config = require('./config/index');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = {
  User: require('./models/User'),
};
