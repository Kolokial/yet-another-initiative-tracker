export type Offer = {
  offer: RTCSessionDescriptionInit;
  roomId: string;
  peerId: string;
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
  joinRoom: (roomId: string) => void;
  offer: (data: Offer) => void;
  answer: (data: Answer) => void;
  candidate: (data: Candidate) => void;
  disconnect: () => void;
};
