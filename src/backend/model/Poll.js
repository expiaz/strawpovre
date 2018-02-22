const { log } = require('../../utils');

class Poll {

    /**
     * @param id {String}
     * @param prof {Prof}
     * @param questions {Array<Question>}
     * @param password {String}
     * @param io
     */
    constructor(id, { email }, questions, password, namespace) {
        this.id = id;
        this.password = password;
        this.owner = email;

        this.questions = questions;
        this.students = new Map();
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
        if (! this.students.has(email)) {
            // already co, was disconnected
            return true;
        }
        if (! this.closed) {
            this.students.set(email, new Map());
        }
        return this.closed;
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

        const { label, answer } = this.questions[this.index++];
        return {
            label,
            answer,
            index: this.index
        };
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