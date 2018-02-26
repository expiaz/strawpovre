const session = require('express-session');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MysqlStore = require('express-mysql-session')(session);
const passport = require('passport');

const { promisify } = require('../utils');
const { connection, query } = require('./database');
const { key, secret, store } = require('../config').session;

// we'll use MySQL a store for the sessions
// we can have used MemoryStore provided by express but we already have our memory leaks, useless to add more
// (redis is better but some team members use windows, we won't change everything for a project this little)
const sessionStore = new MysqlStore({ store }, connection);

/**
 * easier to user promises than callbacks
 */
const getSession = promisify(sessionStore.get, sessionStore);
const setSession = promisify(sessionStore.set, sessionStore);
const deleteSession = promisify(sessionStore.destroy, sessionStore);

// initialize express (passport) sessions
const expressSession = session({
    key,
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
});

// share it with socket.io via the same store
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
 * delete every sessions linked to a poll
 * normally a session self-destruct when you quit, but a student may
 * just leave the page and will never come back to this poll
 * so sessions will stay forever, better delete them
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