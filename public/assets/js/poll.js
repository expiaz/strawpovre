socket.on('server:poll:join', packet => {
    console.log(packet);

    this.renderLobby();
});


socket.on('client:admin:poll:start', res => {
    console.log(res)
    this.renderQuestion()
});


function renderQuestion(question) {
    $('.poll-container').html(function () {
        return (
            `<div class="inner cover">
               <h1 class="cover-heading">Question 1</h1>
                <input type="text" placeholder="Answer" name="answer" class="form-control mb-3">
                <button class="btn btn-success">Send</button>
                </div>
    
                <div class="mastfoot">
                <div class="inner">
                <div class="badge badge-warning text-white p-2">Question 1 / XX</div>
            </div>
        </div>`)
    });
}

function renderLobby() {
    $('.poll-container').html(function () {
       return `<div>
            
            <h1>Welcome ! The poll is not started, please wait !</h1>
            <div>
                <span class="fa-4x fas fa-circle-notch fa-spin"></span>
            </div>
        </div>`
    });
}

/**
 * répondre à une question
 * socket.emit('question.answer', {
     *      question: question.id,
     *      answer: 'My answer'
     * });
 */


