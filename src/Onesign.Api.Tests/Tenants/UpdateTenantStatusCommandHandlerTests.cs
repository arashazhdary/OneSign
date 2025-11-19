using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
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

public class UpdateTenantStatusCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_UpdatesTenantStatus()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        // Create a tenant
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant.Id,
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Status.Should().Be(TenantStatus.Suspended);
        result.Value.Id.Should().Be(tenant.Id);
        result.Value.Name.Should().Be("Test Tenant");
        result.Value.Slug.Should().Be("test-tenant");

        // Verify status was updated in database
        var updatedTenant = await tenantRepository.GetByIdAsync(tenant.Id, CancellationToken.None);
        updatedTenant.Should().NotBeNull();
        updatedTenant!.Status.Should().Be(TenantStatus.Suspended);

        // Verify audit log was called
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_TenantNotFound_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = Guid.NewGuid(), // Non-existent tenant
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_NOT_FOUND");
        result.ErrorMessage.Should().Be("Tenant not found");

        // Verify audit log was NOT called
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData(TenantStatus.Active, TenantStatus.Suspended)]
    [InlineData(TenantStatus.Active, TenantStatus.Inactive)]
    [InlineData(TenantStatus.Suspended, TenantStatus.Active)]
    [InlineData(TenantStatus.Suspended, TenantStatus.Inactive)]
    [InlineData(TenantStatus.Inactive, TenantStatus.Active)]
    [InlineData(TenantStatus.Inactive, TenantStatus.Suspended)]
    public async Task Handle_AllStatusTransitions_WorkCorrectly(TenantStatus fromStatus, TenantStatus toStatus)
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = fromStatus,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant.Id,
            Status = toStatus
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(toStatus);
    }

    [Fact]
    public async Task Handle_SameStatus_UpdatesSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant.Id,
            Status = TenantStatus.Active // Same status
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(TenantStatus.Active);
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
        var mediator = new Mock<IMediator>();

        AppendAuditEventCommand? capturedAuditEvent = null;
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .Callback<IRequest<Result<Onesign.Modules.Audit.Application.DTOs.AuditEventDto>>, CancellationToken>((cmd, ct) =>
                capturedAuditEvent = cmd as AppendAuditEventCommand)
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Audit Test Tenant",
            Slug = "audit-test",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant.Id,
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedAuditEvent.Should().NotBeNull();
        capturedAuditEvent!.EventType.Should().Be(AuditEventType.TenantStatusChanged);
        capturedAuditEvent.Description.Should().Contain("Audit Test Tenant");
        capturedAuditEvent.Description.Should().Contain("Active");
        capturedAuditEvent.Description.Should().Contain("Suspended");
        capturedAuditEvent.TenantId.Should().Be(tenant.Id);
        capturedAuditEvent.Metadata.Should().NotBeNullOrEmpty();
        capturedAuditEvent.Metadata.Should().Contain("Active");
        capturedAuditEvent.Metadata.Should().Contain("Suspended");
    }

    [Fact]
    public async Task Handle_WithMockedRepository_WorksCorrectly()
    {
        // Arrange
        var mockRepository = new Mock<ITenantRepository>();
        var mediator = new Mock<IMediator>();
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        mockRepository
            .Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var handler = new UpdateTenantStatusCommandHandler(mockRepository.Object, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenantId,
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        mockRepository.Verify(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
        mockRepository.Verify(r => r.UpdateAsync(It.Is<Tenant>(t =>
            t.Status == TenantStatus.Suspended), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsTenantDtoWithAllProperties()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var createdAt = DateTime.UtcNow.AddDays(-10);
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Full Dto Test",
            Slug = "full-dto-test",
            Status = TenantStatus.Active,
            CreatedAt = createdAt,
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant.Id,
            Status = TenantStatus.Inactive
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.Id.Should().Be(tenant.Id);
        result.Value.Name.Should().Be("Full Dto Test");
        result.Value.Slug.Should().Be("full-dto-test");
        result.Value.Status.Should().Be(TenantStatus.Inactive);
        result.Value.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_CancellationRequested_RespectsCancellation()
    {
        // Arrange
        var mockRepository = new Mock<ITenantRepository>();
        var mediator = new Mock<IMediator>();
        var tenantId = Guid.NewGuid();
        var cancellationTokenSource = new CancellationTokenSource();

        mockRepository
            .Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .Returns(async (Guid id, CancellationToken ct) =>
            {
                await Task.Delay(100, ct);
                return new Tenant { Id = id };
            });

        var handler = new UpdateTenantStatusCommandHandler(mockRepository.Object, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenantId,
            Status = TenantStatus.Suspended
        };

        // Act & Assert
        cancellationTokenSource.Cancel();
        await Assert.ThrowsAsync<TaskCanceledException>(() =>
            handler.Handle(command, cancellationTokenSource.Token));
    }

    [Fact]
    public async Task Handle_MultipleTenants_UpdatesCorrectOne()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenant1 = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Tenant 1",
            Slug = "tenant-1",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var tenant2 = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Tenant 2",
            Slug = "tenant-2",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await tenantRepository.AddAsync(tenant1, CancellationToken.None);
        await tenantRepository.AddAsync(tenant2, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenant1.Id,
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only tenant1 was updated
        var updatedTenant1 = await tenantRepository.GetByIdAsync(tenant1.Id, CancellationToken.None);
        var unchangedTenant2 = await tenantRepository.GetByIdAsync(tenant2.Id, CancellationToken.None);

        updatedTenant1!.Status.Should().Be(TenantStatus.Suspended);
        unchangedTenant2!.Status.Should().Be(TenantStatus.Active);
    }

    [Fact]
    public async Task Handle_EmptyGuid_ReturnsNotFound()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = Guid.Empty,
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_SequentialStatusChanges_AllSucceed()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Sequential Test",
            Slug = "sequential-test",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        // Act - Change status multiple times
        var result1 = await handler.Handle(new UpdateTenantStatusCommand { TenantId = tenant.Id, Status = TenantStatus.Suspended }, CancellationToken.None);
        var result2 = await handler.Handle(new UpdateTenantStatusCommand { TenantId = tenant.Id, Status = TenantStatus.Inactive }, CancellationToken.None);
        var result3 = await handler.Handle(new UpdateTenantStatusCommand { TenantId = tenant.Id, Status = TenantStatus.Active }, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result1.Value!.Status.Should().Be(TenantStatus.Suspended);

        result2.IsSuccess.Should().BeTrue();
        result2.Value!.Status.Should().Be(TenantStatus.Inactive);

        result3.IsSuccess.Should().BeTrue();
        result3.Value!.Status.Should().Be(TenantStatus.Active);

        // Verify audit log was called for each change
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
    }
}
