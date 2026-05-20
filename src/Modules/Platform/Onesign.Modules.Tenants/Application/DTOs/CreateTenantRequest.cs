namespace Onesign.Modules.Tenants.Application.DTOs;

public class CreateTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsSandbox { get; set; }
}

