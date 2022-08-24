import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { v1 as uuid } from "uuid";

interface Props extends RouteComponentProps {}

const CreateRoom = (props: Props) => {
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create room</button>
    );
};

export default CreateRoom;