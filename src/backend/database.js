//Connection to mysql db
const mysql = require("mysql");
const config = require("../config");
const { promisify } = require('../utils');

const connection = mysql.createConnection(config.database);

connection.config.queryFormat = (query, values) => query.replace(/\:(\w+)/g, (_, placeholder) => this.escape(values[placeholder]));

connection.connect(function (err) {
    if (err)
        throw err;
});

/*
use query like :
const { query } = require('./path/to/database');
async function getUser(id) {
    return await query('SELECT * FROM users WHERE id = :id', { id: id });
}
 */

module.exports = {
    query: promisify(connection.query),
};