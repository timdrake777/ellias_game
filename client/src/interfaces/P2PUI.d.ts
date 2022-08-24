import Peer from "simple-peer";

declare namespace P2PUI {
  interface ClientToServer {
    "join room": (roomID: string) => void;
    "sending signal": (a: SendSignal) => void;
    "user left": () => void;
    "returning signal": (a: { signal: Peer.SignalData; callerID: string }) => void;
  }

  interface ServerToClient {
    "all users": (usersInThisRoom: string[]) => void;
    "user joined": (a: UserJoined) => void;
    "receiving returned signal": (a: ReturnSignal) => void;
    userDisconnected: (a: { id: string }) => void;
    "room full": () => void;
  }

  interface SendSignal {
    userToSignal: string;
    callerID: string;
    signal: Peer.SignalData;
  }

  interface ReturnSignal {
    signal: Peer.SignalData;
    id: string;
  }

  interface UserJoined {
    signal: Peer.SignalData;
    callerID: string;
  }
}

export default P2PUI;
