const express = require('express');
var helmet = require('helmet');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');

const { authenticate } = require('./src/backend/repository');
const { promisify } = require('./src/utils');

const config = require('./src/config');

const jwtSign = promisify(jwt.sign), jwtVerify = promisify(jwt.verify);

const retreiveToken = request => request.query.token ||
    request.signedCookies && request.signedCookies.token ||
    request.headers['authorization'] || '';

const connected = async request => {
    const { poll } = request.params;
    const token = retreiveToken(request);
    if (token.length) {
        try {
            const infos = await jwtVerify(token, config.jwt.secret);
            if (infos.poll === poll) {
                return true;
            }
            // not connected
        } catch (e) {
            // not connected
            return false;
        }
    }

    return false;
};

const app = express(), io = socketio.listen(app.listen(8000));

app.set('views', path.join(__dirname, '/public'));
app.set('view engine', 'ejs');
app.use(helmet());
app.use(cookieParser(config.cookie.secret));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/poll/:poll(\\w{5})', async function(request, response) {
    const { login, password } = request.body;
    const { poll } = request.params;

    if (await connected(request)) {
        return response.redirect(request.path);
    }

    console.log(`POST ${request.path} form data :`, request.body);

    // verify login / pwd & poll affected & open
    const user = await authenticate(login, password);

    if (!user) {
        return response.json({
            success: false,
        });
    }

    jwt.sign({
        id: user.id,
        login,
        poll,
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