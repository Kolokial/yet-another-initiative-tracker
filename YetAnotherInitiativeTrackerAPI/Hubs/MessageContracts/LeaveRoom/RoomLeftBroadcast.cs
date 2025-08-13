namespace YAIT.MessageContracts.LeaveRoom;

public class RoomLeftBroadcast : Broadcast
{
    public Peer peer { get; set; }
}