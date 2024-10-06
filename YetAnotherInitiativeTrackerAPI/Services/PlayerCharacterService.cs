using Microsoft.EntityFrameworkCore;

public class PlayerCharacterService
{
    private readonly YAITDBContext _dbContext;

    public PlayerCharacterService(YAITDBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public List<PlayerCharacter> GetAllPlayerCharacters(string auth0Id)
    {
        var user = GetUser(auth0Id);

        return _dbContext.PlayerCharacter.ToList().FindAll(c => c.UserId == user.UserId);
    }

    public int AddPlayerCharacter(string auth0Id, string CharacterName, int DexterityMod, bool? LuckStone, bool? AlertFeat, bool? IsDeleted)
    {

        var user = GetUser(auth0Id);
        var playerCharacter = new PlayerCharacter
        {
            UserId = user.UserId,
            AlertFeat = AlertFeat,
            CharacterName = CharacterName,
            DexterityMod = DexterityMod,
            IsDeleted = IsDeleted,
            LuckStone = LuckStone
        };

        _dbContext.PlayerCharacter.Add(playerCharacter);
        _dbContext.SaveChanges();
        return playerCharacter.PlayerCharacterId;
    }

    public PlayerCharacter GetPlayerCharacter(string auth0Id, int playerCharacterId)
    {
        var user = GetUser(auth0Id);

        return _dbContext.PlayerCharacter.ToList().Find(playerCharacter => playerCharacter.PlayerCharacterId == playerCharacterId && playerCharacter.UserId == user.UserId);
    }

    private User? GetUser(string auth0Id)
    {
        var user = _dbContext.User.Where(user => user.Auth0Id == auth0Id).FirstOrDefault();
        if (user == null)
        {
            throw new Exception();
        }
        return user;
    }
}