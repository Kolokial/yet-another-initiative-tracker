/* Housekeeping! */
using Microsoft.EntityFrameworkCore.Metadata;

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
        peers.Add(peer);
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
        foreach (var room in roomList)
        {
            Console.WriteLine($"Checking room {room.Key}");
            foreach (var peer in room.Value)
            {
                if (peer.auth0Id == auth0Id)
                {
                    peer.displayName = displayName;
                    return room.Key;
                }
                else
                {
                    Console.WriteLine("Can't find room with user in");
                }
            }
        }
        return null;
    }
}