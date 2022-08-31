import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Room, CreateRoom, RoomIsFull } from "./routes";

function App() {
  return (
    <div className="wrapper">
      <Routes>
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/:roomID" element={<Room />} />
        <Route path="/full" element={<RoomIsFull />} />
        <Route path="*" element={<Navigate to={{ pathname: "/create" }} />} />
      </Routes>
    </div>
  );
}

export default App;
