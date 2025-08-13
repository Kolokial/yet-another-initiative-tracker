namespace YAIT.MessageContracts.JoinRoom;

public class JoinRoomResponse : ResponseBase
{
    public List<Peer> peerList { get; set; }
    public bool isRoomJoined { get; set; }
}