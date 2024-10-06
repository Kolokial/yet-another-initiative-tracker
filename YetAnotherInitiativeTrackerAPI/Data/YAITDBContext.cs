using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class YAITDBContext : DbContext
{
    public YAITDBContext(DbContextOptions<YAITDBContext> options) : base(options)
    {

    }

    public DbSet<User> User { get; set; }
    public DbSet<PlayerCharacter> PlayerCharacter { get; set; }
}