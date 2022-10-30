/** *******************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Christian Park   Student ID: 036917128  Date: Oct. 30, 2022
*
*  Online (Cyclic) Link: https://alive-overshirt-frog.cyclic.app/about
*
********************************************************************************/

const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const fs = require('fs');

const app = express();
const data = require('./data-service.js');
const path = require('path');

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    navLink: function(url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3) {
        throw new Error('Handlebars Helper equal needs 2 parameters');
      }
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
  },
}));
app.set('view engine', '.hbs');

const storage = multer.diskStorage({
  destination: './public/images/uploaded',
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});

// Active Route
app.use(function(req, res, next) {
  const route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/, '');
  next();
});

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
  res.render('home');
});

// About
app.get('/about', function(req, res) {
  res.render('about');
});

// Students
app.get('/students', function(req, res) {
  if (req.query.status) {
    data.getStudentsByStatus(req.query.status).then((data)=>{
      if (data.length > 0) {
        res.render('students', {students: data});
      } else {
        res.render('students', {message: 'Invalid status'});
      }
    });
  } else if (req.query.program) {
    data.getStudentsByProgramCode(req.query.program).then((data)=>{
      if (data.length > 0) {
        res.render('students', {students: data});
      } else {
        res.render('students', {message: 'Invalid program code'});
      }
    });
  } else if (req.query.credential) {
    data.getStudentsByCredentials(req.query.credential).then((data)=>{
      if (data.length > 0) {
        res.render('students', {students: data});
      } else {
        res.render('students', {message: 'Invalid credentials'});
      }
    });
  } else {
    data.getAllStudents().then((data) => {
      res.render('students', {students: data});
    });
  }
});

// Add Student
app.get('/students/add', function(req, res) {
  res.render('addStudent');
});
app.post('/students/add', function(req, res) {
  data.addStudent(req.body).then(()=>{
    res.redirect('/students');
  });
});

app.get('/student/:studentID', function(req, res) {
  data.getStudentsByID(req.params.studentID).then((data)=>{
    res.render('student', {student: data});
  }).catch(function(err) {
    res.render('student', {message: 'No results'});
  });
});

// Add Image
app.get('/images/add', function(req, res) {
  res.render('addImage');
});
app.post('/images/add', upload.single('imageFile'), (req, res) => {
  res.redirect('/images');
});

// Images
app.get('/images', function(req, res) {
  fs.readdir('./public/images/uploaded', function(err, items) {
    res.render('images', {images: items});
  });
});

// International Students
app.get('/intlstudents', function(req, res) {
  data.getInternationalStudents().then((data) => {
    res.render('students', {students: data});
  });
});

// Programs
app.get('/programs', function(req, res) {
  data.getPrograms().then((data) => {
    res.render('programs', {programs: data});
  });
});

// Error
app.get('*', function(req, res) {
  res.send('Error Code: 404', 404);
});

// Update Student
app.post('/student/update', (req, res) => {
  data.updateStudent(req.body).then(()=>{
    res.redirect('/students');
  });
});
