using Onesign.Modules.Identity.Domain.Enums;

namespace Onesign.Modules.Identity.Application.DTOs;

public class TenantUserDto
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public TenantUserStatus Status { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime? FirstLoginAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

