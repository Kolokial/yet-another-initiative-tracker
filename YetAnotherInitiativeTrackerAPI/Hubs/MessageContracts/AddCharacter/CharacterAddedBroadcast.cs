namespace YAIT.MessageContracts.UpdateDisplayName;

public class CharacterAddedBroadcast : Broadcast
{
    public Character character { get; set; }
}