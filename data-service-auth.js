const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  'userName': {'type': String, 'unique': true},
  'password': String,
  'email': String,
  'loginHistory': [{'dateTime': Date, 'userAgent': String}],
});

let User;

module.exports.initialize = function() {
  return new Promise(function(resolve, reject) {
    const db = mongoose.createConnection('mongodb+srv://chrispminis:1t38k5GI4OXQ7hdw@senecaweb.v9utpal.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true});

    db.on('error', (err)=>{
      reject(err);
    });
    db.once('open', ()=>{
      User = db.model('users', userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password == userData.password2) {
      // eslint-disable-next-line max-len
      bcrypt.genSalt(10).then((salt) => bcrypt.hash(userData.password, salt)).then((hash) => {
        userData.password = hash;
        const newUser = new User(userData);
        newUser.save(function(err) {
          if (err) {
            if (err.code == 11000) {
              reject(new Error('User Name already taken'));
            } else {
              reject(new Error('There was an error creating the user: ' + err));
            }
          } else {
            resolve();
          }
        });
      }).catch((err) => {
        console.log(err);
        reject(new Error('There was an error encrypting the password!'));
      });
    } else {
      reject(new Error('Passwords do not match'));
    }
  });
};

module.exports.checkUser = function(userData) {
  return new Promise(function(resolve, reject) {
    User.find({userName: userData.userName}).exec()
        .then((user) => {
          if (user.length == 0) {
            reject(new Error('Unable to find username: ' + userData.userName));
          } else {
            bcrypt.compare(userData.password, user[0].password)
                .then((result) => {
                  if (result == true) {
                    if (user[0].loginHistory == null) {
                      user[0].loginHistory = [];
                    }

                    user[0].loginHistory.push({
                      dateTime: (new Date()).toString(),
                      userAgent: userData.userAgent,
                    });

                    User.updateOne({userName: user[0].userName},
                        {$set: {loginHistory: user[0].loginHistory}})
                        .exec()
                        .then(resolve(user[0]))
                        .catch(function(err) {
                          reject(new Error('Error verifying the username'));
                        });
                  } else if (result == false) {
                    reject(new Error('Unable to find username: ' + userData.userName));
                  }
                });
          }
        })
        .catch(function(err) {
          console.log(err);
          reject(new Error('Unable to find user: catch ' + userData.userName));
        });
  });
};
