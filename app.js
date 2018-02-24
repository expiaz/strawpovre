const express = require('express');
const helmet = require('helmet');
const socketio = require('socket.io');
const path = require('path');
const passport = require('passport');

require('./src/backend/passport');

const {expressSession, socketioSession} = require('./src/backend/session');
const {pollExists, pollAuth, formSchemaLogin, validateLoginFormSchema} = require('./src/backend/middleware');
const {createPoll, destroyPoll} = require('./src/backend/repository');
const {log} = require('./src/utils');
const controller = require('./src/backend/controller');
const config = require('./src/config');
const Prof = require('./src/backend/model/Prof');

const app = express(), io = socketio.listen(app.listen(8000));

app.set('views', config.express.view.directory);
app.set('view engine', config.express.view.engine);

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(config.express.dist));

app.post('/poll/:poll(\\w{5})',
    pollExists,
    formSchemaLogin,
    validateLoginFormSchema('poll-login'),
    pollAuth, (req, res) => {
        const {poll = ''} = req.params;
        log(`post ${poll} auth ok redirect`);
        return res.redirect(`/poll/${poll}`);
    });

app.get('/poll/:poll(\\w{5})', pollExists, controller.login, controller.poll);

app.post('/dashboard',
    formSchemaLogin,
    validateLoginFormSchema('dashboard-login'),
    passport.authenticate('local', {
        failureRedirect: '/dashboard',
        successRedirect: '/dashboard'
    }));

app.get('/dashboard', (req, res, next) => {
    if (!req.user || !req.user.admin) {
        return res.render('dashboard-login');
    }
    return next();
}, controller.dashboard);

// add a poll
// app.post('/dashboard/poll', formSchemaPoll, (req, res, next) => {
//
// }, (req, res) => res.redirect('/dashboard'));
// delete a poll
// app.delete('/dashboard/poll/:id(\\d+)')

app.post('/dashboard/poll', (req, res) => {
    log(req.body);
});

app.get('/logout', (req, res) => {
    if (req.user) {
        req.logout();
    }
    return res.redirect('/dashboard');
});

app.get('*', (req, res) => {
    res.redirect('/dashboard');
});

io.use(socketioSession);

const poll = createPoll(io, 'abcd');
log(`Poll created, go to /poll/${poll.id} and log with st1@st1.st1:abcd to see it`);
log(`Bad poll created at /poll/${createPoll(io, 'abcd', new Prof('bad@bad.bad', 'bad', 'bad', [])).id}`);

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
