let currentQuestion = '';
let answerSelected = '';
let state = {};

socket.on('server:poll:join', packet => {
    if (packet)
        state = packet;
    if (state && state.question === -1)
        this.renderLobby();
    else {
        currentQuestion = state.question;
        this.renderQuestion(state.question);
    }
});

socket.on('server:question:change', question => {
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

socket.on('server:question:results', data => {
    resultHandler(data);
});


function renderQuestion(question) {
    $('.poll-container').html(function () {
        return (
            `<div class="inner cover poll-question">
                    <h1 class="mb-5">${question.label}</h1>
                    <div class="row mb-5 answers">
                        ${renderAnswers(question.answers)}
                    </div>
                    <button class="btn btn-success col-12" onclick="send(this)">Send</button>
                    <div class="mastfoot">
                    <div class="inner">
                        <div class="badge badge-warning text-white p-2">Question ${question.id} / ${question.count}</div>
                    </div>
                </div>
            </div>`)
    });
}

function renderAnswers(answers) {
    return Object.keys(answers).map(id => renderAnswer(id, answers[id])).join('');
}


function renderAnswer(id, label) {
    return `<div class="col-4">
                <div class="btn btn-info col-10 answer-display" id="answer-${id}" 
                    onclick="answerClick($('.answers'), $(this), ${id})">
                    ${label}
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
    answerSelected = answer;
    for (let i = 0; i < btnGroup[0].children.length; i++) {
        $(btnGroup[0].children[i].children[0]).removeClass('btn-warning');
        $(btnGroup[0].children[i].children[0]).addClass('btn-info');
    }
    btn.removeClass('btn-info');
    btn.addClass('btn-warning');
}

function send(btn) {
    $(btn).prop("disabled", true);
    socket.emit('client:student:answer', answerSelected);
}

function resultHandler(question) {
    let correctAnswers = question.answers.filter(function (elem) {
        return elem.correct === 1;
    }).map(function (elem) {
        return elem.label;
    });

    $(".poll-container").prepend(
        '<div class="alert" id="alert-answer">' +
            '<h3>La bonne réponse était :</h3>' +
        '</div>'
    );

    correctAnswers.forEach(function (answer) {
        $("#alert-answer").append(
            `<div style="display: inline; margin: 0px 20px;">` +
            `<h5 class="d-inline question-answers" data-id="answer">${answer}</h5>`
            +`</div>`
        );
    });
}

/**
 * répondre à une question
 * socket.emit('question.answer', {
     *      question: question.id,
     *      answer: answer
     * });
 */


