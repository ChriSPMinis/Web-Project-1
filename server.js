/** *******************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Christian Park   Student ID: 036917128  Date: Oct. 10, 2022
*
*  Online (Cyclic) Link: https://alive-overshirt-frog.cyclic.app/about
*
********************************************************************************/

const express = require('express');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: './public/images/uploaded',
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});

const app = express();
const data = require('./data-service.js');
const path = require('path');


const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

// Initial
app.use(express.urlencoded({extended: true}));
data.initialize().then(function() {
  app.listen(HTTP_PORT, function() {
    console.log('Express http server listening on port ' + HTTP_PORT);
  });
}).catch(function(err) {
  console.log('Unable to start server: ' + err);
});

// Home
app.get('/', function(req, res) {
  res.sendFile('./views/home.html', {root: __dirname});
});

// About
app.get('/about', function(req, res) {
  res.sendFile('./views/about.html', {root: __dirname});
});

// Students
app.get('/students', function(req, res) {
  if (req.query.status) {
    data.getStudentsByStatus(req.query.status).then((data)=>{
      if (data.length > 0) {
        res.json(data);
      } else {
        res.send('No results :Status');
      }
    });
  } else if (req.query.program) {
    data.getStudentsByProgramCode(req.query.program).then((data)=>{
      if (data.length > 0) {
        res.json(data);
      } else {
        res.send('No results :Program');
      }
    });
  } else if (req.query.credential) {
    data.getStudentsByExpectedCredential(req.query.credential).then((data)=>{
      if (data.length > 0) {
        res.json(data);
      } else {
        res.send('No results :Credentials');
      }
    });
  } else {
    data.getAllStudents().then((data) => {
      res.json(data);
    });
  }
});

// Add Student
app.get('/students/add', function(req, res) {
  res.sendFile('./views/addStudent.html', {root: __dirname});
});
app.post('/students/add', function(req, res) {
  data.addStudent(req.body).then(()=>{
    res.redirect('/students');
  });
});

app.get('/students/:studentID', function(req, res) {
  data.getStudentsByID(req.params.studentID).then((data)=>{
    res.json(data);
  }).catch(function(err) {
    res.send('No studentID found');
  });
});

// Add Image
app.get('/images/add', function(req, res) {
  res.sendFile('./views/addImage.html', {root: __dirname});
});
app.post('/images/add', upload.single('imageFile'), (req, res) => {
  res.redirect('/images');
});

// Images
app.get('/images', function(req, res) {
  fs.readdir('./public/images/uploaded', function(err, items) {
    res.json('images :' + items);
  });
});

// International Students
app.get('/intlstudents', function(req, res) {
  data.getInternationalStudents().then((data) => {
    res.json(data);
  });
});

// Programs
app.get('/programs', function(req, res) {
  data.getPrograms().then((data) => {
    res.json(data);
  });
});

// Error
app.get('*', function(req, res) {
  res.send('Error Code: 404', 404);
});
