using Microsoft.EntityFrameworkCore;
using SignalRChat.Hubs;

var builder = WebApplication.CreateBuilder(args);

var appsettingsPath = $"{builder.Environment.ContentRootPath}/appsettings.json";

builder.Configuration.AddJsonFile(appsettingsPath);
builder.Services.AddAppServices(builder.Configuration, builder.Environment);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerBearerAuthorization();
builder.Services.AddSingleton<RoomService>();
builder.Services.AddSignalR();
// Set up the connection to the SQLite database using a relative path
var connectionString = "Data Source=./Data/myTestDatabase2.db";
builder.Services.AddDbContext<YAITDBContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PlayerCharacterService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseAppMiddleware();
app.UseRouting();

// Enable CORS
app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UsePathBase("/api");
app.MapHub<ChatHub>("/chathub");
app.Run();
