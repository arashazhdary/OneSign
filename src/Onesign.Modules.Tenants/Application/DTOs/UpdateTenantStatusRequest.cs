using Onesign.Modules.Tenants.Domain.Enums;

namespace Onesign.Modules.Tenants.Application.DTOs;

public class UpdateTenantStatusRequest
{
    public TenantStatus Status { get; set; }
}

