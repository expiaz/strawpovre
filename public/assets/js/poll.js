var socket = io('/<%= poll.id %>');

socket.on('server:poll:join', packet => {
    console.log(packet);
});

/**
 * répondre à une question
 * socket.emit('question.answer', {
     *      question: question.id,
     *      answer: 'My answer'
     * });
 */