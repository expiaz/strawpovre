const uid = require('uid');

const { log } = require('../../utils');

class Poll {

    /**
     * @param prof {Prof}
     * @param questions {Array<Question>}
     * @param password {String}
     * @param io
     */
    constructor({ email }, questions, password, io) {
        this.id = uid(5);
        this.password = password;
        this.owner = email;

        this.questions = questions;
        this.students = new Map();
        this.index = 0;

        const self = this;
        const ns = io.of(`/${this.id}`);

        ns.on('connection', function (socket) {
            const user = socket.request.user;
            if (!user) {
                socket.disconnect();
                return;
            }

            const { email, poll } = user;
            self.addStudent({ email });
            log(`Poll ${self.id}, ${email} connected`);

            // setup listeners
            socket.on('disconnect', function () {
                log(`Poll ${self.id}, ${email} disconnected`);
            });
        });

        const deleteNs = () => {
            log(`Poll ${self.id} release ns`);
            Object.keys(ns.connected).forEach(socketId => {
                ns.connected[socketId].disconnect();
            });
            ns.removeAllListeners();
            delete io.nsps[`/${self.id}`];
        };

        this.destroy = () => {
            log(`Poll ${self.id}, destroy`);
            deleteNs();
            log(`Poll ${self.id} release memory`);
            delete this.students;
            delete this.owner;
            delete this.questions;
        };
    }

    addStudent (student) {
        if (this.students.has(student.email)) {
            // already co, was disconnected
            return;
        }
        this.students.set(student.email, {});
    }

    addAnswer(student, question, answer) {
        if (!this.students.has(student.email)
            || this.students.get(student.email).hasOwnProperty(question)) {
            return;
        }
        this.students.get(student.email)[question] = answer;
    }

}

module.exports = Poll;