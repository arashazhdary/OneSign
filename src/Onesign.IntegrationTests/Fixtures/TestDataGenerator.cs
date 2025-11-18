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

    public static Faker<User> UserFaker => new Faker<User>()
        .RuleFor(u => u.Id, f => Guid.NewGuid())
        .RuleFor(u => u.Email, f => f.Internet.Email())
        .RuleFor(u => u.FirstName, f => f.Name.FirstName())
        .RuleFor(u => u.LastName, f => f.Name.LastName())
        .RuleFor(u => u.IsEmailVerified, f => true)
        .RuleFor(u => u.PasswordHash, f => BCrypt.Net.BCrypt.HashPassword("TestPassword123!"))
        .RuleFor(u => u.CreatedAt, f => DateTime.UtcNow);

    public static Faker<ApplicationClient> ApplicationFaker => new Faker<ApplicationClient>()
        .RuleFor(a => a.Id, f => Guid.NewGuid())
        .RuleFor(a => a.Name, f => f.Commerce.ProductName())
        .RuleFor(a => a.ClientId, f => Guid.NewGuid().ToString("N"))
        .RuleFor(a => a.ClientSecret, f => Guid.NewGuid().ToString("N"))
        .RuleFor(a => a.ApplicationType, f => "web")
        .RuleFor(a => a.IsActive, f => true)
        .RuleFor(a => a.CreatedAt, f => DateTime.UtcNow);

    public static Tenant GenerateTenant() => TenantFaker.Generate();

    public static List<Tenant> GenerateTenants(int count) => TenantFaker.Generate(count);

    public static User GenerateUser() => UserFaker.Generate();

    public static List<User> GenerateUsers(int count) => UserFaker.Generate(count);

    public static ApplicationClient GenerateApplication() => ApplicationFaker.Generate();

    public static List<ApplicationClient> GenerateApplications(int count) => ApplicationFaker.Generate(count);
}
