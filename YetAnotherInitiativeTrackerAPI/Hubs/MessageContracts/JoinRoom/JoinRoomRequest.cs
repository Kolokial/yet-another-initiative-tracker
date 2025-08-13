namespace YAIT.MessageContracts.JoinRoom;

public class JoinRoomRequest
{
    public string roomName { get; set; }
    public string displayName { get; set; }
    public List<Character>? characters { get; set; }
    public bool isDungeonMaster { get; set; }
}