const md5 = require("md5");
const { query } = require('./database');

const authenticate = async (email, password) => {

    try {
        const student = await query('SELECT * FROM `student` WHERE email = :email AND password = :pwd', {
            email,
            pwd: md5(password)
        });

        if(student.length) {
            return student[0];
        }

        const prof = await query('SELECT * FROM `prof` WHERE email = :email AND password = :pwd', {
            email,
            pwd: md5(password)
        });

        if(prof.length) {
            return prof[0];
        }

    } catch (e) {
        return null;
    }

    return null;
};

module.exports = {
    authenticate
};