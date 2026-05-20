using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Onesign.Sdk.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOnesignAuthentication(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build();

app.UseOnesignAuthentication();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    message = "Onesign.Sdk.AspNetCore sample — call GET /api/me with Authorization: Bearer <token>",
}));

app.Run();

[Authorize]
[ApiController]
[Route("api/me")]
public class MeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new
        {
            UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            TenantId = User.FindFirst(OnesignClaimTypes.TenantId)?.Value,
            ClientId = User.FindFirst(OnesignClaimTypes.ClientId)?.Value,
        });
}
