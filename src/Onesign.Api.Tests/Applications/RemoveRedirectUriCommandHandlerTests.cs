using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Applications;

public class RemoveRedirectUriCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_RemovesRedirectUri()
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

        var redirectUri = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddAsync(redirectUri);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();

        // Verify redirect URI was deleted
        var deletedUri = await context.Set<ClientRedirectUriEntity>()
            .FirstOrDefaultAsync(x => x.Id == redirectUri.Id);
        deletedUri.Should().BeNull();
    }

    [Fact]
    public async Task Handle_NonExistentRedirectUri_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("REDIRECT_URI_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_ApplicationNotFound_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);

        // Create redirect URI without an application
        var redirectUri = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = Guid.NewGuid(), // Non-existent application
            Uri = "https://example.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddAsync(redirectUri);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri.Id,
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("REDIRECT_URI_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_TenantMismatch_ReturnsFailure()
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

        var redirectUri = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddAsync(redirectUri);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri.Id,
            TenantId = Guid.NewGuid() // Different tenant
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("REDIRECT_URI_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_MultipleRedirectUris_DeletesOnlySpecified()
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

        var redirectUri1 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback1",
            CreatedAt = DateTime.UtcNow
        };
        var redirectUri2 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            Uri = "https://example.com/callback2",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddRangeAsync(redirectUri1, redirectUri2);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri1.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only redirectUri1 was deleted
        var deletedUri = await context.Set<ClientRedirectUriEntity>()
            .FirstOrDefaultAsync(x => x.Id == redirectUri1.Id);
        deletedUri.Should().BeNull();

        var remainingUri = await context.Set<ClientRedirectUriEntity>()
            .FirstOrDefaultAsync(x => x.Id == redirectUri2.Id);
        remainingUri.Should().NotBeNull();
        remainingUri!.Uri.Should().Be("https://example.com/callback2");
    }

    [Fact]
    public async Task Handle_EmptyGuid_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = Guid.Empty,
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("REDIRECT_URI_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_DifferentApplications_DoesNotAffectOther()
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

        var redirectUri1 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application1.Id,
            Uri = "https://app1.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        var redirectUri2 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application2.Id,
            Uri = "https://app2.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddRangeAsync(redirectUri1, redirectUri2);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri1.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify app2's redirect URI is untouched
        var app2Uri = await context.Set<ClientRedirectUriEntity>()
            .FirstOrDefaultAsync(x => x.ApplicationClientId == application2.Id);
        app2Uri.Should().NotBeNull();
        app2Uri!.Uri.Should().Be("https://app2.com/callback");
    }

    [Fact]
    public async Task Handle_SameUriDifferentApplications_DeletesCorrectOne()
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

        // Same URI for both applications
        var redirectUri1 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application1.Id,
            Uri = "https://same.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        var redirectUri2 = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application2.Id,
            Uri = "https://same.com/callback",
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<ClientRedirectUriEntity>().AddRangeAsync(redirectUri1, redirectUri2);
        await context.SaveChangesAsync();

        var handler = new RemoveRedirectUriCommandHandler(context);

        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUri1.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only app1's URI was deleted
        var allUris = await context.Set<ClientRedirectUriEntity>().ToListAsync();
        allUris.Should().HaveCount(1);
        allUris[0].ApplicationClientId.Should().Be(application2.Id);
    }
}
