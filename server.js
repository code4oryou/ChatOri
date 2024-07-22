const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
    socket.on('join room', (data) => {
        const { username, room } = data;
        users[socket.id] = { username, room, socketId: socket.id };
        socket.join(room);
        socket.username = username;
        socket.room = room;

        // Notify others in the room
        socket.to(room).emit('user joined', { socketId: socket.id, username });

        // Send existing users in the room to the new user
        const usersInRoom = Object.values(users).filter(user => user.room === room).map(user => ({ socketId: user.socketId, username: user.username }));
        socket.emit('existing users', usersInRoom);
    });

    socket.on('send message', (data) => {
        const { recipientId, message } = data;
        const room = socket.room;
        const username = socket.username;

        if (recipientId) {
            // Send private message
            io.to(recipientId).emit('send message', { from: username, message, private: true });
            socket.emit('send message', { from: username, message, private: true });  // Echo message back to sender
        } else {
            // Broadcast message
            io.to(room).emit('send message', { from: username, message, private: false });
        }
    });

    socket.on('disconnect', () => {
        const room = socket.room;
        if (users[socket.id]) {
            socket.leave(room);
            io.to(room).emit('user left', { socketId: socket.id, username: users[socket.id].username });
            delete users[socket.id];
        }
    });
});

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});
