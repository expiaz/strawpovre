const express = require('express');
const helmet = require('helmet');
const socketio = require('socket.io');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const fs = require('fs');

require('./src/backend/passport');

const {expressSession, socketioSession} = require('./src/backend/session');
const {
    pollExists,
    pollAuth,
    formSchemaLogin,
    formSchemaQuestion,
    formSchemaPoll,
    validateFormSchema
} = require('./src/backend/middleware');
const {
    createPoll,
    destroyPoll,
    getAllQuestions,
    getQuestion,
    getAllSubjects,
    getAllLevels,
    createQuestion,
    getPollsOf
} = require('./src/backend/repository');
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
app.use(expressValidator());
app.use(express.static(config.express.dist));

app.post('/poll/:poll(\\w{5})',
    pollExists,
    formSchemaLogin,
    validateFormSchema((req, res, next, err) => res.render('poll-login', {
        error: err[0]
    })),
    pollAuth, (req, res) => {
        const {poll = ''} = req.params;
        log(`post ${poll} auth ok redirect`);
        return res.redirect(`/poll/${poll}`);
    });

app.get('/poll/:poll(\\w{5})', pollExists, controller.login, controller.poll);

app.post('/dashboard',
    formSchemaLogin,
    validateFormSchema((req, res, next, err) => res.render('dashboard-login', {
        error: err[0]
    })),
    passport.authenticate('local', {
        failureRedirect: '/dashboard',
        successRedirect: '/dashboard'
    }));

var adminAuth = (req, res, next) => {
    if (!req.user || !req.user.admin) {
        return res.render('dashboard-login');
    }
    return next();
};

app.get('/dashboard', adminAuth, controller.dashboard);

// add a poll
// app.post('/dashboard/poll', formSchemaPoll, (req, res, next) => {
//
// }, (req, res) => res.redirect('/dashboard'));
// delete a poll
// app.delete('/dashboard/poll/:id(\\d+)')

app.get('/modal/question', adminAuth, async (req, res) => {
    return res.render('forms/question', {
        subjects: await getAllSubjects(),
        levels: await getAllLevels()
    })
});

app.get('/modal/poll', adminAuth, async (req, res) => {
    return res.render('forms/poll', {
        questions: await getAllQuestions()
    })
});

app.post('/dashboard/question', adminAuth, formSchemaQuestion, validateFormSchema((req, res, next, err) => res.json({
    success: false,
    error: err
})), async (req, res) => {
    if (!req.body.correct.find(v => Boolean(v | 0))) {
        return res.json({
            success: false,
            error: ['Au moins une réponse juste requise']
        });
    }
    const { level, subject, label, answer, correct } = req.body;
    await createQuestion(
        label,
        subject,
        level,
        answer.map((label, i) => ({
            label,
            correct: !!correct[i]
        }))
    );
    return res.json({
        success: true,
    });
});

app.post('/dashboard/poll', adminAuth, formSchemaPoll, validateFormSchema((req, res, next, err) => res.json({
    success: false,
    error: err
})), async (req, res) => {
    log(req.body);
    const { password, question } = req.body;
    const poll = createPoll(io, password, req.user, question.map(async id => await getQuestion(id)));
    return res.json({
        success: true,
        template: require('ejs').render(fs.readFileSync(path.join(__dirname, './public/poll-list.ejs'), {encoding: 'utf-8'}), {
            polls: await getPollsOf(req.user)
        })
    });
});

app.get('/logout', (req, res) => {
    if (req.user) {
        req.logout();
    }
    return res.redirect('/dashboard');
});

app.get('*', (req, res) => res.redirect('/dashboard'));

io.use(socketioSession);

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