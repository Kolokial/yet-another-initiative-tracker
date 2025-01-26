using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.OpenApi.Extensions;
using YAIT.MessageContracts;
using YAIT.MessageContracts.AddCharacter;
using YAIT.MessageContracts.FinishTurn;
using YAIT.MessageContracts.JoinRoom;
using YAIT.MessageContracts.LeaveRoom;
using YAIT.MessageContracts.RemoveCharacter;
using YAIT.MessageContracts.RollDice;
using YAIT.MessageContracts.UpdateCharacterInPlay;
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

        if (envelope.message.isDungeonMaster && _roomService.hasDungeonMasterJoinedRoom(roomName))
        {
            return new JoinRoomResponse()
            {
                dateStamp = new DateTime(),
                peerList = new List<Peer>(),
                errorMessage = $"The Dungeon Master has already joined room: {roomName}",
                isRoomJoined = false
            };
        }

        var peer = new Peer()
        {
            auth0Id = envelope.auth0Id,
            characters = envelope.message.characters == null ? new List<Character>() : envelope.message.characters,
            displayName = envelope.message.displayName,
            isDungeonMaster = envelope.message.isDungeonMaster
        };
        //Console.WriteLine($"{envelope.auth0Id} joined {envelope.message.roomName} with ConnectionId: {Context.ConnectionId}");
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
            dateStamp = new DateTime(),
            peerList = _roomService.GetRoomPeers(roomName),
            isRoomJoined = true
        };
    }

    public async Task LeaveRoom(Envelope<LeaveRoomRequest> envelope)
    {
        var roomName = envelope.message.roomName;
        var auth0Id = envelope.auth0Id;
        var peer = _roomService.GetRoomPeers(roomName).FirstOrDefault(x => x.auth0Id == envelope.auth0Id);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        Console.WriteLine($"{auth0Id} left {roomName} with ConnectionId: {Context.ConnectionId}");
        _roomService.RemovePeerFromRoom(envelope.auth0Id);
        await Clients.Group(roomName).SendAsync("RoomLeft", new RoomLeftBroadcast()
        {
            auth0Id = auth0Id,
            peer = peer
        });
    }

    public async Task FinishTurn(Envelope<FinishTurnRequest> envelope)
    {
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);

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
    }

    public async Task UpdateCharacterInPlay(Envelope<UpdateCharacterInPlayRequest> envelope)
    {
        var character = envelope.message.character;
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);

        if (roomKey != null)
        {
            var broadcastMessage = new CharacterInPlayUpdatedBroadcast()
            {
                auth0Id = envelope.auth0Id,
                character = character,
            };
            await Clients.Group(roomKey).SendAsync("CharacterInPlayUpdated", broadcastMessage);
            return;
        }
    }

    public async Task UpdateInitiative(Envelope<UpdateInitiativeRequest> envelope)
    {
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);

        if (roomKey != null)
        {
            var broadcastMessage = new InitiativeUpdatedBroadcast()
            {
                auth0Id = envelope.auth0Id,
                initiative = envelope.message.Initiative

            };
            await Clients.Group(roomKey).SendAsync("InitiativeUpdated", broadcastMessage);
        }
    }

    public async Task RollDice(Envelope<RollDiceRequest> envelope)
    {
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);

        var broadcastMessage = new DiceRolledBroadcast()
        {
            auth0Id = envelope.auth0Id,
            diceRoll = envelope.message.diceRoll
        };
        await Clients.Group(roomKey).SendAsync("DiceRolled", broadcastMessage);
    }

    public async Task AddCharacter(Envelope<AddCharacterRequest> envelope)
    {
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);
        _roomService.AddCharacterToPeer(envelope.auth0Id, envelope.message.character);
        await Clients.Group(roomKey).SendAsync("CharacterAdded", new CharacterAddedBroadcast()
        {
            character = envelope.message.character
        });
    }

    public async Task RemoveCharacter(Envelope<RemoveCharacterRequest> envelope)
    {
        var roomKey = _roomService.FindPeerRoomKey(envelope.auth0Id);
        _roomService.RemoveCharacterFromPeer(envelope.auth0Id, envelope.message.characterId);
        await Clients.Group(roomKey).SendAsync("CharacterRemoved", new CharacterRemovedBroadcast()
        {
            auth0Id = envelope.auth0Id,
            characterId = envelope.message.characterId
        });
    }
}
