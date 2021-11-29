require('rootpath')();
const express = require('express');
const app = express();
const httpStatus = require('./lib/httpStatus');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db');
var path = require('path');
var compression = require('compression');
var helmet = require('helmet');

// configure cors
app.use(cors());

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'build')));

//Compress all routes
app.use(compression());

app.use(helmet());

//testing api
app.get('/api/v1', function (req, res) {
  res.status(httpStatus.OK).send('API v1 running');
});

//Auth Controller
const authController = require('controllers/authController');
app.use('/api/v1/auth', authController);

//E-Commerce Controller
const ecommerceController = require('controllers/ecommerceController');
app.use('/api/v1/admin', ecommerceController);

//Blog Controller
const blogController = require('controllers/blogController');
app.use('/api/v1/admin', blogController);

//Applicaton Controller
const applicationController = require('controllers/applicationController');
app.use('/api/v1/admin', applicationController);

//Example Controller
const exampleController = require('controllers/exampleController');
app.use('/api/v1/admin', exampleController);

/* Front-end Shop API */
const productController = require('controllers/shop/productController');
app.use('/api/v1/shop', productController);

/* Front-end Shop API */
const checkoutController = require('controllers/shop/checkoutController');
app.use('/api/v1/payment', checkoutController);

//Without gZip
//join public path
app.use(express.static(path.join(__dirname, 'public')));

const directory = path.join(__dirname, '/public');
app.use('/public', express.static(directory));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//With gZip
app.get('*.js', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});

app.get('*.css', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/css');
  next();
});

app.use(express.static('build'));

//join public path
// app.use(express.static(path.join(__dirname, 'public')));

// const directory = path.join(__dirname, '/public');
// app.use('/public', express.static(directory));

// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, './build/index.html'));
// });

module.exports = app;
