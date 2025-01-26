namespace YAIT.MessageContracts.RemoveCharacter;

public class CharacterRemovedBroadcast : Broadcast
{
    public int characterId { get; set; }
}