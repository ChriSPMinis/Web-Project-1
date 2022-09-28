/** *******************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Christian Park   Student ID: 036917128  Date: Sept. 29, 2022
*
*  Online (Cyclic) Link:
*
********************************************************************************/

const express = require('express');
const app = express();
const data = require('./data-service.js');

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

data.initialize().then(function() {
  app.listen(HTTP_PORT, function() {
    console.log('Express http server listening on port ' + HTTP_PORT);
  });
}).catch(function(err) {
  console.log('Unable to start server: ' + err);
});

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', function(req, res) {
  res.sendFile('./views/home.html', {root: __dirname});
});

// setup another route to listen on /about
app.get('/about', function(req, res) {
  res.sendFile('./views/about.html', {root: __dirname});
});

app.get('/students', function(req, res) {
  data.getAllStudents().then((data) => {
    res.json(data);
  });
});

app.get('/intlstudents', function(req, res) {
  data.getInternationalStudents().then((data) => {
    res.json(data);
  });
});

app.get('/programs', function(req, res) {
  data.getPrograms().then((data) => {
    res.json(data);
  });
});

app.get('*', function(req, res) {
  res.send('Error Code: 404', 404);
});
