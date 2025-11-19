using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Applications;

public class RemoveClientSecretCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_RemovesClientSecret()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new AuditEventDto()));

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

        var secret = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            SecretHash = "hashedSecret",
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };
        await clientSecretRepository.AddAsync(secret, CancellationToken.None);

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = secret.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify secret was deleted
        var deletedSecret = await clientSecretRepository.GetByIdAsync(secret.Id, CancellationToken.None);
        deletedSecret.Should().BeNull();
    }

    [Fact]
    public async Task Handle_NonExistentSecret_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SECRET_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_ApplicationNotFound_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        // Create a secret without an application (orphan secret)
        var secret = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = Guid.NewGuid(), // Non-existent application
            SecretHash = "hashedSecret",
            ExpiresAt = null,
            CreatedAt = DateTime.UtcNow
        };
        await clientSecretRepository.AddAsync(secret, CancellationToken.None);

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = secret.Id,
            TenantId = Guid.NewGuid()
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
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

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

        var secret = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            SecretHash = "hashedSecret",
            ExpiresAt = null,
            CreatedAt = DateTime.UtcNow
        };
        await clientSecretRepository.AddAsync(secret, CancellationToken.None);

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = secret.Id,
            TenantId = Guid.NewGuid() // Different tenant
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_MISMATCH");
    }

    [Fact]
    public async Task Handle_ValidRequest_SendsAuditEvent()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new AuditEventDto()));

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
            Name = "Audit Test App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var secret = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            SecretHash = "hashedSecret",
            ExpiresAt = null,
            CreatedAt = DateTime.UtcNow
        };
        await clientSecretRepository.AddAsync(secret, CancellationToken.None);

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = secret.Id,
            TenantId = tenantId
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        mediator.Verify(m => m.Send(
            It.Is<AppendAuditEventCommand>(cmd =>
                cmd.TenantId == tenantId &&
                cmd.Description.Contains("Audit Test App")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleSecrets_DeletesOnlySpecified()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new AuditEventDto()));

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

        var secret1 = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            SecretHash = "hash1",
            ExpiresAt = null,
            CreatedAt = DateTime.UtcNow
        };
        var secret2 = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = application.Id,
            SecretHash = "hash2",
            ExpiresAt = null,
            CreatedAt = DateTime.UtcNow
        };
        await clientSecretRepository.AddAsync(secret1, CancellationToken.None);
        await clientSecretRepository.AddAsync(secret2, CancellationToken.None);

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = secret1.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only secret1 was deleted
        var deletedSecret = await clientSecretRepository.GetByIdAsync(secret1.Id, CancellationToken.None);
        deletedSecret.Should().BeNull();

        var remainingSecret = await clientSecretRepository.GetByIdAsync(secret2.Id, CancellationToken.None);
        remainingSecret.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_EmptyGuid_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<RemoveClientSecretCommandHandler>>();

        var handler = new RemoveClientSecretCommandHandler(
            clientSecretRepository,
            applicationClientRepository,
            mediator.Object,
            logger.Object);

        var command = new RemoveClientSecretCommand
        {
            SecretId = Guid.Empty,
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SECRET_NOT_FOUND");
    }
}
