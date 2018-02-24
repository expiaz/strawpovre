const { log } = require('../utils');

/**
 *
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
       server:poll:join => list of ppl, length of poll
       server:poll:closed => the poll is closed, the connection is refused
       server:question:next => send the next question
        */

        socket.emit('server:poll:join', {
            length: poll.questions.length,
            students: Array.from(poll.students.values()),
            index: poll.index,
            prof: poll.owner,
            timer: poll.max_time,
        });

        if (admin) {
            if (poll.owner !== email) {
                // admins can't access every poll
                socket.emit('server:poll:closed');
                socket.disconnect();
                return;
            }
            bindAdmin(socket, user, poll, provider);
        } else {
            bindStudent(socket, user, poll, provider);
        }

        // event bindings
        socket.on('disconnect', () => {
            log(`Poll ${poll.id}, ${email} disconnected`);
        });
    });
};

const bindAdmin = (socket, user, poll) => {
    const { email } = user;

    const handleNextQuestion = () => {
        const question = poll.nextQuestion();
        if (! question) {
            // no more
            return;
        }
        // send to everyone else in the room
        socket.broadcast.emit('server:question:next', question);
        return question;
    };

    socket.on('client:admin:poll:start', () => {
        poll.start();
        handleNextQuestion();
    });

    socket.on('client:admin:question:next', acknoledgement => {
        const question = handleNextQuestion();
        if (! question) {
            return;
        }
        // send answer to the admin
        acknoledgement({answer: poll.questions[question.index].answer, ... question});
    });

    socket.on('client:admin:question:results', acknoledgement => {
        acknoledgement(poll.getAnswers());
    });
};

const bindStudent = (socket, user, poll, provider) => {
    const { email } = user;
    // add the student to the connected poll
    if (!poll.addStudent({ email })) {
        // if it fails, the poll is closed
        socket.emit('server:poll:closed');
        socket.disconnect();
        return;
    }

    socket.on('client:student:answer', answer => {
        poll.addAnswer({ email }, answer);
        provider.emit('server:student:answer', {
            user,
            answer
        })
    });
};

module.exports = {
    bindSocket,
};