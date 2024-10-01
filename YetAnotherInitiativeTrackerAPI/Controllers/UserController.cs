using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace YetAnotherInitiativeTrackerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    public UserController(ILogger<UserController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetUser")]
    public void Get(string user)
    {

        using (var connection = new SqliteConnection("Data Source=../../signal-server/src/database/myTestDatabase2.db"))
        {
            connection.Open();

            var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM User";

            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var name = reader.GetString(0);
                    Console.WriteLine($"{name}");
                }
            }
        }
    }
}