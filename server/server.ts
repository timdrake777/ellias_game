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
    methods: ["GET", "POST"],
  },
});

const clearPeer = (socketId: string) => {
  let roomID: string | null = socketToRoom[socketId];
  const deleteRoom: Promise<VarsUI.UsersInRoom> =
    new Promise<VarsUI.UsersInRoom>(() => {
      if (roomID) {
        delete users[roomID];
        rooms = rooms.filter((room) => {
          room !== roomID;
        });
      }
    });

  if (roomID) {
    let room: string[] = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socketId);
      users[roomID] = room;
      socketToRoom[socketId] = null;
    } else {
      deleteRoom.then(() => {
        io.in(usersWithoutRooms).emit("all rooms", rooms);
      });
    }
  } else {
    return;
  }
};

let rooms: string[] = [];
let usersWithoutRooms: string[] = [];

const users: VarsUI.UsersInRoom = {};

const socketToRoom: VarsUI.SocketToRoom = {};

io.on("connection", (socket) => {
  socket.emit("all rooms", rooms);
  usersWithoutRooms.push(socket.id);

  const userJoingRoom: Promise<string[]> = new Promise<string[]>(function () {
    usersWithoutRooms = usersWithoutRooms.filter((user) => user !== socket.id);
  });

  socket.on("create room", ({ roomID, socketID }) => {
    rooms.push(roomID);
    const userCreateRoom: Promise<string[]> = new Promise<string[]>(() => {
      usersWithoutRooms = usersWithoutRooms.filter(
        (user) => user !== socketID
      );
    });
    userCreateRoom.then(() => {
      io.in(usersWithoutRooms).emit("all rooms", rooms);
    });
  });

  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length: number = users[roomID].length;
      if (length === 4 || socket.id in users[roomID]) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }

    socketToRoom[socket.id] = roomID;

    const usersInThisRoom: string[] = users[roomID].filter(
      (id) => id !== socket.id
    );

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
    usersWithoutRooms.push(socket.id);
  });

  socket.on("user left", () => {
    clearPeer(socket.id);
    socket.broadcast.emit("userDisconnected", { id: socket.id });
    usersWithoutRooms.push(socket.id);
  });

  //   socket.on("mute microphone", (signal) => {
  //     socket.broadcast.emit("user muted", {
  //       id: signal.id,
  //       toggleMicro: signal.toggleMicro,
  //     });
  //   });
});

server.listen(8000, () => console.log("server is running on port 8000"));
