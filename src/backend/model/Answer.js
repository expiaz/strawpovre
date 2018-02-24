const { log } = require('../../utils');

class Answer {

    /**
     *
     * @param id {Number}
     * @param label {String}
     * @param question {Question}
     * @param correct {Boolean}
     */
    constructor(id, label, question, correct) {
        this.id = id;
        this.label = label;
        this.question = question;
        this.correct = correct;
    }
}

module.exports = Answer;