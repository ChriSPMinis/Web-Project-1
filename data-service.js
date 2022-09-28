const fs = require('fs');
let students = [];
let programs = [];

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
      if (err) {
        return reject(new Error('unable to read file.'));
      }
      fs.readFile('./data/programs.json', 'utf8', (err, programData) => {
        if (err) {
          return reject(new Error('unable to read file.'));
        }
        students = JSON.parse(studentData);
        programs = JSON.parse(programData);
        resolve();
      });
    });
  });
};

module.exports.getAllStudents = function() {
  return new Promise((resolve, reject) => {
    if (students.length == 0) {
      return reject(new Error('no results returned.'));
    }
    resolve(students);
  });
};

//
module.exports.getInternationalStudents = function() {
  return new Promise((resolve, reject) => {
    const intlstudentsData = [];
    for (let i = 0; i < students.length; i++) {
      if (students[i].isInternationalStudent == true) {
        intlstudentsData.push(students[i]);
      }
    }
    if (intlstudentsData.length == 0) {
      return reject(new Error('no results returned.'));
    }
    resolve(intlstudentsData);
  });
};

module.exports.getPrograms = function() {
  return new Promise((resolve, reject) => {
    if (programs.length == 0) {
      return reject(new Error('no results returned'));
    }
    resolve(programs);
  });
};
