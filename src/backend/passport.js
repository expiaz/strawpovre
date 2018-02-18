const passport = require('passport');
const md5 = require('md5');
const LocalStrategy  = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom').Strategy;

const { getStudent, getProf, getPoll } = require('./repository');
const { log } = require('../utils');

passport.use(
    new LocalStrategy({
            usernameField: 'email'
        }, function (email, password, done) {
            getProf({ email, password: md5(password) })
                .then(prof => {
                    log(`LocalStrategy ${email} authenticated`);
                    done(null, prof)
                })
                .catch(err => {
                    log(`LocalStrategy ${email} failed`);
                    done(null, false)
                });
        })
);

passport.use('poll', new CustomStrategy((req, done) => {
    const { email = '', password = '' } = req.body;
    const { poll = '' } = req.params;

    if (!email.length || !password.length || !poll.length) {
        return done(null, false);
    }

    getStudent({ email })
        .then(student =>
            getPoll(poll)
                .then(p => {
                    if (p.password !== password) {
                        log(`CustomStrategy ${email} ${poll} pwd mismatch`);
                        return done(null, false);
                    }
                    student.poll = poll;
                    log(`CustomStrategy ${email} ${poll} authenticated`);
                    done(null, student);
                }))
        .catch(err => {
            log(`CustomStrategy ${email} ${poll} failed`);
            done(null, false);
        });
}));

passport.serializeUser(function (user, done) {
    log(`serializeUser`, user);

    const { admin, email, poll = '' } = user;
    done(null, { admin, email, poll });
});

passport.deserializeUser(function ({ admin, email, poll }, done) {
    log(`deserializeUser ${email}`);

    if (admin) {
        return getProf({ email })
            .then(prof => done(null, prof))
            .catch(err => done(null, false));
    }

    getStudent({ email })
        .then(student =>
            getPoll(poll)
                .then(_ => {
                    student.poll = poll;
                    done(null, student);
                }))
        .catch(err => done(null, false));
});

module.exports = passport;