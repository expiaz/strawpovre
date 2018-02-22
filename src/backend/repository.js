const md5 = require("md5");

const Student = require('./model/Student');
const Prof = require('./model/Prof');
const Poll = require('./model/Poll');
const { query, buildQuery } = require('./database');
const { deletePoll } = require('./session');

const polls = new Map();

/**
 *
 * @param io
 * @param password
 * @param owner
 * @param questions
 * @return {Poll}
 */
const createPoll = (io, password, owner = new Prof('root@root.root', 'root', 'root', []), questions = []) => {
    const poll = new Poll(owner, questions, password, io);
    polls.set(poll.id, poll);
    return poll;
};

/**
 *
 * @param poll
 * @return {Promise}
 */
const destroyPoll = poll => getPoll(poll)
    .then(p => deletePoll(poll).then(() => {
        p.destroy();
        polls.delete(poll);
    }));

/**
 *
 * @param id
 * @return {Promise}
 */
const getPoll = function (id) {
    return new Promise((resolve, reject) => {
        if (polls.has(id)) {
            resolve(polls.get(id));
        } else {
            reject(new Error(`Poll with id ${id} not found`));
        }
    });
};

/**
 *
 * @param prof {Prof}
 * @return {Promise}
 */
const getPollsOf = prof =>
    Array.from(polls.values()).filter(poll => poll.owner.email === prof.email);

/**
 *
 * @param where {Object}
 * @return {Promise}
 */
const getStudent = (where = {1:1}) => buildQuery('student', '*', where)
    .then(results => {
        if(!results.length) {
            return Promise.reject(new Error('Student with given credentials not found'));
        }
        const { email, firstname, name } = results[0];
        return new Student(email, name, firstname);
    });

/**
 *
 * @param where {Object}
 * @return {Promise}
 */
const getProf = (where = {1:1}) => buildQuery('prof', '*', where)
    .then(results => {
        if(!results.length) {
            return Promise.reject(new Error('Prof with given credentials not found'));
        }
        const { email, firstname, name } = results[0];
        return new Prof(email, name, firstname, getPollsOf({ email }));
    });

module.exports = {
    getStudent,
    getProf,
    getPoll,
    getPollsOf,
    createPoll,
    destroyPoll,
};