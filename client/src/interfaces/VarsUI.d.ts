import Peer from "simple-peer";

declare namespace VarsUI {
  interface PropsVideo {
    peer: { peer: Peer.Instance };
  }

  interface MatchParams {
    roomID: string;
    username: string;
  }

  interface PeersInRoom {
    peer: Peer.Instance;
    peerID: string;
  }

  interface UsersInRoom {
    [roomId: string]: string[];
  }

  interface SocketToRoom {
    [roomId: string]: string | null;
  }
}

export default VarsUI;
