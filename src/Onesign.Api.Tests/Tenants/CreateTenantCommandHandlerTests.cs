using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class CreateTenantCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_CreatesTenantSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Test Tenant",
            Slug = "test-tenant"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Test Tenant");
        result.Value.Slug.Should().Be("test-tenant");
        result.Value.Status.Should().Be(TenantStatus.Active);
        result.Value.Id.Should().NotBeEmpty();
        result.Value.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        // Verify tenant was saved
        var savedTenant = await tenantRepository.GetByIdAsync(result.Value.Id, CancellationToken.None);
        savedTenant.Should().NotBeNull();
        savedTenant!.Name.Should().Be("Test Tenant");

        // Verify config was created
        var config = await tenantConfigRepository.GetByTenantIdAsync(result.Value.Id, CancellationToken.None);
        config.Should().NotBeNull();
        config!.TenantId.Should().Be(result.Value.Id);

        // Verify audit log was called
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateSlug_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();

        // Create existing tenant with same slug
        var existingTenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Existing Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(existingTenant, CancellationToken.None);

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "New Tenant",
            Slug = "test-tenant" // Duplicate slug
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_SLUG_EXISTS");
        result.ErrorMessage.Should().Be("Tenant with this slug already exists");

        // Verify audit log was NOT called
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithMockedRepository_WorksCorrectly()
    {
        // Arrange
        var mockTenantRepository = new Mock<ITenantRepository>();
        var mockConfigRepository = new Mock<ITenantConfigRepository>();
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();

        mockTenantRepository
            .Setup(r => r.GetBySlugAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        mockTenantRepository
            .Setup(r => r.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant t, CancellationToken ct) => t);

        mockConfigRepository
            .Setup(r => r.AddAsync(It.IsAny<TenantConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantConfig c, CancellationToken ct) => c);

        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(mockTenantRepository.Object, mockConfigRepository.Object, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Test Tenant",
            Slug = "test-tenant"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        mockTenantRepository.Verify(r => r.GetBySlugAsync("test-tenant", It.IsAny<CancellationToken>()), Times.Once);
        mockTenantRepository.Verify(r => r.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()), Times.Once);
        mockConfigRepository.Verify(r => r.AddAsync(It.IsAny<TenantConfig>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_AuditEventContainsCorrectData()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();

        AppendAuditEventCommand? capturedAuditEvent = null;
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .Callback<IRequest<Result<Onesign.Modules.Audit.Application.DTOs.AuditEventDto>>, CancellationToken>((cmd, ct) =>
                capturedAuditEvent = cmd as AppendAuditEventCommand)
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Audit Test Tenant",
            Slug = "audit-test"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedAuditEvent.Should().NotBeNull();
        capturedAuditEvent!.EventType.Should().Be(AuditEventType.TenantCreated);
        capturedAuditEvent.Description.Should().Contain("Audit Test Tenant");
        capturedAuditEvent.Description.Should().Contain("audit-test");
        capturedAuditEvent.TenantId.Should().BeNull(); // Global event
        capturedAuditEvent.Metadata.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_ConfigCreatedWithCorrectDefaults()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Config Test",
            Slug = "config-test"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        var config = await tenantConfigRepository.GetByTenantIdAsync(result.Value!.Id, CancellationToken.None);
        config.Should().NotBeNull();
        config!.Id.Should().NotBeEmpty();
        config.LogoUrl.Should().BeNull();
        config.PrimaryColor.Should().BeNull();
        config.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_TenantCreatedWithActiveStatus()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Status Test",
            Slug = "status-test"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.Status.Should().Be(TenantStatus.Active);
        var savedTenant = await tenantRepository.GetByIdAsync(result.Value.Id, CancellationToken.None);
        savedTenant!.Status.Should().Be(TenantStatus.Active);
    }

    [Fact]
    public async Task Handle_DifferentSlugs_BothCreateSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        // Act
        var result1 = await handler.Handle(new CreateTenantCommand { Name = "Tenant 1", Slug = "tenant-1" }, CancellationToken.None);
        var result2 = await handler.Handle(new CreateTenantCommand { Name = "Tenant 2", Slug = "tenant-2" }, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.Id.Should().NotBe(result2.Value!.Id);
    }

    [Fact]
    public async Task Handle_CancellationRequested_RespectsCancellation()
    {
        // Arrange
        var mockTenantRepository = new Mock<ITenantRepository>();
        var mockConfigRepository = new Mock<ITenantConfigRepository>();
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        var cancellationTokenSource = new CancellationTokenSource();

        mockTenantRepository
            .Setup(r => r.GetBySlugAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(async (string slug, CancellationToken ct) =>
            {
                await Task.Delay(100, ct);
                return (Tenant?)null;
            });

        var handler = new CreateTenantCommandHandler(mockTenantRepository.Object, mockConfigRepository.Object, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Test",
            Slug = "test"
        };

        // Act & Assert
        cancellationTokenSource.Cancel();
        await Assert.ThrowsAsync<TaskCanceledException>(() =>
            handler.Handle(command, cancellationTokenSource.Token));
    }

    [Fact]
    public async Task Handle_SpecialCharactersInName_CreatesSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Acme Corp & Sons (2024) - LLC",
            Slug = "acme-corp"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Acme Corp & Sons (2024) - LLC");
    }

    [Fact]
    public async Task Handle_LogsInformationMessages()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "Log Test",
            Slug = "log-test"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert - Verify logger was called (LogInformation is called twice - once at start, once at end)
        logger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception?>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.AtLeast(2));
    }

    [Fact]
    public async Task Handle_DuplicateSlug_LogsWarning()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var tenantConfigRepository = new TenantConfigRepository(context);
        var mediator = new Mock<IMediator>();
        var logger = new Mock<ILogger<CreateTenantCommandHandler>>();

        // Create existing tenant
        var existingTenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Existing",
            Slug = "duplicate",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(existingTenant, CancellationToken.None);

        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "New",
            Slug = "duplicate"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert - Verify warning was logged
        logger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception?>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.Once);
    }
}
