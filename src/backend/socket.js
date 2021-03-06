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
            question: poll.closed ? poll.changeQuestion(poll.index) : -1,
        });
    });
};

const bindAdmin = (socket, user, poll, provider) => {
    const { email } = user;

    const handleChangeQuestion = index => {
        const question = poll.changeQuestion(index);
        if (! question) {
            // no more
            return;
        }
        log(`Poll ${poll.id} next question requested : ${question.label}`);
        // send to everyone else in the room
        provider.emit('server:question:change', question);
        return question;
    };

    socket.on('client:admin:student:remove', (email, acknoledgement) => {
        log(`A user (${email}) has been removed from the poll ${poll.id}`);
        poll.removeStudent(email) && acknoledgement();
    });

    socket.on('client:admin:poll:start', () => {
        log(`Starting the polll ${poll.id}`);
        poll.start();
        handleChangeQuestion(0);
    });

    socket.on('client:admin:question:change', index => {
        handleChangeQuestion(index);
    });

    socket.on('client:admin:question:results', () => {
        provider.emit('server:question:results', poll.questions[poll.index]);
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

    provider.emit('server:student:join', {
        template: render('student-list', {
            students: poll.students
        }),
        count: poll.students.size,
    });

    /**
     * a student submitted his answer to the current question
     */
    socket.on('client:student:answer', id => {
        // ensure that he don't already answered
        if (poll.addAnswer({ email }, id)) {
            // not already answered
            provider.emit('server:student:answer', {
                [email]: id,
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
