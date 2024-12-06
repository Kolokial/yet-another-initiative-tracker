using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var appsettingsPath = $"{builder.Environment.ContentRootPath}/appsettings.json";
Console.WriteLine(appsettingsPath);
builder.Configuration.AddJsonFile(appsettingsPath);
builder.Services.AddAppServices(builder.Configuration);
Console.WriteLine(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerBearerAuthorization();
// Set up the connection to the SQLite database using a relative path
var connectionString = "Data Source=./Data/myTestDatabase2.db";
builder.Services.AddDbContext<YAITDBContext>(options =>
    options.UseSqlite(connectionString));

// var domain = $"https://{builder.Configuration["Auth0:Domain"]}/";
// Console.WriteLine(domain);
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.Authority = domain;
//     options.Audience = builder.Configuration["Auth0:Audience"];
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         NameClaimType = ClaimTypes.NameIdentifier,
//         ValidateIssuer = true,
//         ValidateAudience = true,
//         ValidateLifetime = true,
//         ValidIssuer = $"https://{builder.Configuration["Auth0:Domain"]}/",
//         ValidAudience = builder.Configuration["Auth0:Audience"],
//         ValidateIssuerSigningKey = true
//     };
// });

// builder.Services.AddAuthorization(options =>
// {
//     // options.AddPolicy("read:messages", policy => policy.Requirements.Add(new
//     // HasScopeRequirement("read:messages", domain)));
// });

// builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();


builder.Services.AddControllers();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PlayerCharacterService>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

//     // Add JWT Authentication to Swagger
//     c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//     {
//         Name = "Authorization",
//         Type = SecuritySchemeType.Http,
//         Scheme = "Bearer",
//         BearerFormat = "JWT",
//         In = ParameterLocation.Header,
//         Description = "Enter your token in the text input below.\n\nExample: '12345abcdef'",
//     });

//     c.AddSecurityRequirement(new OpenApiSecurityRequirement
//     {
//         {
//             new OpenApiSecurityScheme
//             {
//                 Reference = new OpenApiReference
//                 {
//                     Type = ReferenceType.SecurityScheme,
//                     Id = "Bearer"
//                 }
//             },
//             new string[] {}
//         }
//     });
// });



var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseAppMiddleware();
// if (app.Environment.IsDevelopment())
// {
//     Console.WriteLine("is dev mode");
//     app.UseSwagger();
//     app.UseSwaggerUI(c =>
//     {
//         c.SwaggerEndpoint("/swagger/v1/swagger.json", "YAIT v1");
//     });
// }

app.UseRouting();


// Enable CORS
app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UsePathBase("/api");
app.Run();
