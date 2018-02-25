const passport = require('./passport');
const {body, validationResult} = require('express-validator/check');

const {getPoll} = require('./repository');

const {log} = require('../utils');

const pollExists = (req, res, next) => {
    const {poll = ''} = req.params;
    getPoll(poll)
        .then(p => {
            log(`pollExists ${poll} found`);
            req.poll = p;
            next();
        })
        .catch(err => res.status(404).end(`Error 404: ${err.message}`));
};

const pollAuth = (req, res, next) => {
    const {poll = ''} = req.params;
    if (req.user) {
        log(`pollAuth ${poll} ${req.user.email} already connected`);
        return next();
    }
    log(`pollAuth not connected`);
    passport.authenticate('poll', (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            log(`pollAuth ${poll} failed connection`);
            return res.render('poll-login', {
                error: 'Identifiants incorrects'
            });
        }
        req.user = user;
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            log(`pollAuth ${poll} ${user.email} connected successfully`);
            next();
        });
    })(req, res, next);
}

const formSchemaLogin = [
    body('email', 'Email requis')
        .exists()
        .isLength({min: 1})
        .trim()
        .normalizeEmail(),
    body('password', 'Mot de passe requis')
        .exists()
        .isLength({min: 1})
];

const validateFormSchema = onErr =>
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return onErr(req, res, next, errors.array().map(err => err.msg));
        }
        return next();
    }

const formSchemaQuestion = [
    body('level', 'Niveau requis')
        .exists()
        .isLength({min: 1})
        .isInt(),
    body('subject', 'Matière requise')
        .exists()
        .isLength({min: 1})
        .isInt(),
    body('label', 'Label requis')
        .exists()
        .isLength({min: 1}),
    body('answer', 'Au moins une réponse requise')
        .exists()
        .isLength({min: 1}),
    body('correct', 'Au moins une réponse correcte requise')
        .exists()
        .isLength({min: 1})
];

const formSchemaPoll = [
    body('password', 'Mot de passe requis (min 4 caractères)')
        .exists()
        .trim()
        .isLength({min: 4}),
    body('question', 'Au moins une question est requise')
        .exists()
        .isLength({min: 1})
];

module.exports = {
    pollExists,
    pollAuth,
    formSchemaLogin,
    validateFormSchema,
    formSchemaQuestion,
    formSchemaPoll
}