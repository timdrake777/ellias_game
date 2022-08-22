import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

interface ServerToClientEvents {
    
}

interface ClientToServerEvents {

}

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props: { peer: { on: (arg0: string, arg1: (stream: MediaProvider | null) => void) => void; }; }) => {
    const ref : MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        props.peer.on("stream", (stream: MediaProvider | null) => {
            if (ref.current !== null)
                ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props: { match: { params: { roomID: any; }; }; }) => {
    const [peers, setPeers] = useState([]);
    const socketRef : MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null> = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(null);
    const userVideo : MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;

    useEffect(() => {
        socketRef.current = io("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", (users: any[]) => {
                const peers: ((prevState: never[]) => never[]) | Peer.Instance[] = [];
                users.forEach((userID: any) => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", (payload: { signal: any; callerID: any; }) => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", (payload: { id: any; signal: any; }) => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal: any, callerID: any, stream: MediaStream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal: string | Peer.SignalData, callerID: any, stream: MediaStream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};

export default Room;