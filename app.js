'use strict';
if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
  require('@google-cloud/debug-agent').start();
}
const errors = require('@google-cloud/error-reporting')();
const express = require('express');
const logger = require('morgan');
const logging = require('./lib/logging');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const {ErrorResponse} = require('./models/error-response');
app.enable('trust proxy');
app.disable('etag');
app.use(logger('dev'));
app.use(bodyParser.json());

// Our application will need to respond to health checks when running on
// Compute Engine with Managed Instance Groups.
app.get('/_ah/health', (req, res) => {
  res.status(200).send('ok');
});
app.use(logging.errorLogger);
app.set('x-powered-by', false);
app.use(logging.requestLogger);

/* API routes */
app.use('/api', require('./routes/api'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname,
    'public', 'build', 'es6-bundled')));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new ErrorResponse(404, 'Route not found');
  const body = JSON.stringify(error, null, 2);
  res.set('Content-Type', 'application/json');
  res.status(404).send(body);
  // next();
});

// // production error handler
// // no stacktraces leaked to user
// app.use((err, req, res) => {
//   errors.report(err);
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

module.exports = app;
