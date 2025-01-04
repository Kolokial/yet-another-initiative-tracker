namespace YAIT.MessageContracts.JoinRoom;

public interface JoinRoomRequest
{
    public string roomName { get; set; }
    public string displayName { get; set; }
    public int? diceRoll { get; set; }
    public string? characterName { get; set; }
}