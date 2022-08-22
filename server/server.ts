require('dotenv').config();
import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const users : any = {};

const socketToRoom : any = {};

io.on('connection', (socket : any) => {
    socket.on("join room", (roomID : any) => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter((id: any) => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", (payload: { userToSignal: any; signal: any; callerID: any; }) => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", (payload: { callerID: any; signal: any; }) => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter((id : any) => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(process.env.PORT || 4040, () => console.log('server is running on port 4040'));

