using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace YetAnotherInitiativeTrackerAPI.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class PlayerCharacterController : ControllerBase
{
    private readonly ILogger<PlayerCharacterController> _logger;
    private readonly PlayerCharacterService _playerCharacterService;
    public PlayerCharacterController(ILogger<PlayerCharacterController> logger, PlayerCharacterService playerCharacterService)
    {
        _logger = logger;
        _playerCharacterService = playerCharacterService;
    }


    [HttpPost]
    [Route("user/character")]
    public CreateCharacterResponse CreateCharacter([FromBody] PlayerCharacter playerCharacter)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        var id = _playerCharacterService.CreatePlayerCharacter(auth0Id,
        playerCharacter.CharacterName,
        playerCharacter.DexterityMod,
        playerCharacter.LuckStone,
        playerCharacter.AlertFeat,
        playerCharacter.IsDeleted,
        playerCharacter.IsInPlay);

        return new CreateCharacterResponse
        {
            PlayerCharacterId = id
        };
    }

    [HttpGet]
    [Route("user/characters")]
    public IActionResult ReadCharacters()
    {

        var auth0Id = User.FindFirst("sub")?.Value;
        Console.Write(auth0Id);

        if (auth0Id == null)
        {
            return Unauthorized("Missing sub.");
        }

        return Ok(_playerCharacterService.ReadAllPlayerCharacters(auth0Id));
    }

    [HttpGet]
    [Route("user/character/{playerCharacterId}")]
    public IActionResult ReadCharacter(int playerCharacterId)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        Console.Write(auth0Id);

        if (auth0Id == null)
        {
            return Unauthorized("Missing sub.");
        }

        var playerCharacter = _playerCharacterService.ReadPlayerCharacter(auth0Id, playerCharacterId);

        if (playerCharacter == null)
        {
            return NotFound("No Player Character with that Id.");
        }

        return Ok(playerCharacter);
    }

    [HttpPatch]
    [Route("user/character/{playerCharacterId}")]
    public Task<PlayerCharacter> UpdateCharacter([FromBody] PlayerCharacter playerCharacter, int playerCharacterId)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        return _playerCharacterService.UpdatePlayerCharacter(auth0Id,
            playerCharacter.PlayerCharacterId,
            playerCharacter.CharacterName,
            playerCharacter.DexterityMod,
            playerCharacter.LuckStone,
            playerCharacter.AlertFeat,
            playerCharacter.IsDeleted,
            playerCharacter.IsInPlay);
    }

    [HttpDelete]
    [Route("user/character/{playerCharacterId}")]
    public void DeleteCharacter(int playerCharacterId)
    {

    }
}