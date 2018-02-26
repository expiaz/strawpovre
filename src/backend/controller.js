const express = require('express');

const { log, render } = require('../utils');

const {
    pollExists,
    pollAuth,
    adminAuth,
    isUser,
    isAdmin,
    formSchemaLogin,
    formSchemaQuestion,
    formSchemaPoll,
    validateFormSchema
} = require('./middleware');

const {
    createPoll,
    destroyPoll,
    getAllQuestions,
    getQuestion,
    getAllSubjects,
    getAllLevels,
    createQuestion,
    getPollsOf
} = require('./repository');


const initRoutes = io => {
    const front = express.Router();
    const back = express.Router();
    const api = express.Router();
    const modal = express.Router();

    front.post('/:poll(\\w{5})',
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

    front.get('/:poll(\\w{5})', pollExists, isUser, (req, res) => {
        const { poll, user } = req;
        if (user.admin) {
            if (poll.owner !== user.email) {
                // admins can't access to every poll
                return res.redirect('/dashboard');
            }
            log(`controller poll user admin`);
            return res.render('poll-dashboard', {
                user,
                poll,
                polls: getPollsOf(user),
            });
        }
        log(`controller poll user student`);
        return res.render('poll', {
            user,
            poll
        });
    });

    back.post('/',
        formSchemaLogin,
        validateFormSchema((req, res, next, err) => res.render('dashboard-login', {
            error: err[0]
        })),
        adminAuth,
        (req, res) => {
            return res.redirect(`/dashboard`);
        });

    back.get('/', isAdmin, (req, res) => {
        log(`controller dashboard render dashboard`);
        res.render('dashboard', {
            user: req.user,
            polls: getPollsOf(req.user)
        });
    });

    modal.use(isAdmin);

    modal.get('/question', async (req, res) => res.render('forms/question', {
        subjects: await getAllSubjects(),
        levels: await getAllLevels()
    }));

    modal.get('/poll', async (req, res) => {
        return res.json({
            template: render('forms/poll', {
                subjects: await getAllSubjects(),
                levels: await getAllLevels(),
                questions: await getAllQuestions()
            }),
            data: await getAllQuestions().then(questions => questions.map(q => ({
                id: q.id,
                label: q.label,
                subject: q.subject.id,
                level: q.level.id
            })))
        })
    });

    api.use(isAdmin);

    api.post('/question', formSchemaQuestion, validateFormSchema((req, res, next, err) => res.json({
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

    api.post('/poll', formSchemaPoll, validateFormSchema((req, res, next, err) => res.json({
        success: false,
        error: err
    })), async (req, res) => {
        if (!req.body.question.find(v => Boolean(v | 0))) {
            return res.json({
                success: false,
                error: ['Au moins une question doit être remplie']
            });
        }
        const { password, question } = req.body;
        createPoll(io, password, req.user, question.map(async id => await getQuestion(id)));
        return res.json({
            success: true,
            template: render('poll-list', {
                polls: await getPollsOf(req.user)
            })
        });
    });

    api.delete('/poll', (req, res) => {
        const { id = '' } = req.body;
        if (!id || id.length !== 5) {
            return res.json({
                success: false,
                error: ['A poll must have an id']
            });
        }
        destroyPoll(io, { id })
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch(e => {
                res.json({
                    success: false,
                    error: [e.message]
                })
            })
    });

    return {
        front,
        back,
        api,
        modal
    };
};

module.exports = {
    initRoutes
};