using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Applications;

public class UpdateApplicationClientCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_UpdatesApplicationClient()
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
            Name = "Original App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            Name = "Updated App",
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Updated App");
        result.Value.ApplicationType.Should().Be(ApplicationType.Mobile);
        result.Value.GrantType.Should().Be(GrantType.AuthorizationCodeWithPkce);
        result.Value.ClientId.Should().Be(application.ClientId); // ClientId should not change
    }

    [Fact]
    public async Task Handle_NonExistentApplication_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated App",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("APPLICATION_NOT_FOUND");
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

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Updated App",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("APPLICATION_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithExistingRedirectUris_ReturnsUrisInResponse()
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

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            Name = "Updated App",
            ApplicationType = ApplicationType.Mobile,
            GrantType = GrantType.AuthorizationCodeWithPkce
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.RedirectUris.Should().HaveCount(2);
        result.Value.RedirectUris.Select(u => u.Uri).Should()
            .Contain(new[] { "https://example.com/callback1", "https://example.com/callback2" });
    }

    [Fact]
    public async Task Handle_UpdateAllFields_PersistsAllChanges()
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
            Name = "Original App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            Name = "Completely New Name",
            ApplicationType = ApplicationType.SPA,
            GrantType = GrantType.AuthorizationCodeWithPkce
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify persisted changes
        var savedApp = await applicationClientRepository.GetByIdAsync(application.Id, CancellationToken.None);
        savedApp.Should().NotBeNull();
        savedApp!.Name.Should().Be("Completely New Name");
        savedApp.ApplicationType.Should().Be(ApplicationType.SPA);
        savedApp.GrantType.Should().Be(GrantType.AuthorizationCodeWithPkce);
    }

    [Fact]
    public async Task Handle_EmptyName_StillUpdates()
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
            Name = "Original App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new UpdateApplicationClientCommandHandler(applicationClientRepository, context);

        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            Name = "", // Empty name
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().BeEmpty();
    }
}
