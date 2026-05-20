using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Onesign.Data.Contexts;

namespace Onesign.IntegrationTests.Fixtures;

internal static class DbContextTestHelper
{
    public static void RemoveOnesignDbContext(IServiceCollection services)
    {
        var descriptors = services
            .Where(d =>
                d.ServiceType == typeof(OnesignDbContext) ||
                d.ServiceType == typeof(DbContext) ||
                d.ServiceType == typeof(DbContextOptions<OnesignDbContext>) ||
                (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
            .ToList();

        foreach (var descriptor in descriptors)
        {
            services.Remove(descriptor);
        }
    }
}
