namespace YAIT.MessageContracts.RollDice;

public class DiceRolledBroadcast : Broadcast
{
    public int diceRoll { get; set; }
    public int characterId { get; set; }
}