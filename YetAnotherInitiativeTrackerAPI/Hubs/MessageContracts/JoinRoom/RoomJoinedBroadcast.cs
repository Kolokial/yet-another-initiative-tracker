namespace YAIT.MessageContracts.JoinRoom;

public class RoomJoinedBroadcast : Broadcast
{
    public Peer peer { get; set; }
}