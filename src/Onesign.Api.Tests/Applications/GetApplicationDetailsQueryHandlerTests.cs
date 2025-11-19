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

public class GetApplicationDetailsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_ReturnsApplicationDetails()
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

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(application.Id);
        result.Name.Should().Be("Test App");
        result.ClientId.Should().Be(application.ClientId);
        result.ApplicationType.Should().Be(ApplicationType.Web);
        result.GrantType.Should().Be(GrantType.AuthorizationCode);
        result.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public async Task Handle_NonExistentApplication_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_TenantMismatch_ReturnsNull()
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

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = Guid.NewGuid() // Different tenant
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
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

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RedirectUris.Should().HaveCount(2);
        result.RedirectUris.Select(u => u.Uri).Should()
            .Contain(new[] { "https://example.com/callback1", "https://example.com/callback2" });
    }

    [Fact]
    public async Task Handle_NoRedirectUris_ReturnsEmptyList()
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

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RedirectUris.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_AllApplicationTypes_ReturnsCorrectType()
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
        await applicationClientRepository.AddAsync(mobileApp, CancellationToken.None);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = mobileApp.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.ApplicationType.Should().Be(ApplicationType.Mobile);
        result.GrantType.Should().Be(GrantType.AuthorizationCodeWithPkce);
    }

    [Fact]
    public async Task Handle_SpaApplication_ReturnsCorrectDetails()
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
        await applicationClientRepository.AddAsync(spaApp, CancellationToken.None);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = spaApp.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.ApplicationType.Should().Be(ApplicationType.SPA);
    }

    [Fact]
    public async Task Handle_EmptyGuid_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = Guid.Empty,
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_MultipleApplications_ReturnsOnlyRequested()
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

        var app1 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "App 1",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        var app2 = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "App 2",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(app1, CancellationToken.None);
        await applicationClientRepository.AddAsync(app2, CancellationToken.None);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = app2.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(app2.Id);
        result.Name.Should().Be("App 2");
        result.ApplicationType.Should().Be(ApplicationType.Mobile);
    }

    [Fact]
    public async Task Handle_ReturnsCreatedAtTimestamp()
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

        var createdAt = new DateTime(2024, 1, 15, 10, 30, 0, DateTimeKind.Utc);
        var application = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = createdAt
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_ManyRedirectUris_ReturnsAll()
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

        // Add many redirect URIs
        for (int i = 1; i <= 10; i++)
        {
            var uri = new ClientRedirectUriEntity
            {
                Id = Guid.NewGuid(),
                ApplicationClientId = application.Id,
                Uri = $"https://example.com/callback{i}",
                CreatedAt = DateTime.UtcNow
            };
            await context.Set<ClientRedirectUriEntity>().AddAsync(uri);
        }
        await context.SaveChangesAsync();

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RedirectUris.Should().HaveCount(10);
    }

    [Fact]
    public async Task Handle_RedirectUrisHaveCorrectIds()
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

        var expectedId = Guid.NewGuid();
        var uri = new ClientRedirectUriEntity
        {
            Id = expectedId,
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddAsync(uri);
        await context.SaveChangesAsync();

        var handler = new GetApplicationDetailsQueryHandler(applicationClientRepository, context);

        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RedirectUris.Should().HaveCount(1);
        result.RedirectUris[0].Id.Should().Be(expectedId);
    }
}
