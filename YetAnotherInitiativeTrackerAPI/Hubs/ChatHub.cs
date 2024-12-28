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

    public async Task<List<Peer>> JoinRoom(Envelope<JoinRoomMessage> envelope)
    {

        var roomName = envelope.message.roomName;
        Console.WriteLine($"{envelope.message.peer.auth0Id} joined {envelope.message.roomName} with ConnectionId: {Context.ConnectionId}");
        await Groups.AddToGroupAsync(Context.ConnectionId, envelope.message.roomName);
        _roomService.AddPeerToRoom(envelope.message.roomName, envelope.message.peer);
        List<Peer> peerList = _roomService.GetRoomPeers(roomName);

        await Clients.Group(envelope.message.roomName).SendAsync("PeerJoined", peerList);
        return peerList;
    }

    public async Task LeaveRoom(Envelope<LeaveRoomMessage> envelope)
    {
        var roomName = envelope.message.roomName;
        var auth0Id = envelope.auth0Id;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        await Clients.Group(roomName).SendAsync($"{auth0Id} joined {roomName} with ConnectionId: {Context.ConnectionId}");
    }

    public async Task UpdateDisplayName(string displayName, string auth0Id)
    {
        string roomKey = _roomService.UpdateDisplayName(auth0Id, displayName);
        if (roomKey != null)
        {
            await Clients.Group(roomKey).SendAsync("DisplayNameUpdated", displayName, auth0Id);
            return;
        }
        else
        {
            Console.WriteLine("Can't find room with user in");
        }
    }
}
