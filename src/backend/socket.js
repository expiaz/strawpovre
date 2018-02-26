const { log, render } = require('../utils');

/**
 * bind a socket and it's namespace to the correct events according to it's permissions
 * @param provider {Object}
 * @param poll {Poll}
 */
const bindSocket = function (provider, poll) {
    provider.on('connection', socket => {
        // the user should be injected in the request,
        // thanks to passport-socketio and express-session
        // @see session.js:25 & app.js:52
        const user = socket.request.user;
        // if not, just disconnect him,
        // bc he shouldn't be here
        if (!user) {
            socket.disconnect();
            return;
        }

        const { email, admin } = user;
        log(`Poll ${poll.id}, ${email} connected`);

        /*
       on (event comes from front)
       client:admin:student:remove => blacklist a student
       client:admin:poll:start => close the poll and start the first question
       client:admin:question:next => request next question
       client:admin:question:results => send the results of a question to the admin
       client:student:answer => new answer from a student

       emit (event goes to front)
       server:poll:join => list of ppl, length of poll, prof, timer
       server:poll:closed => the poll is closed, the connection is refused
       server:question:next => send the next question
        */

        if (admin) {
            // is him poll owner ?
            if (poll.owner !== email) {
                // admins can't access every poll
                socket.emit('server:poll:closed');
                socket.disconnect();
                return;
            }
            bindAdmin(socket, user, poll, provider);
        } else {
            // a student joined, add it to the list
            // TODO send the list of users and not the new one
            // bc if a user quit then reco, it'll be twice in the list
            provider.emit('server:student:join', {
                template: render('student-list', {
                    students: poll.students
                }),
                count: poll.students.size,
            });
            bindStudent(socket, user, poll, provider);
        }

        /**
         * send to every new user as
         * the initial state for the frontend
         */
        socket.emit('server:poll:join', {
            user: email,
            length: poll.questions.length,
            students: Array.from(poll.students.values()),
            index: poll.index,
            prof: poll.owner,
        });
    });
};

const bindAdmin = (socket, user, poll, provider) => {
    const { email } = user;

    const handleChangeQuestion = (ack, index) => {
        const question = poll.changeQuestion(index);
        if (! question) {
            // no more
            return;
        }
        log(`Poll ${poll.id} next question requested : ${question.label}`);
        // send to everyone else in the room
        provider.emit('server:question:next', question);
        acknoledgement({answer: poll.questions[question.index].answer, ... question});
        return question;
    };

    socket.on('client:admin:student:remove', (email, acknoledgement) => {
        log(`A user (${packet.user}) has been removed from the poll ${poll.id}`);
        poll.removeStudent(packet.user) && acknoledgement();
    });

    /**
     * acknoledgement is used to send back the answer
     * to the question to the admin without an other events
     * it's simply a function parameter passed in front
     * socket.io handles the transfer
     */

    socket.on('client:admin:poll:start', acknoledgement => {
        log(`Starting the polll ${poll.id}`);
        poll.start();
        handleChangeQuestion(acknoledgement, 0);
    });

    socket.on('client:admin:question:change', (acknoledgement, index) => {
        handleChangeQuestion(acknoledgement, index);
    });

    socket.on('client:admin:question:results', acknoledgement => {
        acknoledgement(poll.getAnswers());
    });
};

const bindStudent = (socket, user, poll, provider) => {
    const { email } = user;
    // add the student to the connected poll
    if (!poll.addStudent(user)) {
        // if it fails, the poll is closed
        socket.emit('server:poll:closed');
        socket.disconnect();
        return;
    }

    /**
     * a student submitted his answer to the current question
     */
    socket.on('client:student:answer', answer => {
        // ensure that he don't already answered
        if (poll.addAnswer({ email }, answer.label)) {
            // not already answered
            provider.emit('server:student:answer', {
                user,
                answer,
            });
        }

    });

    /**
     * triggered when a user disonnect
     */
    socket.on('disconnect', () => {
        provider.emit('server:user:disconnect');
    });
};

module.exports = {
    bindSocket,
};
