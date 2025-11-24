using Bogus;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Applications.Domain.Entities;

namespace Onesign.IntegrationTests.Fixtures;

public static class TestDataGenerator
{
    public static Faker<Tenant> TenantFaker => new Faker<Tenant>()
        .RuleFor(t => t.Id, f => Guid.NewGuid())
        .RuleFor(t => t.Name, f => f.Company.CompanyName())
        .RuleFor(t => t.Slug, f => f.Internet.DomainWord() + "-" + f.Random.AlphaNumeric(4))
        .RuleFor(t => t.Status, f => TenantStatus.Active)
        .RuleFor(t => t.CreatedAt, f => DateTime.UtcNow);

    public static Faker<GlobalUser> UserFaker => new Faker<GlobalUser>()
        .RuleFor(u => u.Id, f => Guid.NewGuid())
        .RuleFor(u => u.Email, f => f.Internet.Email())
        .RuleFor(u => u.EmailVerified, f => true)
        .RuleFor(u => u.PasswordHash, f => BCrypt.Net.BCrypt.HashPassword("TestPassword123!"))
        .RuleFor(u => u.CreatedAt, f => DateTime.UtcNow);

    public static Faker<ApplicationClient> ApplicationFaker => new Faker<ApplicationClient>()
        .RuleFor(a => a.Id, f => Guid.NewGuid())
        .RuleFor(a => a.TenantId, f => Guid.NewGuid())
        .RuleFor(a => a.ClientId, f => Guid.NewGuid().ToString("N"))
        .RuleFor(a => a.Name, f => f.Commerce.ProductName())
        .RuleFor(a => a.ApplicationType, f => Onesign.Modules.Applications.Domain.Enums.ApplicationType.Web)
        .RuleFor(a => a.GrantType, f => Onesign.Modules.Applications.Domain.Enums.GrantType.AuthorizationCode)
        .RuleFor(a => a.CreatedAt, f => DateTime.UtcNow);

    public static Tenant GenerateTenant() => TenantFaker.Generate();

    public static List<Tenant> GenerateTenants(int count) => TenantFaker.Generate(count);

    public static GlobalUser GenerateUser() => UserFaker.Generate();

    public static List<GlobalUser> GenerateUsers(int count) => UserFaker.Generate(count);

    public static ApplicationClient GenerateApplication() => ApplicationFaker.Generate();

    public static List<ApplicationClient> GenerateApplications(int count) => ApplicationFaker.Generate(count);
}
