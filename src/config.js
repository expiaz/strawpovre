const { join } = require('path');

const dist = join(__dirname, '../public');

module.exports = {

    express: {
        view: {
            directory: dist,
            engine: 'ejs'
        },
        dist
    },

    jwt: {
        secret: 'a=^r"rz425eQ',
        age: 60 * 60
    },

    session : {
        key: 'strawpovre.sid',
        secret: 'dqzg98g',
        store: {
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }
    },

    database : {
        host : "localhost",
        user : "strawpovre",
        password : "Z-=37^3Jp",
        database : "strawpovre"
    }
};