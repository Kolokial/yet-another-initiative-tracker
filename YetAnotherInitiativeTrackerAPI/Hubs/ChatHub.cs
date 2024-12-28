using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;

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

    public async Task<List<Peer>> JoinRoom(Envelope<JoinRoomRequest> envelope)
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
        List<Peer> peerList = _roomService.GetRoomPeers(roomName);

        await Clients.Group(envelope.message.roomName).SendAsync("PeerJoined", peer);
        return peerList;
    }

    public async Task LeaveRoom(Envelope<LeaveRoomRequest> envelope)
    {
        var roomName = envelope.message.roomName;
        var auth0Id = envelope.auth0Id;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        Console.WriteLine($"{auth0Id} left {roomName} with ConnectionId: {Context.ConnectionId}");
        await Clients.Group(roomName).SendAsync("PeerLeft", new LeaveRoomBroadcast()
        {
            auth0Id = auth0Id
        });
    }

    public async Task UpdateDisplayName(Envelope<UpdateDisplayNameRequest> envelope)
    {
        var displayName = envelope.message.displayName;
        var auth0Id = envelope.auth0Id;
        var roomKey = _roomService.UpdateDisplayName(auth0Id, displayName);
        if (roomKey != null)
        {
            var broadcastMessage = new UpdateDisplayNameBroadcast()
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
}
