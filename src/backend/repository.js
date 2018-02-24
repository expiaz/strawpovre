const md5 = require('md5');
const uid = require('uid');

const Student = require('./model/Student');
const Prof = require('./model/Prof');
const Poll = require('./model/Poll');
const Question = require('./model/Question');
const Answer = require('./model/Answer');
const Level = require('./model/Level');
const Subject = require('./model/Subject');

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

const createQuestion = (label, level, subject, answers = []) => {
    query('INSERT INTO `question` SET ?', {
        label,
        level,
        subject
    }).then(results => {
        const questionId = results.insertedId;
        return Promise.all(
            answers.map(({ label, correct }) => query('INSERT INTO `answer` SET ?', {
                label,
                question: questionId,
                correct
            })
            .then(res => {
                const answerId = res.insertedId;
                return new Answer(answerId, questionId, label, correct);
            }))
        ).then(answers => new Question(questionId, label, level, subject, answers))
    })
}

/**
 *
 * @param id {Number}
 * @return {Promise<Subject>}
 */
const getLevel = id =>
    query('SELECT * FROM `level` WHERE `level`.`id` = ?', [id])
        .then(results => {
            if (!results.length) Promise.reject(`Level with id ${id} not found`);
            const { label } = results[0];
            return new Level(id, label);
        })

/**
 * @return {Level<Subject[]>}
 */
const getAllLevels = () =>
    query('SELECT `id` FROM `level`')
        .then(results => Promise.all(
            results.map(({ id }) => getLevel(id))
        ))

/**
 * @param id {Number}
 * @return {Promise<Subject>}
 */
const getSubject = id =>
    query('SELECT * FROM `subject` WHERE `subject`.`id` = ?', [id])
        .then(results => {
            if (!results.length) Promise.reject(`Subject with id ${id} not found`);
            const { label } = results[0];
            return new Subject(id, label);
        })

/**
 * @return {Promise<Subject[]>}
 */
const getAllSubjects = () =>
    query('SELECT `id` FROM `subject`')
        .then(results => Promise.all(
            results.map(({ id }) => getSubject(id))
        ))

/**
 *
 * @param where {Object} WHERE cond
 * @return {Promise<Answer[]>}
 */
const getAnswer = (where = {1:1}) => buildQuery('answer', '*', where)
    .then(results => results.map(
        ({ id, label, question, correct }) => new Answer(id, label, question, correct)
    ))

/**
 *
 * @param id {Number}
 * @return {Promise<Question>}
 */
const getQuestion = id => {
    query('SELECT * FROM `questions` WHERE `questions`.`id` = ?', [id])
        .then(async results => {
            if (!results.length) Promise.reject(`Question with id ${id} not found`);
            const { label, subject, level } = results[0];
            return new Question(
                id,
                label,
                await getSubject(subject),
                await getLevel(level),
                await getAnswer({ question: id })
            );
        })
}

/**
 * @return {Promise<Question[]>}
 */
const getAllQuestions = () =>
    query('SELECT `id` FROM `question`')
        .then(results => Promise.all(
            results.map(({ id }) => getQuestion(id))
        ))

module.exports = {
    getStudent,
    getProf,
    getPoll,
    getPollsOf,
    createPoll,
    destroyPoll,
    getQuestion,
    getAllQuestions
};