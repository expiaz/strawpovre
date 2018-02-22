const passport = require('./passport');

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
            return res.redirect(`/poll/${poll}`);
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

module.exports = {
    pollExists,
    pollAuth,
}