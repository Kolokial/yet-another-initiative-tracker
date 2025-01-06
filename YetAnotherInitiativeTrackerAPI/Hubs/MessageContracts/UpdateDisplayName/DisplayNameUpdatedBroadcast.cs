namespace YAIT.MessageContracts.UpdateDisplayName;

public class DisplayNameUpdatedBroadcast : Broadcast
{
    public string displayName { get; set; }
}