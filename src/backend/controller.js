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
    const { poll } = req;
    log(`controller updating connected students`);
    console.log(poll.getStudentsRepresentation());
    return res.json({
        message: "Update connected students",
        students: poll.getStudentsRepresentation(),
        count: poll.students.size,
    });
};

module.exports = {
    login,
    poll,
    dashboard,
    updateUsers,
};