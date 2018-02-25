$(document).ready(function () {
    let ctx = document.getElementById('chart-answers');

    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    function displayChartOnNextQuestion(ctx, paquet, questionNumber = 1) {
        if (!paquet)
            return;
        let question = paquet.question;
        if (!paquet.question)
            return;
        let answers = question.answers;
        let data = [];

        for (let i = 0; i < answers.length; i++) {
            data.push(answers[i].number);
        }

        return chartAnswers = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [{
                    label: 'Answers for the question n°' + questionNumber,
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    //Return the poll updated
    function onUsersUpdate(url, poll) {
        $.post(
            url,
            {poll: poll},
            function(data) {
                //Notify the message
                $.notify(
                    {message: data.message},
                    {type: 'info'}
                );
                console.log(data.students);
            }
        );
    }

    let chartAnswers = displayChartOnNextQuestion(ctx);
});
