import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { v1 as uuid } from "uuid";
import { P2PUI } from "../interfaces";

type SocketClient = Socket<P2PUI.ServerToClient, P2PUI.ClientToServer>

const CreateRoom = () => {
  const [allRooms, setAllRooms] = useState<string[]>([])
  const history = useNavigate();
  const socketRef: MutableRefObject<SocketClient | null> = useRef<SocketClient | null>(
    null
  );

  useEffect(() => {
    socketRef.current = io("http://localhost:8000");

    socketRef.current.on("all rooms", (rooms) => {
      setAllRooms(rooms)
      console.log(rooms)
    });
  }, []);

  function create() {
    const roomID = uuid();
    if (socketRef.current)
      socketRef.current.emit("create room", roomID);
    history(`/room/${roomID}`);
  }

  return (
    <div className="test">
      <button onClick={create}>Create room</button>
      <ul>
        {allRooms.map((roomID, index) => {
          return(
            <li key={index}>{roomID}</li>
          )
        })}
      </ul>
    </div>
  );
};

export default CreateRoom;
