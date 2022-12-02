/** *******************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Christian Park   Student ID: 036917128  Date: Oct. 30, 2022
*
*  Online (Cyclic) Link: https://alive-overshirt-frog.cyclic.app
*
********************************************************************************/

const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const fs = require('fs');
const clientSessions = require('client-sessions');

const app = express();
const data = require('./data-service.js');
const dataServiceAuth = require('./data-service-auth.js');
const path = require('path');

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.urlencoded({extended: false}));
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

// Middleware Client Session
app.use(clientSessions({
  cookieName: 'session',
  secret: 'web322_assignment6_secret_string',
  duration: 2 * 60 * 1000, // 2 Minutes
  activeDuration: 1000 * 60, // 1 Minute
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(function(req, res, next) {
  const route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/, '');
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Register
app.get('/register', function(req, res) {
  res.render('register');
});
app.post('/register', function(req, res) {
  dataServiceAuth.registerUser(req.body)
      .then(() => res.render('register', {successMessage: 'User created'}))
      // eslint-disable-next-line max-len
      .catch((err) => res.render('register', {errorMessage: err, userName: req.body.userName}));
});

// Login
app.get('/login', function(req, res) {
  res.render('login');
});
app.post('/login', function(req, res) {
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
      .then((user) => {
        req.session.user = {
          userName: user.userName, // Auth users UN
          email: user.email, // Auth users email
          loginHistory: user.loginHistory, // Auth users history
        };
        res.redirect('/students');
      })
      .catch(function(err) {
        res.render('login', {errorMessage: err, userName: req.body.userName});
      });
});
// Logout
app.get('/logout', function(req, res) {
  req.session.reset();
  res.render('login');
});

// History
app.get('/userHistory', ensureLogin, function(req, res) {
  res.render('userHistory');
});

// Active Route
app.use(function(req, res, next) {
  const route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/, '');
  next();
});

// Initial
data.initialize()
    .then(dataServiceAuth.initialize)
    .then(function() {
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
app.get('/students', ensureLogin, function(req, res) {
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
      if (data.length > 0) {
        res.render('students', {students: data});
      } else {
        res.render('students', {message: 'no results'});
      }
    });
  }
});

// Add Student
app.get('/students/add', ensureLogin, function(req, res) {
  data.getPrograms().then((data)=>{
    res.render('addStudent', {programs: data});
  });
});
app.post('/students/add', ensureLogin, function(req, res) {
  data.addStudent(req.body).then(()=>{
    res.redirect('/students');
  });
});

app.get('/student/:studentID', ensureLogin, function(req, res) {
  const viewData = {};
  data.getStudentByID(req.params.studentID).then((data) => {
    if (data) {
      viewData.student = data;
    } else {
      viewData.student = null;
    }
  }).catch(() => {
    viewData.student = null;
  }).then(data.getPrograms)
      .then((data) => {
        viewData.programs = data;
        for (let i = 0; i < viewData.programs.length; i++) {
          if (viewData.programs[i].programCode == viewData.student[0].program) {
            viewData.programs[i].selected = true;
          }
        }
      }).catch(() => {
        viewData.programs = [];
      }).then(() => {
        if (viewData.student == null) {
          res.status(404).send('Student Not Found');
        } else {
          res.render('student', {viewData: viewData});
        }
      }).catch((err)=>{
        res.status(500).send('Unable to Show Students');
      });
});


// Add Image
app.get('/images/add', ensureLogin, function(req, res) {
  res.render('addImage');
});
app.post('/images/add', ensureLogin, upload.single('imageFile'), (req, res) => {
  res.redirect('/images');
});

// Images
app.get('/images', ensureLogin, function(req, res) {
  fs.readdir('./public/images/uploaded', function(err, items) {
    res.render('images', {images: items});
  });
});

// Update Student
app.post('/student/update', ensureLogin, (req, res) => {
  data.updateStudent(req.body).then(()=>{
    res.redirect('/students');
  }).catch((err)=>{
    res.status(500).send('Unable to Update Student');
  });
});
// Delete Student
app.get('/students/delete/:studentID', ensureLogin, function(req, res) {
  data.deleteStudentByID(req.params.studentID).then((data)=>{
    res.redirect('/students');
  }).catch(function(err) {
    res.status(500).send('Unable to Remove Student / Student not found');
  });
});

// Programs
app.get('/programs', ensureLogin, function(req, res) {
  data.getPrograms().then((data) => {
    if (data.length > 0) {
      res.render('programs', {programs: data});
    } else {
      res.render('programs', {message: 'no results'});
    }
  });
});
// Add Program
app.get('/programs/add', ensureLogin, function(req, res) {
  res.render('addProgram');
});
app.post('/programs/add', ensureLogin, function(req, res) {
  data.addProgram(req.body).then(()=>{
    res.redirect('/programs');
  });
});
// Update Program
app.post('/program/update', ensureLogin, (req, res) => {
  data.updateProgram(req.body).then(()=>{
    res.redirect('/programs');
  }).catch((err)=>{
    res.status(500).send('Unable to Update Program');
  });
});
// Program by code
app.get('/program/:programCode', ensureLogin, function(req, res) {
  data.getProgramByCode(req.params.programCode).then((data)=>{
    res.render('program', {program: data});
  }).catch(function(err) {
    res.status(404).send('Program Not Found');
  });
});
// Delete program by code
app.get('/programs/delete/:programCode', ensureLogin, function(req, res) {
  data.deleteProgramByCode(req.params.programCode).then((data)=>{
    res.redirect('/programs');
  }).catch(function(err) {
    res.status(500).send('Program Not Found');
  });
});

// Error
app.get('*', function(req, res) {
  res.send('Error Code: 404', 404);
});

