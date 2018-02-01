//Connection to mysql db
const mysql = require("mysql");
const config = require("../config");

var connection = mysql.createConnection(config.database);

connection.connect(function (err) {
   if (err)
       throw err;
});