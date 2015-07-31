// Server init point

import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import ServeStatic from 'serve-static';

let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.use(new ServeStatic('./dist'));

server.listen(8000, () => {
  console.log('server started');
});

io.on('connection', (socket) => {
  socket.on('login', (name) => {
    console.log(name);
  });
});

// import buildEngine from './game/init.js';
// console.log(buildEngine(true));
