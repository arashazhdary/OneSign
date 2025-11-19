namespace Onesign.Modules.Identity.Application.DTOs;

public class GlobalUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}

