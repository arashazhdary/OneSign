using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Onesign.Data.Contexts;
using Onesign.Shared.Sms;
using Testcontainers.MsSql;

namespace Onesign.IntegrationTests.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _msSqlContainer = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .WithPassword("YourStrong@Passw0rd!")
        .Build();

    public string ConnectionString => _msSqlContainer.GetConnectionString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            DbContextTestHelper.RemoveOnesignDbContext(services);
            services.AddDbContext<OnesignDbContext>(options =>
                options.UseSqlServer(_msSqlContainer.GetConnectionString(),
                    b => b.MigrationsAssembly("Onesign.Api")));
        });

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Sms:Provider"] = SmsProviders.Logging,
                ["ConnectionStrings:DefaultConnection"] = _msSqlContainer.GetConnectionString(),
            });
        });

        builder.UseEnvironment("Development");
    }

    public async Task InitializeAsync()
    {
        await _msSqlContainer.StartAsync();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();
        await db.Database.MigrateAsync();
    }

    public new async Task DisposeAsync()
    {
        await _msSqlContainer.DisposeAsync();
        await base.DisposeAsync();
    }
}

public class InMemoryWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // DbContext is configured for InMemory in Program when Environment is Testing

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Sms:Provider"] = SmsProviders.Logging,
            });
        });

        builder.UseEnvironment("Testing");
    }

}
