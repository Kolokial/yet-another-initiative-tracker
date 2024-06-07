import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { SignalingService } from './signaling.service';

export type Envelope = {
    sender: string,
    message: string
}

@Injectable({
    providedIn: 'root',
})
export class MessagingService {

    private _roomId: string = '';
    public get roomId(): string {
        return this._roomId;
    }

    private _myPeerId: string = '';
    public get myPeerId(): string {
        return this._myPeerId;
    }

    private _messageStream: ReplaySubject<Envelope> = new ReplaySubject<Envelope>();
    public get messageStream(): Observable<Envelope> {
        return this._messageStream.asObservable();
    }

    constructor(private signalingService: SignalingService) {
        this.signalingService.dataChannelSubject.subscribe((dataChannel) => {
            if (dataChannel) {
                this.setupDataChannel(dataChannel);
            }
        });
    }

    createRoom() {
        this._roomId = Math.random().toString(36).substring(7);
        this._myPeerId = this.signalingService.joinRoom(this.roomId);
        alert(`Room created with ID: ${this.roomId}`);
    }

    joinRoom() {
        const roomId = prompt('Enter the room ID to join:');
        if (roomId) {
            this._roomId = roomId;
            this._myPeerId = this.signalingService.joinRoom(this.roomId);
        }
    }

    sendMessage(message: string) {
        for (const peerId of Object.keys(this.signalingService.peerConnections)) {
            const dataChannel = this.signalingService.dataChannels[peerId];
            if (dataChannel && dataChannel.readyState === 'open') {
                const envelope: Envelope = {
                    sender: this.myPeerId,
                    message: message,
                };
                this._messageStream.next(envelope);
                dataChannel.send(JSON.stringify(envelope));
            }
        }
    }

    private setupDataChannel(dataChannel: RTCDataChannel) {
        dataChannel.onopen = () => {
            console.log('Data channel open');
        };

        dataChannel.onclosing = (event: Event) => {
            console.log('Data channel has begun to close', event);
        };

        dataChannel.onclose = () => {
            console.log('Data channel  has closed');
        };

        dataChannel.onerror = (event: Event) => {
            console.log('There was an error', event);
        };

        dataChannel.onmessage = (event: MessageEvent) => {
            if (event.data.sender !== this.myPeerId) {
                const json: Envelope = JSON.parse(event.data);
                this._messageStream.next(json);
                //this.ref.detectChanges();

                console.log('Data channel message:', event.data);
            }
        };
    }
}