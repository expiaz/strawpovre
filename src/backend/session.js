const session = require('express-session');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MysqlStore = require('express-mysql-session')(session);
const passport = require('passport');

const { promisify } = require('../utils');
const { connection, query } = require('./database');
const { key, secret, store } = require('../config').session;

const sessionStore = new MysqlStore({ store }, connection);

const getSession = promisify(sessionStore.get, sessionStore);
const setSession = promisify(sessionStore.set, sessionStore);
const deleteSession = promisify(sessionStore.destroy, sessionStore);

const expressSession = session({
    key,
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
});

const socketioSession = passportSocketIo.authorize({
    cookieParser,
    key,
    secret,
    store: sessionStore,
    passport,
    success: function (data, accept) {
        console.log(`socket.io middleware accept`);
        accept();
    },
    fail: function (data, message, error, accept) {
        console.log(`socket.io middleware fail ${message}`);
        accept(new Error(message));
    }
});

/**
 * @param poll {String}
 * @return {Promise}
 */
const deletePoll = (poll) =>
    query('SELECT ?? FROM ??', [
        store.schema.columnNames.session_id,
        store.schema.tableName
    ]).then(results => {
        let chain = Promise.resolve();
        for (var i = 0; i < results.length; i++) {
            const session_id = results[i][store.schema.columnNames.session_id];
            chain = chain
                .then(_ => getSession(session_id))
                .then(session => session.hasOwnProperty(passport._key)
                    && session[passport._key].hasOwnProperty(passport._userProperty)
                    && session[passport._key][passport._userProperty].hasOwnProperty('poll')
                    && session[passport._key][passport._userProperty].poll === poll
                    && deleteSession(session_id)
                );
        }
        return chain;
    });

module.exports = {
    expressSession,
    socketioSession,
    deletePoll
};