const { getPollsOf } = require('./repository');
const { log } = require('../utils');

const login = (req, res, next) => {
    if (!req.user) {
        log(`controller login render login`);
        return res.render('poll-login');
    }
    log(`controller login user connected`);
    return next();
};

const poll = (req, res) => {
    const { poll, user } = req;
    if (user.admin && poll.owner === user.email) {
        log(`controller poll user admin`);
        return res.render('poll-dashboard', {
            user,
            poll
        });
    }
    log(`controller poll user student`);
    return res.render('poll', {
        user,
        poll
    });
};

const dashboard = (req, res) => {
    log(`controller dashboard render dashboard`);
    res.render('dashboard', {
        user: req.user,
        polls: getPollsOf(req.user)
    });
};

module.exports = {
    login,
    poll,
    dashboard
};