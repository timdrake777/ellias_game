require("dotenv").config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import P2PUI from "../client/src/interfaces/P2PUI";
import VarsUI from "../client/src/interfaces/VarsUI";
const app = express();
const server = http.createServer(app);
const io = new Server<P2PUI.ClientToServer, P2PUI.ServerToClient>(server, {
    cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
});


const clearPeer = (socketId: string) => {
  const roomID: string = socketToRoom[socketId];
  let room: string[] = users[roomID];
  if (room) {
    room = room.filter((id) => id !== socketId);
    users[roomID] = room;
  }
};

const users: VarsUI.UsersInRoom = {};

const socketToRoom : VarsUI.SocketToRoom = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length: number = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom : string[] = users[roomID].filter((id : string) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    clearPeer(socket.id);
    socket.broadcast.emit("userDisconnected", { id: socket.id });
  });

  socket.on("user left", () => {
    clearPeer(socket.id);
    socket.broadcast.emit("userDisconnected", { id: socket.id });
  });

//   socket.on("mute microphone", (signal) => {
//     socket.broadcast.emit("user muted", {
//       id: signal.id,
//       toggleMicro: signal.toggleMicro,
//     });
//   });
});

server.listen(8000, () => console.log("server is running on port 8000"));
