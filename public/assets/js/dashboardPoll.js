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

//Handlers the join event
function joinHandler(data) {
    $("#student-number").text('Students : ' + data.count);
    let tableBody = $("#table-students").find("tbody");
    tableBody.text('');

    tableBody.append(
        "<tr>" +
            "<td class='email-student-poll'>" + data.user + "</td>" +
            "<td>" +
                '<button class="btn btn-block kick-button" onclick="triggerBlacklist(this);">Kick user</button>' +
            "</td>" +
        "</tr>"
    );
}

function questionHandler(data) {
    $.notify(
        {message: 'Let\'s go with ' + data.label},
        {type: 'info'}
    );
    let content = $("#content");

    content.html("<h3>" + data.label + "</h3>");
    content.append('<canvas id="chart-answers" width="400" height="400"></canvas>');

    const ctx = document.getElementById('chart-answers');
    let chartAnswers = displayChartOnNextQuestion(ctx, data);
}

//Charts
function displayChartOnNextQuestion(ctx, question, questionNumber = 1) {
    if (!question)
        return;
    let answers = question.answers;

    let data = Array(answers.length).fill(0);
    let labels = answers.map(object => object.label);

    console.log(data);
    console.log(labels);

    return chartAnswers = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: 'Answers for the question n°' + questionNumber,
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
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

$('button.delete-poll').click(function (e) {
    e.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/dashboard/poll',
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
