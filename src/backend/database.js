//Connection to mysql db
const mysql = require("mysql");
const config = require("../config");
const { promisify } = require('../utils');

const connection = mysql.createConnection(config.database);

/*connection.config.queryFormat = function (query, values) {
    if (typeof values !== "object") {
        return query;
    }
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return connection.escape(values[key]);
        }
        return txt;
    });
};*/

const query = promisify(connection.query, connection);

/**
 *
 * @param base {String}
 * @param cond {Object}
 * @return {Promise}
 */
const buildQuery = function (table, fields = ['*'], cond = {}) {
    let sql = 'SELECT ?? FROM ??';
    const columns = Array.from(fields) || ['*'];
    const keys = Object.keys(cond);
    const values = [];
    if (keys.length) {
        sql += ' WHERE ' + keys.map(f => {
            values.push(f, cond[f]);
            return `?? = ?`;
        }).join(' AND ');
    }

    return query(sql, [columns, table, ... values]);
};

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
    query,
    buildQuery,
    connection,
};