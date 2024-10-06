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

    [HttpGet]
    [Route("user/characters")]
    public IActionResult GetCharacters()
    {

        var auth0Id = User.FindFirst("sub")?.Value;
        Console.Write(auth0Id);

        if (auth0Id == null)
        {
            return Unauthorized("Missing sub.");
        }

        return Ok(_playerCharacterService.GetAllPlayerCharacters(auth0Id));
    }

    [HttpGet]
    [Route("user/character/{playerCharacterId}")]
    public IActionResult GetCharacter(int playerCharacterId)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        Console.Write(auth0Id);

        if (auth0Id == null)
        {
            return Unauthorized("Missing sub.");
        }

        var playerCharacter = _playerCharacterService.GetPlayerCharacter(auth0Id, playerCharacterId);

        if (playerCharacter == null)
        {
            return NotFound("No Player Character with that Id.");
        }

        return Ok(playerCharacter);
    }

    [HttpPost]
    [Route("user/character")]
    public int PostCharacter([FromBody] PlayerCharacter playerCharacter)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        return _playerCharacterService.AddPlayerCharacter(auth0Id,
        playerCharacter.CharacterName,
        playerCharacter.DexterityMod,
        playerCharacter?.LuckStone,
        playerCharacter.AlertFeat,
        playerCharacter.IsDeleted);

    }
}