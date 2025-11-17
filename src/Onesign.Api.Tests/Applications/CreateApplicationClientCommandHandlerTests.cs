using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Applications;

public class CreateApplicationClientCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_CreatesApplicationClient()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var mediator = new Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<Onesign.Modules.Audit.Application.Commands.AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string> { "https://example.com/callback" }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Test Application", result.Value.Name);
        Assert.Equal(ApplicationType.Web, result.Value.ApplicationType);
        Assert.Single(result.Value.RedirectUris);
        Assert.Equal("https://example.com/callback", result.Value.RedirectUris[0].Uri);

        // Verify application was saved
        var savedApp = await applicationClientRepository.GetByIdAsync(result.Value.Id, CancellationToken.None);
        Assert.NotNull(savedApp);
        Assert.Equal("Test Application", savedApp.Name);
    }

    [Fact]
    public async Task Handle_InvalidTenant_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var mediator = new Mock<IMediator>();

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = Guid.NewGuid(), // Non-existent tenant
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("TENANT_NOT_FOUND", result.ErrorCode);
    }
}

