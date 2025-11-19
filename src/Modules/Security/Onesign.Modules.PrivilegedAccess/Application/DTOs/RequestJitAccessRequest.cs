namespace Onesign.Modules.PrivilegedAccess.Application.DTOs;

public class RequestJitAccessRequest
{
    public Guid RoleId { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public string Justification { get; set; } = string.Empty;
}
