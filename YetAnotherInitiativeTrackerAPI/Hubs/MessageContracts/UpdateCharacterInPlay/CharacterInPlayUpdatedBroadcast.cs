namespace YAIT.MessageContracts.UpdateCharacterInPlay;

public class CharacterInPlayUpdatedBroadcast : Broadcast
{
    public Character character { get; set; }
}