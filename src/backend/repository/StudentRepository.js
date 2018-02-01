const md5 = require("md5");
class StudentRepository {
    constructor(connection) {
        this._connection = connection;
    }

    get connection() {
        return this._connection;
    }

    set connection(value) {
        this._connection = value;
    }

    authenticateStudent(email, password, callback) {
        var query = "SELECT * FROM `student` WHERE `email` = " + email + " AND `password` = " + md5(password);

        this.connection.query(query, function (err, rows, fields) {
            if(err)
                throw err;

            callback(err, rows);
        })
    }
}

//Export to module.exports (pseudo Singleton)
module.exports = new StudentRepository();