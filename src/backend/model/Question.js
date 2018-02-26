class Question {

    /**
     *
     * @param id {Number}
     * @param label {String}
     * @param level {Level}
     * @param subject {Subject}
     * @param answers {Answer[]}
     */
    constructor(id, label, subject, level, answers) {
        this.id = id;
        this.label = label;
        this.subject = subject;
        this.level = level;
        this.answers = answers;
    }

    /**
     *
     * @param answer {Answer}
     * @returns {boolean}
     */
    checkAnswer(answer) {
        //Given answer is not part of the possible answers
        if (this.answers.indexOf(answer.id) === -1)
            return false;

        let isCorrect = false;
        this.answers.forEach(function (idAnswer) {
            if (answer.id === idAnswer)
                isCorrect = answer.correct;
        });

        return isCorrect;
    }

    getAnswersForClient() {
        let answers = [];

        this.answers.forEach(function (answer) {
            answers.push({
                id: answer.id,
                label: answer.label,
                number: answer.number
            });
        });

        return answers;
    }
}

module.exports = Question;