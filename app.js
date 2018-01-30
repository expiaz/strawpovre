const express = require('express');
const socketio = require('socket.io');

const log = function() {
    console.log(...arguments);
};

const app = express();
const io = socketio.listen(app.listen(8080));

app.use(express.static('public'));

io.on('connection', (socket) => {



});