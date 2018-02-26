const mysql = require("mysql");
const config = require("../config");
const { promisify } = require('../utils');

const connection = mysql.createConnection(config.database);

const query = promisify(connection.query, connection);

/**
 * build a mysql query dinamically and espace it
 * @param table {String}
 * @param fields {String|String[]}
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

module.exports = {
    query,
    buildQuery,
    connection,
};