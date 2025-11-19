using Onesign.Modules.Tenants.Domain.Enums;

namespace Onesign.Modules.Tenants.Application.DTOs;

public class TenantSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TenantStatus Status { get; set; }
}

