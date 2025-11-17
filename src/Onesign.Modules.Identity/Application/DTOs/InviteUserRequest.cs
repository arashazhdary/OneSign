namespace Onesign.Modules.Identity.Application.DTOs;

public class InviteUserRequest
{
    public string Email { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
}

