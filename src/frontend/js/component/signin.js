const ajax = (url, method, params, headers) => {
    return new Promise(function (resolve, reject) {
        var xhttp;
        if(XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else if(ActiveXObject) {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            throw new Error('XMLHttpRequest|ActiveXObject not supported');
        }

        xhttp.onreadystatechange = function () {
            if(xhttp.readyState === 4) {
                if(xhttp.status === 200) {
                    try {
                        resolve(JSON.parse(xhttp.responseText));
                    } catch(e) {
                        reject(200, e);
                    }
                } else {
                    reject(xhttp.status, xhttp.response);
                }
            }
        }

        xhttp.open(
            method || 'GET',
            url,
            true
        );

        if(!!params && typeof params === "object") {
            params = Object.keys(params).reduce(function (acc, key) {
                return acc + "&" + encodeURIComponent(key.toString()) + "=" + encodeURIComponent(params[key].toString());
            }, '').substring(1);
            if(! Object.keys(headers).find(header => header.toLowerCase() === 'content-type')) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            params = null;
        }

        if(!!headers && typeof headers === "object") {
            Object.keys(headers).forEach(function (header) {
                xhttp.setRequestHeader(header, headers[header]);
            });
        }

        try {
            xhttp.send(params);
        } catch(e) {
            reject(-1, e);
        }
    });
}

const $form = document.querySelector('form'),
    $login = $form.querySelector('input[name=login]'),
    $pwd = $form.querySelector('input[name=password]'),
    $log = document.querySelector('p');

document.addEventListener('keyup', e => (e.which || e.keyCode) === 13 && $form.dispatchEvent(new Event('submit')));

$form.addEventListener('submit', e => {
    e.preventDefault();
    ajax(window.location.pathname, 'POST', {
        login: $login.value,
        password: $pwd.value
    }, {
        'Content-Type': 'application/x-www-form-urlencoded'
    }).then(response => {
        if (response.success && response.token) {
            localStorage.setItem('strawpovre', JSON.stringify({
                token: response.token,
                poll: response.poll
            }));
            location.reload();
        } else {
            $log.textContent = response.error;
        }
    }).catch(err => {
        $log.textContent = err.message;
    });
    return false;
});