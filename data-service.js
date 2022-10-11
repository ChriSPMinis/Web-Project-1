const fs = require('fs');
let students = [];
let programs = [];

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
      if (err) {
        reject(new Error('unable to read file.')); return;
      }
      students = JSON.parse(studentData);
    });
    fs.readFile('./data/programs.json', 'utf8', (err, programData) => {
      if (err) {
        reject(new Error('unable to read file.')); return;
      }
      programs = JSON.parse(programData);
    });
    resolve();
  });
};

// Students
module.exports.getAllStudents = function() {
  return new Promise((resolve, reject) => {
    if (students.length == 0) {
      reject(new Error('no results returned.')); return;
    }
    resolve(students);
  });
};
module.exports.addStudent = function(studentData) {
  return new Promise((resolve, reject) => {
    let newStudent;
    if (studentData.isInternationalStudent === undefined) {
      newStudent = false;
    } else {
      newStudent = true;
    }

    const createStudent = ({
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone,
      addressStreet: studentData.addressStreet,
      addressCity: studentData.addressCity,
      addressState: studentData.addressState,
      addressPostal: studentData.addressPostal,
      expectedCredential: studentData.expectedCredential,
      status: studentData.status,
      program: studentData.program,
      registrationDate: studentData.registrationDate,
      isInternationalStudent: newStudent,
    });
    students.push(createStudent);
    if (createStudent.length == 0) {
      reject(new Error('no results returned. (By: addStudent')); return;
    }
    resolve(createStudent);
  });
};
module.exports.getStudentsByStatus = function(num) {
  const fullTime = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < students.length; i++) {
      if (students[i].status == num) {
        fullTime.push(students[i]);
      }
    }
    if (fullTime.length == 0) {
      reject(new Error('No results found (By: Status)')); return;
    }
    resolve(fullTime);
  });
};
module.exports.getStudentsByProgramCode = function(num) {
  const program = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < students.length; i++) {
      if (students[i].program == num) {
        program.push(students[i]);
      }
    }
    if (program.length == 0) {
      reject(new Error('No results found (By: Status)')); return;
    }
    resolve(program);
  });
};
module.exports.getStudentsByCredentials = function(num) {
  const creds = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < students.length; i++) {
      if (students[i].expectedCredential == num) {
        creds.push(students[i]);
      }
    }
    if (creds.length == 0) {
      reject(new Error('No results found (By: Status)')); return;
    }
    resolve(creds);
  });
};
module.exports.getStudentsByID = function(num) {
  const sid = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < students.length; i++) {
      if (students[i].studentID == num) {
        sid.push(students[i]);
      }
    }
    if (sid.length == 0) {
      reject(new Error('No results found (By: Status)')); return;
    }
    resolve(sid);
  });
};
module.exports.getInternationalStudents = function() {
  return new Promise((resolve, reject) => {
    const intlstudentsData = [];
    for (let i = 0; i < students.length; i++) {
      if (students[i].isInternationalStudent == true) {
        intlstudentsData.push(students[i]);
      }
    }
    if (intlstudentsData.length == 0) {
      reject(new Error('no results returned.')); return;
    }
    resolve(intlstudentsData);
  });
};

// Programs
module.exports.getPrograms = function() {
  return new Promise((resolve, reject) => {
    if (programs.length == 0) {
      reject(new Error('no results returned')); return;
    }
    resolve(programs);
  });
};


