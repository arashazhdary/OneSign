using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

public class DeleteApplicationClientCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_DeletesApplicationClient()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var mediator = new Mock<IMediator>();
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

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();

        // Verify application was deleted
        var deletedApp = await applicationClientRepository.GetByIdAsync(application.Id, CancellationToken.None);
        deletedApp.Should().BeNull();
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
        var mediator = new Mock<IMediator>();

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = Guid.NewGuid(),
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

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = application.Id,
            TenantId = Guid.NewGuid() // Different tenant
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("APPLICATION_NOT_FOUND");
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
        var mediator = new Mock<IMediator>();
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

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = application.Id,
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
    public async Task Handle_MultipleApplications_DeletesOnlySpecified()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var mediator = new Mock<IMediator>();
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

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = application1.Id,
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only app1 was deleted
        var deletedApp = await applicationClientRepository.GetByIdAsync(application1.Id, CancellationToken.None);
        deletedApp.Should().BeNull();

        var remainingApp = await applicationClientRepository.GetByIdAsync(application2.Id, CancellationToken.None);
        remainingApp.Should().NotBeNull();
        remainingApp!.Name.Should().Be("App 2");
    }

    [Fact]
    public async Task Handle_WithEmptyGuid_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var mediator = new Mock<IMediator>();

        var handler = new DeleteApplicationClientCommandHandler(applicationClientRepository, mediator.Object);

        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = Guid.Empty,
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("APPLICATION_NOT_FOUND");
    }
}
