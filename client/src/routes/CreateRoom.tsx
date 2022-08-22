import React from "react";
import { Link } from "react-router-dom";
import { v1 as uuid } from "uuid";

const CreateRoom = () => {
    const id = uuid();

    return (
        <Link to={`/room/${id}`}>Create room</Link>
    );
};

export default CreateRoom;