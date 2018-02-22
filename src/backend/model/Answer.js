const { log } = require('../../utils');

class Answer {

    constructor(id, question, answer, isCorrect) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.isCorrect = isCorrect;
    }

}

module.exports = Answer;