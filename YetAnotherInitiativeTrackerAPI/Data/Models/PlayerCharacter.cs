using Microsoft.AspNetCore.Mvc.ModelBinding;

public class PlayerCharacter
{
    [BindNever]
    public int PlayerCharacterId { get; set; }
    public int UserId { get; set; }
    public string? CharacterName { get; set; }
    public int DexterityMod { get; set; }
    public bool? LuckStone { get; set; }
    public bool? AlertFeat { get; set; }
    //public bool IsInPlay { get; set; }
    public bool? IsDeleted { get; set; }
}