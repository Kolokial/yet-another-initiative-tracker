export type Offer = {
  offer: RTCSessionDescriptionInit;
  roomId: string;
  peerId: string;
  auth0Id: string;
};

export type Answer = {
  roomId: string;
  answer: RTCSessionDescription;
  target: string;
  source: string;
};

export type Candidate = {
  roomId: string;
  candidate: RTCIceCandidate;
  target: string;
};

export type ServerToClientEvents = {
  roomJoined: (peers: string[]) => void;
  offer: (data: Offer) => void;
  answer: (data: Answer) => void;
  candidate: (data: Candidate) => void;
};

export type ClientToServerEvents = {
  joinRoom: (roomId: string, auth0Id: string) => void;
  leaveRoom: (roomId: string, auth0Id: string) => void;
  offer: (data: Offer) => void;
  answer: (data: Answer) => void;
  candidate: (data: Candidate) => void;
  disconnect: (auth0Id: string) => void;
};
