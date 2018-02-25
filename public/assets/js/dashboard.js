$('document').ready(function () {

    function handleDuplicate($template, $addButton) {
        const $cleanTemplate = $template.clone(true);
        $addButton.click(function (e) {
            e.preventDefault();
            const $node = $cleanTemplate.clone(true);
            $('button.remove-template', $node).click(function (e) {
                e.preventDefault();
                $node.remove();
                return false;
            }).show();
            $addButton.before($node);
            return false;
        });
    }

    const sortQuestions = questions =>
            filters => questions.filter(question =>
                Object.keys(filters).reduce((has, filter) =>
                    has && question[filter] === (filters[filter]|0),
                    !0
                )
            );

    const $buttonSubmitQuestion = $('button.submit-question');
    $('button.add-question').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'GET',
            url: '/modal/question',
        }).done(function (template) {
            $('.question-modal .modal-body').html(template);
            handleDuplicate(
                $('.question-modal .modal-body .template'),
                $('.question-modal .modal-body button.add-template')
            );
            var $form = $('.question-modal .modal-content form');
            $form.submit(function () {
                e.preventDefault();
                $.ajax({
                    type: 'POST',
                    url: '/dashboard/question',
                    data: $form.serialize()
                }).done(function (res) {
                    if (res.success) {
                        $('.question-modal').modal('hide');
                    } else {
                        $('.question-modal .error').html(res.error.join('<br/>'))
                    }
                }).fail(function (err) {
                    console.log(err);
                })
                return false;
            });
            $buttonSubmitQuestion.click(function () {
                $form.submit();
            });
            $('.question-modal').modal('show');
        }).fail(function (err) {
            console.log(err);
            // TODO handle err
        })
        return false;
    })

    const $buttonSubmitPoll = $('button.submit-poll');
    $('button.add-poll').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'GET',
            url: '/modal/poll',
        }).done(function (res) {
            $('.poll-modal .modal-body').html(res.template);
            const sort = sortQuestions(res.data), filters = {};
            $('.poll-modal .change').change(function (e) {
                const filter = e.target.name, value = e.target.value;
                if (!value) {
                    delete filters[filter];
                } else {
                    filters[filter] = value;
                }
                $('select[name="question[]"]', e.target.parentNode).html([{
                        id: '',
                        label: 'Question'
                    }]
                    .concat(sort(filters))
                    .map(
                        question => `<option value="${question.id}">${question.label}</option>`
                    ));
            })
            handleDuplicate(
                $('.poll-modal .modal-body .template'),
                $('.poll-modal .modal-body button.add-template')
            );
            var $form = $('.poll-modal .modal-content form');
            $form.submit(function () {
                e.preventDefault();
                $.ajax({
                    type: 'POST',
                    url: '/dashboard/poll',
                    data: $form.serialize()
                }).done(function (res) {
                    if (res.success) {
                        $('.poll-modal').modal('hide');
                        $('.poll-container').html(res.template);
                    } else {
                        $('.poll-modal .error').html(res.error.join('<br/>'))
                    }
                }).fail(function (err) {
                    console.log(err);
                })
                return false;
            });
            $buttonSubmitPoll.click(function () {
                $form.submit();
            });
            $('.poll-modal').modal('show');
        }).fail(function (err) {
            console.log(err);
            // TODO handle err
        })
        return false;
    })

})

