const { log } = require('../../utils');

class Poll {

    /**
     * @param id {String}
     * @param prof {Prof}
     * @param questions {Array<Question>}
     * @param password {String}
     * @param namespace
     */
    constructor(id, { email }, questions, password, namespace) {
        this.id = id;
        this.password = password;
        this.owner = email;

        this.questions = questions;
        this.students = new Map();
        this.blacklist = [];
        this.index = 0;
        this.closed = false;
        this.ns = namespace;
    }

    destroy() {
        delete this.students;
        delete this.questions;
    }

    start() {
        this.closed = true;
    }

    addStudent ({ email }) {
        if (this.students.has(email)) {
            log(`Student ${email} is already connected`);
            // already co, was disconnected
            return true;
        }

        if (!this.closed && email && this.blacklist.indexOf(email) === -1) {
            log(`New user for poll ${this.id} : ${email}`);
            this.students.set(email, new Map());
        }

        return !this.closed;
    }

    removeStudent (email) {
        if (!this.closed && email) {
            log(`Removing user for poll ${this.id} : ${email}`);
            this.students.delete(email);
            this.blacklist.push(email);
        }

        return !this.closed;
    }

    addAnswer({ email }, answer) {
        if (!this.students.has(email)
            || this.students.get(email).has(this.index)) {
            return;
        }
        this.students.get(email).set(this.index, answer);
    }

    nextQuestion() {
        if (this.index >= this.questions.length) {
            this.index = this.questions.length - 1;
            return;
        }

        const question = this.questions[this.index++];
        return {
            label: question.label,
            answers: question.getAnswersForClient(),
            id: question.id,
            index: this.index
        };
    }

    /**
     *
     * @param question Question
     * @returns {boolean}
     */
    addQuestion(question) {
        if (this.questions.indexOf(question) !== -1)
            return false;

        this.questions.push(question);
        return true;
    }

    getAnswers() {
        const studentAnswers = {};
        this.students.forEach((student, answers) => {
            if (answers.has(this.index)) {
                studentAnswers[student] = answers.get(this.index);
            }
        });
        return studentAnswers;
    }

}

module.exports = Poll;