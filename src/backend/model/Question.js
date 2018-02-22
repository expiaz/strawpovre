const { log } = require('../../utils');

class Question {

    /**
     *
     * @param id
     * @param poll
     * @param question
     * @param level
     * @param answers {Array<Answer>}
     */
    constructor(id, poll, question, level, answers) {
        this.id = id;
        this.poll = poll;
        this.question = question;
        this.level = level;
        this.answers = answers;
    }

    addAnswer ({ id }) {
        if (this.answers.indexOf(id) === -1)
            return false;

        this.answers.push(id);
        return true;
    }

    /**
     *
     * @param answer {Answer}
     * @returns {boolean}
     */
    checkAnswer (answer) {
        //Given answer is not part of the possible answers
        if (this.answers.indexOf(answer.id) === -1)
            return false;

        let isCorrect = false;
        this.answers.forEach(function (idAnswer) {
            if (answer.id === idAnswer)
                isCorrect = answer.isCorrect;
        });

        return isCorrect;
    }
}

module.exports = Question;