const md5 = require('md5');
const uid = require('uid');

const Student = require('./model/Student');
const Prof = require('./model/Prof');
const Poll = require('./model/Poll');
const { query, buildQuery } = require('./database');
const { bindSocket } = require('./socket');
const deletePollSession = require('./session').deletePoll;

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
    const id = uid(5);
    const ns = io.of(`/${id}`);
    const poll = new Poll(id, owner, questions, password, ns);
    bindSocket(ns, poll);
    polls.set(id, poll);
    return poll;
};

/**
 *
 * @param io
 * @param poll {Poll}
 * @return {Promise}
 */
const destroyPoll = (io, { id }) => getPoll(id)
    .then(poll => deletePollSession(id).then(() => {
        const { ns } = poll;
        // delete namespace
        Object.keys(ns.connected).forEach(socketId => {
            ns.connected[socketId].disconnect();
        });
        ns.removeAllListeners();
        delete io.nsps[`/${id}`];
        // delete poll from application
        polls.delete(id);
        poll.destroy();
    }));

/**
 *
 * @param id
 * @return {Promise}
 */
const getPoll = id => new Promise((resolve, reject) => {
        if (polls.has(id)) {
            resolve(polls.get(id));
        } else {
            reject(new Error(`Poll with id ${id} not found`));
        }
    });

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

/**
 * @param poll
 * @return {Promise}
 */
const getQuestionsOf = poll =>
    Array.from(polls.values()).filter(question => question.poll.id === poll.id);


module.exports = {
    getStudent,
    getProf,
    getPoll,
    getPollsOf,
    createPoll,
    destroyPoll,
    getQuestionsOf,
};