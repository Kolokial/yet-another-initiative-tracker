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

    public void AddUser(string auth0id, string name)
    {
        var user = new User
        {
            Auth0Id = auth0id,
            DisplayName = name
        };

        _dbContext.User.Add(user);
        _dbContext.SaveChanges();  // Commit the transaction
    }

    public async Task<User> GetUser(string auth0Id)
    {
        return await _dbContext.User.FirstOrDefaultAsync(user => user.Auth0Id == auth0Id);
    }
}