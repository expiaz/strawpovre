//Connection to mysql db
const mysql = require("mysql");
const config = require("../config");
const { promisify } = require('../utils');

const connection = mysql.createConnection(config.database);

connection.config.queryFormat = (query, values) => query.replace(/\:(\w+)/g, (_, placeholder) => connection.escape(values[placeholder]));

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
or
function getUser(id) {
    return query('SELECT * FROM users WHERE id = :id', { id: id })
        .then(results => results.length && results[0] || null)
        .catch(e => console.log(e))
}
 */

module.exports = {
    query: promisify(connection.query, connection),
};