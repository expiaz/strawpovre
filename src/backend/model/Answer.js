class Answer {

    /**
     * Number is the answer number in the question (used to display in the chart)
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