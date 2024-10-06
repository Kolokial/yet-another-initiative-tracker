using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

public static class ServiceExtensions
{
    public static IServiceCollection AddAppServices(this IServiceCollection services, IConfiguration configuration)
    {

        services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigin", policy =>
            {
                policy.WithOrigins("http://localhost:4200")  // Your frontend URL or allowed origins
                    .WithOrigins("http://localhost:7180")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();  // Optional if using authentication cookies, can be removed for APIs using JWT
            });
        });

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var domain = $"https://{configuration["Auth0:Domain"]}/";
        Console.WriteLine(domain);
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.Authority = domain;
            options.Audience = configuration["Auth0:Audience"];
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                NameClaimType = ClaimTypes.NameIdentifier,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = $"https://{configuration["Auth0:Domain"]}/",
                ValidAudience = configuration["Auth0:Audience"],
                ValidateIssuerSigningKey = true
            };
        });

        // services.AddAuthorization(options =>
        // {
        //     options.AddPolicy("read:messages", policy => policy.Requirements.Add(new
        //     HasScopeRequirement("read:messages", domain)));
        // });

        services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

        return services;
    }

    public static IServiceCollection AddDatabase(this IServiceCollection services, string dbPath)
    {

        return services;
    }

    public static IServiceCollection AddSwaggerBearerAuthorization(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

            // Add JWT Authentication to Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter your token in the text input below.\n\nExample: '12345abcdef'",
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
            });
        });
        return services;
    }


}