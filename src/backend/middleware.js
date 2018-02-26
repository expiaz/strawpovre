const passport = require('./passport');
const {body, validationResult} = require('express-validator/check');

const {getPoll} = require('./repository');

const {log} = require('../utils');

/**
 * ensure that a requested poll exists
 * @param req
 * @param res
 * @param next
 */
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

/**
 * authenticate a user with an email and a password for the given poll
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
const pollAuth = (req, res, next) => {
    const {poll = ''} = req.params;
    // already co
    if (req.user) {
        log(`pollAuth ${poll} ${req.user.email} already connected`);
        return next();
    }
    log(`pollAuth not connected`);
    // start auth
    passport.authenticate('poll', (err, user) => {
        if (err) {
            return next(err);
        }
        // no user found
        if (!user) {
            log(`pollAuth ${poll} failed connection`);
            return res.render('poll-login', {
                error: 'Identifiants incorrects'
            });
        }
        // blacklisted by the prof
        if (req.poll.blacklist.indexOf(user.email) !== -1) {
            return res.render('poll-login', {
                error: "You have been blacklisted"
            });
        }
        // auth ok, register the user and the session
        req.user = user;
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            req.poll.addStudent(user.email);
            log(`pollAuth ${poll} ${user.email} connected successfully`);
            next();
        });
    })(req, res, next);
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
const adminAuth = (req, res, next) => {
    // already co
    if (req.user) {
        log(`adminAuth ${req.user.email} already connected`);
        return next();
    }
    log(`adminAuth not connected`);
    // start auth
    passport.authenticate('local', (err, user) => {
        if (err) {
            return next(err);
        }
        // no user found
        if (!user) {
            log(`adminAuth failed connection`);
            return res.render('dashboard-login', {
                error: 'Identifiants incorrects'
            });
        }
        // auth ok, register the user and the session
        req.user = user;
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            log(`adminAuth ${user.email} connected successfully`);
            next();
        });
    })(req, res, next);
};

// make sure an admin route is accessible only by authenticated users
const isUser = (req, res, next) => {
    if (!req.user) {
        log(`controller login render login`);
        return res.render('poll-login', {
            error: 'You must be authenticated to access this page'
        });
    }
    return next();
};

// make sure an admin route is accessible only by administrators
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.admin) {
        return res.render('dashboard-login', {
            error: 'You must be admin to access this page'
        });
    }
    return next();
};

/**
 * form schemas to handle POST requests without verifying body of the request
 */
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

/**
 * call onErr with the errors of the body verification if there is some
 * @param onErr {Function}
 * @return {Function}
 */
const validateFormSchema = onErr =>
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return onErr(req, res, next, errors.array().map(err => err.msg));
        }
        return next();
    }



module.exports = {
    pollExists,
    pollAuth,
    adminAuth,
    isUser,
    isAdmin,
    validateFormSchema,
    formSchemaLogin,
    formSchemaQuestion,
    formSchemaPoll
}