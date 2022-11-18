const fs = require('fs');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('ygwqrpyd', 'ygwqrpyd', '47RCBfsIbBwWzm9VBDrs8ybKkj3EJZb8', {
  host: 'peanut.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: {rejectUnauthorized: false},
  },
  query: {raw: true},
});

const Student = sequelize.define('Student', {
  studentID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {type: Sequelize.STRING},
  lastName: {type: Sequelize.STRING},
  email: {type: Sequelize.STRING},
  phone: {type: Sequelize.STRING},
  addressStreet: {type: Sequelize.STRING},
  addressCity: {type: Sequelize.STRING},
  addressState: {type: Sequelize.STRING},
  addressPostal: {type: Sequelize.STRING},
  isInternationalStudent: {type: Sequelize.BOOLEAN},
  expectedCredential: {type: Sequelize.STRING},
  status: {type: Sequelize.STRING},
  registrationDate: {type: Sequelize.STRING},
});

const Program = sequelize.define('Program', {
  programCode: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  programName: {type: Sequelize.STRING},
});

Program.hasMany(Student, {foreignKey: 'program'});

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    const result = sequelize.sync();
        // eslint-disable-next-line max-len
        result ? resolve(result) : reject(new Error('unable to sync the database'));
  });
};

// Students
module.exports.getAllStudents = function() {
  return new Promise((resolve, reject) => {
    const result = Student.findAll();
    result ? resolve(result) : reject(new Error('No results returned'));
  });
};
module.exports.addStudent = function(studentData) {
  return new Promise((resolve, reject) => {
    studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
    for (const property in studentData) {
      if (studentData[property] == '') {
        studentData[property] = null;
      }
    }
    Student.create({
      studentID: studentData.studentID,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone,
      addressStreet: studentData.addressStreet,
      addressCity: studentData.addressCity,
      addressState: studentData.addressState,
      addressPostal: studentData.addressPostal,
      isInternationalStudent: studentData.isInternationalStudent,
      expectedCredential: studentData.expectedCredential,
      status: studentData.status,
      registrationDate: studentData.registrationDate,
      program: studentData.program,
    }).then(() => {
      resolve();
    }).catch((err) => reject(new Error('unable to add student')));
  });
};
module.exports.updateStudent = function(studentData) {
  return new Promise((resolve, reject) =>{
    studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
    for (const property in studentData) {
      if (studentData[property] == '') {
        studentData[property] = null;
      }
    }
    Student.update({
      studentID: studentData.studentID,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone,
      addressStreet: studentData.addressStreet,
      addressCity: studentData.addressCity,
      addressState: studentData.addressState,
      addressPostal: studentData.addressPostal,
      isInternationalStudent: studentData.isInternationalStudent,
      expectedCredential: studentData.expectedCredential,
      status: studentData.status,
      registrationDate: studentData.registrationDate,
      program: studentData.program,
    }, {where: {studentID: studentData.studentID},
    }).then(() => {
      resolve();
    }).catch((err) => reject(new Error('unable to update student')));
  });
};
module.exports.getStudentsByStatus = function(status) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {status: status},
    }).then((data) => {
      resolve(data);
    }).catch((err) => reject(new Error('No results returned (By Status)')));
  });
};
module.exports.getStudentsByProgramCode = function(pcode) {
  return new Promise((resolve, reject) => {
    const result = Student.findAll({
      where: {program: pcode},
    });
    if (result === null) {
      reject(new Error('no results returned'));
    }
    resolve(result);
  });
};
module.exports.getStudentsByCredentials = function(num) {
  return new Promise((resolve, reject) => {
    const result = Student.findAll({
      where: {expectedCredential: num},
    }).then((data) => {
      resolve(data);
    });
    if (result === null) {
      reject(new Error('no results returned'));
    }
    resolve(result);
  });
};
module.exports.getStudentByID = function(num) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {studentID: num},
    }).then((data) => {
      resolve(data);
    }).catch((err) => reject(new Error('No results returned (By Status)')));
  });
};
// Delete student
module.exports.deleteStudentByID = function(sid) {
  return new Promise((resolve, reject)=>{
    const result = Student.destroy({
      where: {studentID: sid},
    });
      result ? resolve('destroyed') : reject(new Error('Not destroyed'));
  });
};

// Programs
module.exports.getPrograms = function() {
  return new Promise((resolve, reject) => {
    const result = Program.findAll();
    result ? resolve(result) : reject(new Error('No results returned'));
  });
};
// Add Program
module.exports.addProgram = function(programData) {
  return new Promise((resolve, reject) => {
    for (const property in programData) {
      if (programData[property] === '') {
        programData[property] = null;
      }
    }
    const result = Program.create({
      programCode: programData.programCode,
      programName: programData.programName,
    });
    result ? resolve(result) : reject(new Error('unable to create Program'));
  });
};
// Update Program
module.exports.updateProgram = function(programData) {
  for (const prop in programData) {
    if (programData.prop === '') {
      programData.prop = null;
    }
  }
  return new Promise((resolve, reject) =>{
    const result = Program.update({
      programCode: programData.programCode,
      programName: programData.programName,
    },
    {
      where: {programCode: programData.programCode},
    });
    result ? resolve(result) : reject(new Error('unable to update Program'));
  });
};
// Get Program by Code
module.exports.getProgramByCode = function(pcode) {
  return new Promise((resolve, reject) => {
    const result = Program.findAll({
      where: {programCode: pcode},
    });
    if (result === null) {
      reject(new Error('no results returned'));
    }
    resolve(result);
  });
};
// Delete Program by code
module.exports.deleteProgramByCode = function(pcode) {
  return new Promise((resolve, reject)=>{
    const result = Program.destroy({
      where: {programCode: pcode},
    });
      result ? resolve('destroyed') : reject(new Error('Not destroyed'));
  });
};
