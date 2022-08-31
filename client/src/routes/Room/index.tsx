import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Navigate, useParams } from "react-router-dom";
import P2PUI from "../../interfaces/P2PUI";
import VarsUI from "../../interfaces/VarsUI";

import "./Room.scss";
import { MyVideo, Video } from "../../components";

interface SocketClient
  extends Socket<P2PUI.ServerToClient, P2PUI.ClientToServer> {}

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;f
  flex-wrap: wrap;
`;

const Room = () => {
  const [peers, setPeers] = useState<VarsUI.PeersInRoom[]>([]);
  const [isFull, setIsFull] = useState(false);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const socketRef: MutableRefObject<SocketClient | null> =
    useRef<SocketClient | null>(null);
  const userVideo: MutableRefObject<HTMLVideoElement | null> =
    useRef<HTMLVideoElement | null>(null);
  const peersRef: MutableRefObject<VarsUI.PeersInRoom[] | null> = useRef<
    VarsUI.PeersInRoom[] | null
  >([]);

  let { roomID } = useParams();

  useEffect(() => {
    socketRef.current = io("http://localhost:8000");
    if (roomID) {
      /** Получение медиа данных */
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream: MediaStream) => {
          if (userVideo.current) userVideo.current.srcObject = stream;
          setMyStream(stream);
          if (socketRef.current && roomID) {
            /** Отправляется запрос на подключение к комнате */
            socketRef.current.emit("join room", roomID);

            /** Если подключение прошло успешно,
             * получаем список пользователей в комнатe
             *
             * */
            socketRef.current.on("all users", (users) => {
              const peers: VarsUI.PeersInRoom[] = [];
              users.forEach((userID) => {
                if (socketRef.current && peersRef.current) {
                  const peer: Peer.Instance = createPeer(
                    userID,
                    socketRef.current.id,
                    stream
                  );
                  peersRef.current.push({
                    peer: peer,
                    peerID: userID,
                  });
                  peers.push({
                    peer: peer,
                    peerID: userID,
                  });
                }
              });
              setPeers(peers);
            });
          }

          if (socketRef.current) {
            /**Пользователь присоеденился и отправляет сигнал
             * остальным пользователям в комнате
             *
             * */
            socketRef.current.on("user joined", (payload) => {
              const peer = addPeer(payload.signal, payload.callerID, stream);
              if (peersRef.current)
                peersRef.current.push({
                  peer,
                  peerID: payload.callerID,
                });

              const peerObj = {
                peer,
                peerID: payload.callerID,
              };

              setPeers((users) => [...users, peerObj]);
            });

            /** Отправляем новому пользователю данные о пирах в комнате */
            socketRef.current.on("receiving returned signal", (payload) => {
              if (peersRef.current) {
                const item: VarsUI.PeersInRoom | undefined =
                  peersRef.current.find((p) => p.peerID === payload.id);
                if (item) item.peer.signal(payload.signal);
              }
            });

            /** Если юзер вышел,
             * отправляем всем пользователям в комнате информацию об этом
             *
             * */
            socketRef.current.on("userDisconnected", (payload) => {
              if (peersRef.current) {
                const item: VarsUI.PeersInRoom | undefined =
                  peersRef.current.find((p) => p.peerID === payload.id);
                if (item) {
                  item.peer.destroy();
                }
                const newPeers = peersRef.current.filter(
                  (p) => p.peerID !== payload.id
                );
                peersRef.current = newPeers;
                setPeers(newPeers);
              }
            });

            socketRef.current.on("room full", () => {
              setIsFull(true);
            });

            // socketRef.current.on("user muted", (signal) => {
            //   console.log(
            //     signal.id,
            //     peersRef.current,
            //     userVideo.current.srcObject
            //   );
            //   const userToMute = peersRef.current.find(
            //     (p) => p.peerID === signal.id
            //   );

            //   const userToToggleMute = userToMute.peer.streams[0]
            //     .getTracks()
            //     .find((p) => p.kind === "audio");

            //   if (userToToggleMute) {
            //     userToToggleMute.enabled = signal.toggleMicro;
            //     userToMute.peerMuted = signal.toggleMicro;
            //     setPeers(peersRef.current);
            //   }
            // });
          }
        });
    }
  }, [roomID]);

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream
  ) {
    const peer: Peer.Instance = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      if (socketRef.current)
        socketRef.current.emit("sending signal", {
          userToSignal: userToSignal,
          callerID: callerID,
          signal: signal,
        });
    });

    return peer;
  }

  function addPeer(
    incomingSignal: Peer.SignalData,
    callerID: string,
    stream: MediaStream
  ) {
    const peer: Peer.Instance = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      if (socketRef.current)
        socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const handlerDisconnect = () => {
    if (socketRef.current) socketRef.current.emit("user left");
  };

  const handlerMute = () => {
    if (myStream) {
      const toggleMicro: MediaStreamTrack | undefined = myStream
        .getTracks()
        .find((p) => p.kind === "audio");

      if (toggleMicro) {
        if (toggleMicro.enabled) {
          toggleMicro.enabled = false;
        } else {
          toggleMicro.enabled = true;
        }
      }
    }

    // socketRef.current.emit("mute microphone", {
    //   id: socketRef.current.id,
    //   toggleMicro: toggleMicro.enabled,
    // });
  };

  return (
    <Container>
      {isFull ? (
        <Navigate to="/full" replace />
      ) : (
        <div className="video--content">
          <MyVideo refer={userVideo} />
          {peers.map((peer) => {
            return <Video key={peer.peerID} peer={peer} />;
          })}

          <a onClick={handlerDisconnect} href="/">
            Disconnect
          </a>
          <button onClick={handlerMute}>Mute</button>
        </div>
      )}
    </Container>
  );
};

export default Room;
