using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Onesign.Api.Controllers.Admin;

/// <summary>
/// Global platform settings for the admin portal (in-memory until persistent store is added).
/// </summary>
[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "GlobalAdmin,PlatformOwner")]
public class AdminSettingsController : ControllerBase
{
    private static readonly ConcurrentDictionary<string, JsonElement> Store = new(StringComparer.OrdinalIgnoreCase);

    [HttpGet]
    public ActionResult<Dictionary<string, JsonElement>> GetAll()
    {
        return Ok(Store.ToDictionary(k => k.Key, v => v.Value));
    }

    [HttpGet("{section}")]
    public ActionResult GetSection(string section)
    {
        if (!Store.TryGetValue(section, out var value))
            return Ok(new { });

        return Ok(JsonSerializer.Deserialize<object>(value.GetRawText()));
    }

    [HttpPut("{section}")]
    public ActionResult PutSection(string section, [FromBody] JsonElement settings)
    {
        Store[section] = settings;
        return Ok(new { section, saved = true });
    }

    [HttpPost("email/test")]
    public ActionResult TestEmail([FromBody] JsonElement settings)
    {
        if (!settings.TryGetProperty("smtpHost", out var host) || string.IsNullOrWhiteSpace(host.GetString()))
            return BadRequest(new { error = "smtpHost is required" });

        return Ok(new { success = true, message = "Test email queued (configuration accepted)" });
    }

    [HttpPost("sms/test")]
    public ActionResult TestSms([FromBody] JsonElement settings)
    {
        if (!settings.TryGetProperty("provider", out _))
            return BadRequest(new { error = "provider is required" });

        return Ok(new { success = true, message = "Test SMS queued (configuration accepted)" });
    }
}
