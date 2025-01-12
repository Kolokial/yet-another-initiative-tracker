using Microsoft.EntityFrameworkCore;

public class PlayerCharacterService
{
    private readonly YAITDBContext _dbContext;

    public PlayerCharacterService(YAITDBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public List<PlayerCharacter> ReadAllPlayerCharacters(string auth0Id)
    {
        var user = GetUser(auth0Id);

        return _dbContext.PlayerCharacter.Where(c => c.UserId == user.UserId && c.DexterityMod != null).ToList();
    }

    public int CreatePlayerCharacter(string auth0Id, string CharacterName, int DexterityMod, bool LuckStone, bool AlertFeat, bool IsDeleted, bool IsInPlay)
    {
        var user = GetUser(auth0Id);
        var playerCharacter = new PlayerCharacter
        {
            UserId = user.UserId,
            AlertFeat = AlertFeat,
            CharacterName = CharacterName,
            DexterityMod = DexterityMod,
            IsDeleted = IsDeleted,
            LuckStone = LuckStone,
            IsInPlay = IsInPlay,
        };

        _dbContext.PlayerCharacter.Add(playerCharacter);
        _dbContext.SaveChanges();
        return playerCharacter.PlayerCharacterId;
    }

    public async Task<PlayerCharacter> UpdatePlayerCharacter(string auth0Id, int playerCharacterId, string CharacterName, int DexterityMod, bool LuckStone, bool AlertFeat, bool IsDeleted, bool IsInPlay)
    {

        var playerCharacter = await ReadPlayerCharacter(auth0Id, playerCharacterId);

        if (playerCharacter == null)
        {
            throw new Exception($"Unable to find player character with Id: {playerCharacterId}");
        }


        if (playerCharacter.IsInPlay != IsInPlay)
        {
            ResetCharactersInPlay(auth0Id);
        }

        playerCharacter.CharacterName = CharacterName;
        playerCharacter.DexterityMod = DexterityMod;
        playerCharacter.AlertFeat = AlertFeat;
        playerCharacter.LuckStone = LuckStone;
        playerCharacter.IsInPlay = IsInPlay;
        playerCharacter.IsDeleted = IsDeleted;

        await _dbContext.SaveChangesAsync();
        return playerCharacter;

    }

    public Task<PlayerCharacter> ReadPlayerCharacter(string auth0Id, int playerCharacterId)
    {
        var user = GetUser(auth0Id);

        return _dbContext.PlayerCharacter.Where(playerCharacter => playerCharacter.PlayerCharacterId == playerCharacterId && playerCharacter.UserId == user.UserId).FirstOrDefaultAsync();
    }

    public async Task DeletePlayerCharacter(string auth0Id, int playerCharacterId)
    {
        var user = GetUser(auth0Id);

        var character = await _dbContext.PlayerCharacter.FirstOrDefaultAsync(pc => pc.PlayerCharacterId == playerCharacterId && pc.UserId == user.UserId);
        if (character == null)
        {
            throw new Exception("Couldn't find character to delete");
        }
        character.IsDeleted = true;
        await _dbContext.SaveChangesAsync();
    }

    private User? GetUser(string auth0Id)
    {
        var user = _dbContext.User.Where(user => user.Auth0Id == auth0Id).FirstOrDefault();
        if (user == null)
        {
            return null;
        }
        return user;
    }

    private async void ResetCharactersInPlay(string auth0Id)
    {
        var user = GetUser(auth0Id);

        var characters = _dbContext.PlayerCharacter.Where(c => c.UserId == user.UserId && c.IsInPlay == true);

        foreach (var character in characters)
        {
            character.IsInPlay = false;
        }

        await _dbContext.SaveChangesAsync();
    }
}