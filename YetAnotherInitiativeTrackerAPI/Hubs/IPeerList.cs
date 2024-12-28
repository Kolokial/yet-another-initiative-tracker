
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

public class JoinRoomRequest
{
    public string roomName { get; set; }
    public string displayName { get; set; }
    public int? diceRoll { get; set; }
    public string? characterName { get; set; }
}

public class JoinRoomBroadcast
{
    public Peer peer { get; set; }
}
public class LeaveRoomRequest
{
    public string roomName { get; set; }
}

public class LeaveRoomBroadcast
{
    public string auth0Id { get; set; }
}

public class UpdateDisplayNameRequest
{
    public string displayName { get; set; }
}

public class UpdateDisplayNameBroadcast
{
    public string auth0Id { get; set; }
    public string displayName { get; set; }
}