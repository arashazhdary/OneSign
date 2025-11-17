using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.BackgroundServices;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// FluentValidation
builder.Services.AddValidatorsFromAssemblies(new[]
{
    typeof(Onesign.Modules.Tenants.Application.Validators.CreateTenantRequestValidator).Assembly,
    typeof(Onesign.Modules.Identity.Application.Validators.LoginRequestValidator).Assembly,
    typeof(Onesign.Modules.Applications.Application.Validators.CreateApplicationClientRequestValidator).Assembly
});
builder.Services.AddFluentValidationAutoValidation();

// Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=OnesignDb;Trusted_Connection=True;MultipleActiveResultSets=true";

builder.Services.AddDbContext<OnesignDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register DbContext as base type for handlers that need it
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<OnesignDbContext>());

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    Assembly.GetExecutingAssembly(),
    typeof(Onesign.Modules.Tenants.Application.Commands.CreateTenantCommand).Assembly,
    typeof(Onesign.Modules.Identity.Application.Commands.PasswordLoginCommand).Assembly,
    typeof(Onesign.Modules.Applications.Application.Commands.CreateApplicationClientCommand).Assembly,
    typeof(Onesign.Modules.Audit.Application.Commands.AppendAuditEventCommand).Assembly));

// Repositories
builder.Services.AddScoped<ITenantRepository>(sp => 
    new TenantRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<ITenantConfigRepository>(sp => 
    new TenantConfigRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IGlobalUserRepository>(sp => 
    new GlobalUserRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<ITenantUserRepository>(sp => 
    new TenantUserRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IPasswordResetTokenRepository>(sp => 
    new PasswordResetTokenRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IUserLoginSessionRepository>(sp => 
    new UserLoginSessionRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<IExternalLoginRepository>(sp => 
    new ExternalLoginRepository(sp.GetRequiredService<OnesignDbContext>()));
builder.Services.AddScoped<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>(sp => 
    new Onesign.Modules.Identity.Infrastructure.EfCore.Repositories.AuthorizationCodeRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<IApplicationClientRepository>(sp => 
           new ApplicationClientRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<Onesign.Modules.Applications.Domain.Repositories.IClientSecretRepository>(sp => 
           new Onesign.Modules.Applications.Infrastructure.EfCore.Repositories.ClientSecretRepository(sp.GetRequiredService<OnesignDbContext>()));
       builder.Services.AddScoped<IAuditEventRepository>(sp => 
           new AuditEventRepository(sp.GetRequiredService<OnesignDbContext>()));

// JWT Signing Key Provider
builder.Services.AddSingleton<Onesign.Shared.Security.IJwtSigningKeyProvider, Onesign.Shared.Security.ConfigurationJwtSigningKeyProvider>();

// Email Service (optional - only if SMTP is configured)
var smtpHost = builder.Configuration["Email:Smtp:Host"];
if (!string.IsNullOrEmpty(smtpHost))
{
    builder.Services.AddScoped<Onesign.Shared.Email.IEmailService, Onesign.Shared.Email.SmtpEmailService>();
}

// Domain Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService>(sp => 
    new AuthService(
        sp.GetRequiredService<Onesign.Shared.Security.IJwtSigningKeyProvider>(),
        sp.GetRequiredService<Onesign.Modules.Identity.Domain.Repositories.IAuthorizationCodeRepository>()));

// Localization
builder.Services.AddScoped<Onesign.Shared.Localization.ILocalizationService, Onesign.Shared.Localization.LocalizationService>();

// HttpClient for external services
builder.Services.AddHttpClient();

// Background services
builder.Services.AddHostedService<SessionCleanupService>();
builder.Services.AddHostedService<ClientSecretCleanupService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseSession();

// Rate Limiting (must be before other middleware)
app.UseMiddleware<Onesign.Api.Middleware.RateLimitMiddleware>();

// Localization middleware (must be before controllers)
app.UseMiddleware<Onesign.Api.Middleware.LocalizationMiddleware>();

// Global Exception Handler (must be early in pipeline)
app.UseMiddleware<Onesign.Api.Middleware.GlobalExceptionHandlerMiddleware>();

// JWT Authentication Middleware (must be before UseAuthorization)
app.UseMiddleware<Onesign.Api.Middleware.JwtAuthenticationMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
