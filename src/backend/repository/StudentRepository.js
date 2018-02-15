const md5 = require("md5");
const {query} = require('../database');

const getStudent = async (id) =>
    await query('SELECT * FROM users WHERE id = :id', {id});

const getStudents = async () =>
    await query('SELECT * FROM users');

//const getStudentsForClass = async(classId) =>
//    await query('SELECT * FROM users WHERE ');

const authenticateStudent = async (email, password) =>
    await query('SELECT * FROM users WHERE email = :email AND password = :password', {email, password: md5(password)});


//Export to module.exports (pseudo Singleton)
module.exports = {
    getStudent,
    getStudents,
    authenticateStudent
};