using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Application.DTOs;
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
               var mediator = new Moq.Mock<IMediator>();
               var logger = new Moq.Mock<Microsoft.Extensions.Logging.ILogger<Onesign.Modules.Tenants.Application.Commands.CreateTenantCommandHandler>>();
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
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Test Tenant", result.Value.Name);
        Assert.Equal("test-tenant", result.Value.Slug);
        Assert.Equal(TenantStatus.Active, result.Value.Status);

        // Verify tenant was saved
        var savedTenant = await tenantRepository.GetByIdAsync(result.Value.Id, CancellationToken.None);
        Assert.NotNull(savedTenant);
        Assert.Equal("Test Tenant", savedTenant.Name);

        // Verify config was created
        var config = await tenantConfigRepository.GetByTenantIdAsync(result.Value.Id, CancellationToken.None);
        Assert.NotNull(config);

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
        var mediator = new Moq.Mock<IMediator>();

        // Create existing tenant with same slug
        var existingTenant = new Onesign.Modules.Tenants.Domain.Entities.Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Existing Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(existingTenant, CancellationToken.None);

        var logger = new Moq.Mock<Microsoft.Extensions.Logging.ILogger<Onesign.Modules.Tenants.Application.Commands.CreateTenantCommandHandler>>();
        var handler = new CreateTenantCommandHandler(tenantRepository, tenantConfigRepository, mediator.Object, logger.Object);

        var command = new CreateTenantCommand
        {
            Name = "New Tenant",
            Slug = "test-tenant" // Duplicate slug
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("TENANT_SLUG_EXISTS", result.ErrorCode);
        Assert.NotNull(result.ErrorMessage);
    }
}

