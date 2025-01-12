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
            return NotFound();
        }

        var user = await _userService.GetUser(auth0Id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreateUserRequest user)
    {
        var auth0Id = user.Auth0Id;
        var displayName = user.DisplayName;
        var result = await _userService.AddUser(auth0Id, displayName);

        return result ? Ok() : NotFound();
    }

    [HttpPatch]
    public async Task<IActionResult> Patch(UpdateUserRequest user)
    {
        var auth0Id = User.FindFirst("sub")?.Value;
        var result = await _userService.UpdateUser(auth0Id, user.DisplayName);

        return result ? Ok() : NotFound();
    }
}