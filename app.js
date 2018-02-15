const express = require('express');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');

const { authenticateStudent } = require('./src/backend/repository/StudentRepository');

const config = require('./src/config');

const retreiveToken = request => request.query.token ||
    request.signedCookies && request.signedCookies.token ||
    request.headers['authorization'] || '';

const app = express(), io = socketio.listen(app.listen(8000));

app.set('views', path.join(__dirname, '/public'));
app.set('view engine', 'ejs');
app.use(cookieParser(config.cookie.secret));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/poll/:poll(\\w{5})', async function(request, response) {
    const { login, password } = request.body;
    const { poll } = request.params;

    console.log(`POST ${request.path} form data :`, request.body);

    // verify login / pwd & poll affected & open
    const valid = await authenticateStudent(login, password);
    console.log(valid);

    if (!valid) {
        return response.json({
            success: false,
        });
    }

    jwt.sign({
        login,
        poll
    }, config.jwt.secret, {
        expiresIn: config.jwt.age,
    }, function (err, token) {
        if (err) {
            response.json({
                success: false,
            });
        } else {
            response.cookie('token', token, {
                maxAge: config.cookie.age,
                path: request.path,
                signed: config.cookie.secret,
                httpOnly: true
            });
            response.json({
                success: true,
                token: token,
                poll: poll
            });
        }
    });
});

app.get('/poll/:poll(\\w{5})', function (request, response) {
    const token = retreiveToken(request);
    jwt.verify(token, config.jwt.secret, function (err, infos) {
        console.log(`GET ${request.path} auth : ${!err}, infos & cookies :`, infos, request.signedCookies);
        if(err || request.params.poll !== infos.poll) {
            // asked poll different from logged one
            response.render('login');
        } else {
            // TODO move connection into creation
            io.of(`/${request.params.poll}`).on('connection', function (socket) {
                console.log(`socket connected to ${request.params.poll}`);
            });
            response.render('poll', {
                token: token,
                poll: infos.poll
            });
        }
    });
});

io.use((socket, next) => {
    jwt.verify(retreiveToken(socket.handshake), config.jwt.secret, function (err, infos) {
        console.log(`socket ${socket.handshake.headers.referer}`, !!err, infos);
        if(err) {
            next(err);
        } else {
            next();
        }
    });
});