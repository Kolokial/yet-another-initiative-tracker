import { Observable } from 'rxjs';
import { Envelope, ProfileUpdateMessage, DiceRollMessage, PeerId } from './Messages';

export type DataChannelCollection = {
  PeerId: string;
  ProfileChannel: DataChannelEventsTraffic<ProfileUpdateMessage>;
  DiceChannel: DataChannelEventsTraffic<DiceRollMessage>;
};

export type DataChannelEventsTraffic<T> = {
  InboundEvents: DataChannelInboundEvents<T>;
  OutboundEvents: DataChannelOutboundEvents<T>;
};

export type DataChannelInboundEvents<T> = {
  onOpen: Observable<Event>;
  onMessage: Observable<Envelope<T>>;
  onClosing: Observable<Event>;
  onClose: Observable<PeerId>;
  onError: Observable<Event>;
};

export type DataChannelOutboundEvents<T> = {
  sendMessage: (message: Envelope<T>) => void;
};

export type RTCDataChannelCollection = {
  ProfileChannel: RTCDataChannel | null;
  DiceChannel: RTCDataChannel | null;
};

export type YAITCustomOffer = {
  offer: RTCSessionDescriptionInit;
  roomId: string;
  peerId: string;
};
