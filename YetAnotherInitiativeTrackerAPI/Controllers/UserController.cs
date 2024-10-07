using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace YetAnotherInitiativeTrackerAPI.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly UserService _userService;
    public UserController(ILogger<UserController> logger, UserService userService)
    {
        _logger = logger;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        Console.Write(auth0Id);

        if (auth0Id == null)
        {
            return Unauthorized();
        }

        return Ok(await _userService.GetUser(auth0Id));
    }

    [HttpPost]
    public IActionResult Post()
    {
        return Ok();
    }

    [HttpPatch]
    public IActionResult Patch()
    {
        return Ok();
    }
}