import React from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import RoomIsFull from "./routes/RoomIsFull";

function App() {
  return (
    <div className="wrapper">
      <Router>
        <Switch>
          <Route path="/" exact component={CreateRoom} />
          <Route path="/room/:roomID" component={Room} />
          <Route path="/full" component={RoomIsFull} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
