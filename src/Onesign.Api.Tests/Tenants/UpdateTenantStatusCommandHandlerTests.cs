using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Audit.Application.Commands;
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
        var mediator = new Moq.Mock<IMediator>();
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
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(TenantStatus.Suspended, result.Value.Status);

        // Verify status was updated in database
        var updatedTenant = await tenantRepository.GetByIdAsync(tenant.Id, CancellationToken.None);
        Assert.NotNull(updatedTenant);
        Assert.Equal(TenantStatus.Suspended, updatedTenant.Status);

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
        var mediator = new Moq.Mock<IMediator>();

        var handler = new UpdateTenantStatusCommandHandler(tenantRepository, mediator.Object);

        var command = new UpdateTenantStatusCommand
        {
            TenantId = Guid.NewGuid(), // Non-existent tenant
            Status = TenantStatus.Suspended
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("TENANT_NOT_FOUND", result.ErrorCode);
    }
}

