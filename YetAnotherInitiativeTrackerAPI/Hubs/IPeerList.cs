using System.ComponentModel;
using Microsoft.AspNetCore.SignalR;

public class Envelope<T>
{
    public string auth0Id { get; set; }
    public T message { get; set; }
    public DateTime timestamp { get; set; }
}
public class Peer
{
    public string displayName { get; set; }
    public string auth0Id { get; set; }
    public int diceRoll { get; set; }
    public string characterName { get; set; }
}

public class JoinRoomMessage
{
    public string roomName { get; set; }
    public Peer peer { get; set; }
}

public class LeaveRoomMessage
{
    public string roomName { get; set; }
}