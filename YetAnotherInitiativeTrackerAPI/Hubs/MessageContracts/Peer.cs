namespace YAIT.MessageContracts;

public class Peer
{
    public string displayName { get; set; }
    public string auth0Id { get; set; }
    public List<Character> characters { get; set; }
    public bool isDungeonMaster { get; set; }
}








