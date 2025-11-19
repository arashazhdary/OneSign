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

public class AddClientSecretCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_AddsClientSecret()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().NotBe(Guid.Empty);
        result.Value.ApplicationClientId.Should().Be(application.Id);
        result.Value.Secret.Should().NotBeNullOrEmpty(); // Plain secret returned
        result.Value.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddDays(30), TimeSpan.FromMinutes(1));
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
        var clientSecretRepository = new ClientSecretRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ExpiresAt = null
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = Guid.NewGuid(), // Different tenant
            ExpiresAt = null
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_MISMATCH");
    }

    [Fact]
    public async Task Handle_NullExpiresAt_CreatesNonExpiringSecret()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = null // No expiration
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ExpiresAt.Should().BeNull();
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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
            Name = "Secret Audit App",
            ClientId = Guid.NewGuid().ToString("N"),
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            CreatedAt = DateTime.UtcNow
        };
        await applicationClientRepository.AddAsync(application, CancellationToken.None);

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = null
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        mediator.Verify(m => m.Send(
            It.Is<AppendAuditEventCommand>(cmd =>
                cmd.TenantId == tenantId &&
                cmd.Description.Contains("Secret Audit App")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueSecrets()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = null
        };

        // Act
        var result1 = await handler.Handle(command, CancellationToken.None);
        var result2 = await handler.Handle(command, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.Secret.Should().NotBe(result2.Value!.Secret);
        result1.Value.Id.Should().NotBe(result2.Value.Id);
    }

    [Fact]
    public async Task Handle_MultipleSecretsForSameApplication_AllPersisted()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = null
        };

        // Act
        await handler.Handle(command, CancellationToken.None);
        await handler.Handle(command, CancellationToken.None);
        await handler.Handle(command, CancellationToken.None);

        // Assert
        var secrets = await clientSecretRepository.GetByApplicationClientIdAsync(application.Id, CancellationToken.None);
        secrets.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_SecretIsBase64Encoded()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = null
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // Verify the secret is valid Base64
        var action = () => Convert.FromBase64String(result.Value!.Secret!);
        action.Should().NotThrow();
    }

    [Fact]
    public async Task Handle_PastExpirationDate_StillCreatesSecret()
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
        var logger = new Mock<ILogger<AddClientSecretCommandHandler>>();

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

        var handler = new AddClientSecretCommandHandler(
            applicationClientRepository,
            clientSecretRepository,
            mediator.Object,
            logger.Object);

        var pastDate = DateTime.UtcNow.AddDays(-1);
        var command = new AddClientSecretCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId,
            ExpiresAt = pastDate // Already expired
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ExpiresAt.Should().BeCloseTo(pastDate, TimeSpan.FromSeconds(1));
    }
}
