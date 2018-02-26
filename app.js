const express = require('express');
const helmet = require('helmet');
const socketio = require('socket.io');
const passport = require('passport');
const expressValidator = require('express-validator');

// hydrate passport with strategies and serialization
require('./src/backend/passport');

const { log } = require('./src/utils');

const {
    expressSession,
    socketioSession
} = require('./src/backend/session');

const { isUser } = require('./src/backend/middleware');

const {
    createPoll,
    getAllQuestions,
} = require('./src/backend/repository');

const { initRoutes } = require('./src/backend/controller');

const config = require('./src/config');

// TODO remove it after tests
const Prof = require('./src/backend/model/Prof');

const app = express(), io = socketio.listen(app.listen(8000));

app.set('views', config.express.view.directory);
app.set('view engine', config.express.view.engine);

/**
 * MIDDLEWARES
 */

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());
app.use(express.static(config.express.dist));

/**
 * ROUTES
 */

const {
    front,
    back,
    modal,
    api
} = initRoutes(io);

app.use('/poll', front);
app.use('/dashboard', back);
app.use('/modal', modal);
app.use('/api', api);
app.get('/logout', isUser, (req, res) => {
    if (req.user) {
        req.logout();
    }
    return res.redirect('/dashboard');
});
app.get('*', (req, res) => res.redirect('/dashboard'));

/**
 * SOCKET.IO
 */

io.use(socketioSession);

// test
(async () => {
    const poll = createPoll(
        io,
        'abcd',
        new Prof('root@root.root', 'root', 'root', []),
        await getAllQuestions()
    );
    log(`Poll created, go to /poll/${poll.id} and log with st1@st1.st1:abcd to see it`);
    log(`Bad poll created at /poll/${createPoll(io, 'abcd', new Prof('bad@bad.bad', 'bad', 'bad', [])).id}`)
})();

/*
const t = () => {
    const poll = createPoll(io, 'abcd');
    log(poll.id);
    const to = setTimeout(() => {
        destroyPoll(io, poll);
        clearTimeout(to);
        t();
    }, 15 * 1000);
}

t();*/