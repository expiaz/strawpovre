let currentQuestion = '';
let answerSelected = '';
let state = {};

socket.on('server:poll:join', packet => {
    state = packet;
    this.renderLobby();
});

socket.on('server:question:next', question => {
    currentQuestion = question;
    this.renderQuestion(question);
});

socket.on('server:poll:quit', packet => {
    this.renderQuit();
});
socket.on('server:student:remove', data => {
    if (state && state.user === data.user)
        location.replace("/logout");
});


function renderQuestion(question) {
    $('.poll-container').html(function () {
        return (
            `<div class="inner cover poll-question">
                    <h1 class="mb-5">${question.label}</h1>
                    <div class="row mb-5 answers">
                        ${renderAnswers(question.answers)}
                    </div>
                    <button class="btn btn-success col-12" onclick="send()">Send</button>
                    <div class="mastfoot">
                    <div class="inner">
                        <div class="badge badge-warning text-white p-2">Question ${question.id} / ${question.count}</div>
                    </div>
                </div>
            </div>`)
    });
}

function renderAnswers(answers) {
    let res = '';
    for (let i = 0; i < answers.length; i++) {
        res += renderAnswer(answers[i]);
    }
    return res;
}


function renderAnswer(answer) {
    return `<div class="col-4">
                <div class="btn btn-info col-10" id="answer-${answer.id}" 
                    onclick="answerClick($('.answers'), $(this), ${answer.id})">
                    ${answer.label}
                </div>
            </div>`;
}

function renderLobby() {
    $('.poll-container').html(function () {
       return `<div class="poll-lobby">
            <h1>Welcome ! The poll is not started, please wait !</h1>
            <div>
                <span class="fa-5x fas fa-circle-notch fa-spin"></span>
            </div>
        </div>`
    });
}

function renderQuit() {
    $('.poll-container').html(function () {
        return `<div class="poll-lobby">
            
            <h1>Sorry ! the poll is finished !</h1>
            <div>
                <span class="fa-5x far fa-smile"></span>
            </div>
        </div>`
    });
}

function answerClick(btnGroup, btn, answer) {
    answerSelected = currentQuestion.answers[answer-1];
    for (let i = 0; i < btnGroup[0].children.length; i++) {
        $(btnGroup[0].children[i].children[0]).removeClass('btn-warning');
        $(btnGroup[0].children[i].children[0]).addClass('btn-info');
    }
    btn.removeClass('btn-info');
    btn.addClass('btn-warning');
}

function send() {
    socket.emit('client:student:answer', answerSelected);
}

/**
 * répondre à une question
 * socket.emit('question.answer', {
     *      question: question.id,
     *      answer: answer
     * });
 */


