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

let chartAnswers;

function questionHandler(data) {
    $.notify(
        {message: 'Let\'s go with ' + data.label},
        {type: 'info'}
    );
    let content = $("#content");

    content.html(
        "<div class='text-center' id='header-question'>" +
            "<h3>" + data.label + "</h3>" +
        "</div>");

    Object.keys(data.answers).forEach(function (answer) {
        $("#header-question").append(
            `<div style="display: inline; margin: 0px 20px;"><h5 class="d-inline">${data.answers[answer]}</h5></div>`
        );
    });

    content.append(
        '<div class="chart-container" style="margin-top: 50px;position: relative; height:40vh; width:80vw">' +
        '    <canvas id="chart-answers"></canvas>' +
        '</div>');
    let ctx = document.getElementById('chart-answers');
    chartAnswers = initChart(ctx, data);
}

function answerHandler(answers) {
    if (answers) {
        console.log(answers);
        console.log(chartAnswers.data);
        for (var email in answers) {
            chartAnswers.data.datasets[0].data[chartAnswers.data.labels.indexOf(state.question.answers[answers[email]])]++;
            chartAnswers.update();
        }
    }
}

//Charts
function initChart(ctx, question) {
    if (!question)
        return;
    let answers = question.answers;

    let data = Array(Object.keys(answers).length).fill(0);
    let labels = Object.keys(answers).map(id => answers[id]);

    return chartAnswers = new Chart(ctx, {
        type: "horizontalBar",
        data: {
            labels: labels,
            datasets: [{
                label: "Answers",
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }]
            }
        }
    });
}

$('button.delete-poll').click(function (e) {
    e.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/api/poll',
        data: {
            id: $(e.target).attr('data-id')
        }
    }).done(function (res) {
        if (res.success) {
            window.location.replace('/dashboard');
        } else {
            console.log(res.error);
        }
    }).fail(function (err) {
        console.log(err);
    });
    return false;
});
