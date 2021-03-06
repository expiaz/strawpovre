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
        delete this.blacklist;
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

    /**
     *
     * @param email
     * @param answer
     * @return {boolean} answer registered or not
     */
    addAnswer({ email }, answer) {
        if (!this.students.has(email)
            || this.students.get(email).has(this.index)) {
            return false;
        }
        this.students.get(email).set(this.index, answer);
        return true;
    }

    changeQuestion(index) {
        if (index >= this.questions.length) {
            index = this.questions.length - 1;
        } else if (index < 0) {
            index = 0;
        }

        this.index = index;

        const question = this.questions[this.index];
        return {
            label: question.label,
            answers: question.getAnswersForClient(),
            id: question.id,
            count: this.questions.length,
            index: this.index
        };
    }

    getAnswers() {
        const studentAnswers = {};
        this.students.forEach((answers, student) => {
            if (answers.has(this.index)) {
                studentAnswers[student] = answers.get(this.index);
            }
        });
        return studentAnswers;
    }

}

module.exports = Poll;
