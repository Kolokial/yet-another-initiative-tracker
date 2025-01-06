using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using YAIT.MessageContracts;
using YAIT.MessageContracts.FinishTurn;
using YAIT.MessageContracts.JoinRoom;
using YAIT.MessageContracts.LeaveRoom;
using YAIT.MessageContracts.RollDice;
using YAIT.MessageContracts.UpdateDisplayName;

namespace SignalRChat.Hubs;

public class ChatHub : Hub
{
    private RoomService _roomService;
    public ChatHub(RoomService roomService)
    {
        _roomService = roomService;
    }

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
        Console.WriteLine(user, message);
    }

    public async Task<JoinRoomResponse> JoinRoom(Envelope<JoinRoomRequest> envelope)
    {

        var roomName = envelope.message.roomName;
        var peer = new Peer()
        {
            auth0Id = envelope.auth0Id,
            characterName = envelope.message.characterName,
            diceRoll = envelope.message.diceRoll == null ? 0 : (int)envelope.message.diceRoll,
            displayName = envelope.message.displayName
        };
        Console.WriteLine($"{envelope.auth0Id} joined {envelope.message.roomName} with ConnectionId: {Context.ConnectionId}");
        await Groups.AddToGroupAsync(Context.ConnectionId, envelope.message.roomName);
        _roomService.AddPeerToRoom(envelope.message.roomName, peer);
        var broadcastMessage = new RoomJoinedBroadcast()
        {
            auth0Id = envelope.auth0Id,
            peer = peer
        };

        await Clients.Group(envelope.message.roomName).SendAsync("RoomJoined", broadcastMessage);
        return new JoinRoomResponse()
        {
            peerList = _roomService.GetRoomPeers(roomName)
        };
    }

    public async Task LeaveRoom(Envelope<LeaveRoomRequest> envelope)
    {
        var roomName = envelope.message.roomName;
        var auth0Id = envelope.auth0Id;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        Console.WriteLine($"{auth0Id} left {roomName} with ConnectionId: {Context.ConnectionId}");
        _roomService.RemovePeerFromRoom(envelope.auth0Id);
        await Clients.Group(roomName).SendAsync("RoomLeft", new RoomLeftBroadcast()
        {
            auth0Id = auth0Id
        });
    }

    public async Task FinishTurn(Envelope<FinishTurnRequest> envelope)
    {
        var roomKey = _roomService.findPeerRoomKey(envelope.auth0Id);
        Console.WriteLine(roomKey);
        var broadcastMessage = new TurnFinishedBroadcast()
        {
            auth0Id = envelope.auth0Id
        };
        await Clients.Group(roomKey).SendAsync("TurnFinished", broadcastMessage);
    }

    public async Task UpdateDisplayName(Envelope<UpdateDisplayNameRequest> envelope)
    {
        var displayName = envelope.message.displayName;
        var auth0Id = envelope.auth0Id;
        var roomKey = _roomService.UpdateDisplayName(auth0Id, displayName);
        if (roomKey != null)
        {
            var broadcastMessage = new DisplayNameUpdatedBroadcast()
            {
                auth0Id = envelope.auth0Id,
                displayName = displayName,
            };
            await Clients.Group(roomKey).SendAsync("DisplayNameUpdated", broadcastMessage);
            return;
        }
        else
        {
            Console.WriteLine("Can't find room with user in");
        }
    }

    public async Task RollDice(Envelope<RollDiceRequest> envelope)
    {
        var roomKey = _roomService.findPeerRoomKey(envelope.auth0Id);
        Console.WriteLine(roomKey);
        var broadcastMessage = new DiceRolledBroadcast()
        {
            auth0Id = envelope.auth0Id,
            diceRoll = envelope.message.diceRoll
        };
        await Clients.Group(roomKey).SendAsync("DiceRolled", broadcastMessage);
    }
}
