namespace Onesign.Sdk.DotNet.Models;

public class UserProfile
{
    public string? Id { get; set; }
    public string? Email { get; set; }
    public bool EmailVerified { get; set; }
    public string? Name { get; set; }
    public string? GivenName { get; set; }
    public string? FamilyName { get; set; }
    public string? PreferredUsername { get; set; }
    public string? PhoneNumber { get; set; }
    public bool PhoneNumberVerified { get; set; }
    public string? Picture { get; set; }
    public string? Locale { get; set; }
    public string? TenantId { get; set; }
    public string? TenantName { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<string> Groups { get; set; } = new();
    public string? OrganizationUnit { get; set; }
    public string? Department { get; set; }
    public string? Title { get; set; }
    public string? EmployeeId { get; set; }
    public string? Manager { get; set; }
    public Dictionary<string, string> CustomClaims { get; set; } = new();
}
