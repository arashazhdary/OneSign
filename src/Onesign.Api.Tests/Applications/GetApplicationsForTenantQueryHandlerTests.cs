using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Applications.Application.Queries;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Applications;

public class GetApplicationsForTenantQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsApplicationsForTenant()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var application1 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "App 1",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        var application2 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "App 2",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application1, CancellationToken.None);
        await applicationClientRepository.AddAsync(application2, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Items.Select(a => a.Name).Should().Contain(new[] { "App 1", "App 2" });
    }

    [Fact]
    public async Task Handle_NoApplications_ReturnsEmptyList()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_DifferentTenants_ReturnsOnlyMatchingTenant()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var tenant1 = new Tenant
        {
            Id = tenantId1,
            Name = "Tenant 1",
            Slug = "tenant-1",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var tenant2 = new Tenant
        {
            Id = tenantId2,
            Name = "Tenant 2",
            Slug = "tenant-2",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant1, CancellationToken.None);
        await tenantRepository.AddAsync(tenant2, CancellationToken.None);

        var app1 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId1,
            Name = "Tenant 1 App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        var app2 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId2,
            Name = "Tenant 2 App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(app1, CancellationToken.None);
        await applicationClientRepository.AddAsync(app2, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId1,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Tenant 1 App");
        result.Items[0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task Handle_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        // Create 5 applications
        for (int i = 1; i <= 5; i++)
        {
            var app = new ApplicationClient
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = $"App {i}",
                ClientId = Guid.NewGuid().ToString("N"),
                ApplicationType = ApplicationType.Web,
                GrantType = GrantType.AuthorizationCode,
                CreatedAt = DateTime.UtcNow
            };
            await applicationClientRepository.AddAsync(app, CancellationToken.None);
        }

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 2,
            PageSize = 2
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(2);
        result.PageSize.Should().Be(2);
    }

    [Fact]
    public async Task Handle_LastPage_ReturnsRemainingItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        // Create 5 applications
        for (int i = 1; i <= 5; i++)
        {
            var app = new ApplicationClient
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = $"App {i}",
                ClientId = Guid.NewGuid().ToString("N"),
                ApplicationType = ApplicationType.Web,
                GrantType = GrantType.AuthorizationCode,
                CreatedAt = DateTime.UtcNow
            };
            await applicationClientRepository.AddAsync(app, CancellationToken.None);
        }

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 3,
            PageSize = 2
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1); // Only 1 item on last page
        result.TotalCount.Should().Be(5);
    }

    [Fact]
    public async Task Handle_WithRedirectUris_ReturnsUrisInResponse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var application = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        // Add redirect URIs
        var uri1 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback1",
            CreatedAt = DateTime.UtcNow
        };
        var uri2 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback2",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddRangeAsync(uri1, uri2);
        await context.SaveChangesAsync();

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].RedirectUris.Should().HaveCount(2);
        result.Items[0].RedirectUris.Select(u => u.Uri).Should()
            .Contain(new[] { "https://example.com/callback1", "https://example.com/callback2" });
    }

    [Fact]
    public async Task Handle_ApplicationWithNoRedirectUris_ReturnsEmptyList()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var application = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].RedirectUris.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_PageBeyondTotal_ReturnsEmptyList()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var application = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 100, // Way beyond existing data
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ReturnsCorrectApplicationTypes()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var webApp = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Web App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        var mobileApp = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Mobile App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow
        };
        var spaApp = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "SPA App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.SPA,
            GrantType = GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(webApp, CancellationToken.None);
        await applicationClientRepository.AddAsync(mobileApp, CancellationToken.None);
        await applicationClientRepository.AddAsync(spaApp, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items.Should().Contain(a => a.ApplicationType == ApplicationType.Web);
        result.Items.Should().Contain(a => a.ApplicationType == ApplicationType.Mobile);
        result.Items.Should().Contain(a => a.ApplicationType == ApplicationType.SPA);
    }

    [Fact]
    public async Task Handle_LargePageSize_ReturnsAllItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        // Create 3 applications
        for (int i = 1; i <= 3; i++)
        {
            var app = new ApplicationClient
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = $"App {i}",
                ClientId = Guid.NewGuid().ToString("N"),
                ApplicationType = ApplicationType.Web,
                GrantType = GrantType.AuthorizationCode,
                CreatedAt = DateTime.UtcNow
            };
            await applicationClientRepository.AddAsync(app, CancellationToken.None);
        }

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 1000 // Much larger than total
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
    }

    [Fact]
    public async Task Handle_DefaultPageValues_WorksCorrectly()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var application = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new GetApplicationsForTenantQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId
            // PageNumber and PageSize use defaults
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }
}
