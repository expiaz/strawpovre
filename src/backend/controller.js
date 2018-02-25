const { getPollsOf, getPoll } = require('./repository');
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
};

const dashboard = (req, res) => {
    log(`controller dashboard render dashboard`);
    res.render('dashboard', {
        user: req.user,
        polls: getPollsOf(req.user)
    });
};

const updateUsers = (req, res) => {
    let data = req.body;
    log(`controller updating connected students of the given poll`);
    log(`request parameters : ${data.poll} (should be the id of the poll)`);
    return res.json({
        message: "Update connected students",
        students: getPoll(data.poll).students,
    });
};

module.exports = {
    login,
    poll,
    dashboard,
    updateUsers,
};