const { log } = require('../../utils');

class Answer {

    /**
     *
     * @param id
     * @param question {Question}
     * @param answer
     * @param isCorrect {Boolean}
     */
    constructor(id, question, answer, isCorrect) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.isCorrect = isCorrect;
    }
}

module.exports = Answer;