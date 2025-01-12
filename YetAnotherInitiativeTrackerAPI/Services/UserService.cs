using Microsoft.EntityFrameworkCore;

public class UserService
{
    private readonly YAITDBContext _dbContext;

    public UserService(YAITDBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public List<User> GetAllUsers()
    {
        return _dbContext.User.ToList();
    }

    public async Task<bool> AddUser(string auth0Id, string name)
    {
        var checkIfUserExists = await GetUser(auth0Id);
        if (checkIfUserExists != null)
        {
            return false;
        }

        var user = new User
        {
            Auth0Id = auth0Id,
            DisplayName = name
        };

        await _dbContext.User.AddAsync(user);
        await _dbContext.SaveChangesAsync();  // Commit the transaction
        return true;
    }

    public async Task<bool> UpdateUser(string auth0Id, string displayName)
    {
        var user = await GetUser(auth0Id);
        if (user != null)
        {
            user.DisplayName = displayName;
            await _dbContext.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<User> GetUser(string auth0Id)
    {
        return await _dbContext.User.SingleOrDefaultAsync(user => user.Auth0Id == auth0Id);
    }
}