/* Housekeeping! */
using YAIT.MessageContracts;

public class RoomService
{
    private Dictionary<string, List<Peer>> roomList = new Dictionary<string, List<Peer>>();

    public List<Peer> GetRoomPeers(string roomName)
    {
        List<Peer> peers;
        roomList.TryGetValue(roomName, out peers);

        if (peers == null)
        {
            return new List<Peer>();
        }

        return peers;
    }

    public void AddPeerToRoom(string roomName, Peer peer)
    {
        List<Peer> peers;
        if (!roomList.TryGetValue(roomName, out peers))
        {
            peers = new List<Peer>();
            roomList.Add(roomName, peers);
        }
        var previousPeer = peers.FirstOrDefault(p => p.auth0Id == peer.auth0Id);
        if (previousPeer != null)
        {
            previousPeer.characterName = peer.characterName;
            previousPeer.diceRoll = peer.diceRoll;
            previousPeer.displayName = peer.displayName;
            previousPeer.isDungeonMaster = peer.isDungeonMaster;
        }
        else
        {
            peers.Add(peer);
        }

    }

    public void RemovePeerFromRoom(string auth0Id)
    {
        foreach (var room in roomList)
        {
            var peers = room.Value;
            for (int i = 0; i < peers.Count(); i++)
            {
                var peer = peers[i];
                if (peer.auth0Id == auth0Id)
                {
                    peers.RemoveAt(i);
                }
            }
        }
    }

    public string? UpdateDisplayName(string auth0Id, string displayName)
    {
        var roomKey = findPeerRoomKey(auth0Id);
        List<Peer> room;
        if (roomKey != null && roomList.TryGetValue(roomKey, out room))
        {
            var peer = room.Find(x => x.auth0Id == auth0Id);
            peer.displayName = displayName;
        }

        return roomKey;
    }

    public string findPeerRoomKey(string auth0Id)
    {
        // Console.WriteLine(auth0Id);
        // Console.WriteLine(JsonSerializer.Serialize(roomList));
        foreach (var room in roomList)
        {
            foreach (var peer in room.Value)
            {
                if (peer.auth0Id == auth0Id)
                {
                    return room.Key;
                }
            }
        }
        Console.WriteLine("Can't find room with user in");
        return null;
    }

    public bool hasDungeonMasterJoinedRoom(string roomName)
    {
        var peers = GetRoomPeers(roomName);
        if (peers.Count == 0)
        {
            return false;
        }
        var peer = peers.FirstOrDefault<Peer>(p => p.isDungeonMaster);
        return peer != null;
    }
}