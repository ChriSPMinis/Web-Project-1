const express = require('express');
const app = express();
dataService = require('./data-service.js');

app.use(express.static('public'));

const HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log('Express http server listening on port ' + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', function(req, res) {
  res.sendfile('views/home.html');
});

// setup another route to listen on /about
app.get('/about', function(req, res) {
  res.sendfile('views/about.html');
});

app.get('/students', function(req, res) {
  res.setHeader('Content-Type', 'application/jason');
  // res.json(students.json);
  // res.end(JSON.stringify());
  res.send('TODO: Get all students');
});

app.get('/intlstudents', function(req, res) {
  res.send('TODO: Get all students who have isInternationalStudent == true');
});

app.get('/programs', function(req, res) {
  res.send('TODO: Get all programs');
});

app.get('*', function(req, res) {
  res.send('Error Code: 404', 404);
});
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


