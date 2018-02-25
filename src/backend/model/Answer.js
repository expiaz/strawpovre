const { log } = require('../../utils');

class Answer {

    /**
     * Number is the answer number in the question (used to display in the chart)
     * @param id {Number}
     * @param label {String}
     * @param question {Question}
     * @param correct {Boolean}
     * @param number {Number}
     */
    constructor(id, label, question, correct, number) {
        this.id = id;
        this.label = label;
        this.question = question;
        this.correct = correct;
        this.number = number;
    }
}

module.exports = Answer;