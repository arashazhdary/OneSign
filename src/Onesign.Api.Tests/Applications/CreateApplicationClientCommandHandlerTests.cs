using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Application.DTOs;
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

    [Fact]
    public async Task Handle_MultipleRedirectUris_SavesAllUris()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>
            {
                "https://example.com/callback1",
                "https://example.com/callback2",
                "https://example.com/callback3"
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.RedirectUris.Should().HaveCount(3);
        result.Value.RedirectUris.Select(u => u.Uri).Should()
            .Contain(new[] { "https://example.com/callback1", "https://example.com/callback2", "https://example.com/callback3" });
    }

    [Fact]
    public async Task Handle_EmptyRedirectUris_CreatesApplicationWithNoUris()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.RedirectUris.Should().BeEmpty();
    }

    [Theory]
    [InlineData(ApplicationType.Web)]
    [InlineData(ApplicationType.Mobile)]
    [InlineData(ApplicationType.SPA)]
    public async Task Handle_AllApplicationTypes_CreatesCorrectly(ApplicationType applicationType)
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = applicationType,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ApplicationType.Should().Be(applicationType);
    }

    [Theory]
    [InlineData(GrantType.AuthorizationCode)]
    [InlineData(GrantType.AuthorizationCodeWithPkce)]
    public async Task Handle_AllGrantTypes_CreatesCorrectly(GrantType grantType)
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = grantType,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.GrantType.Should().Be(grantType);
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Audit Test App",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
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
    public async Task Handle_GeneratesUniqueClientId()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        // Act - Create two applications
        var result1 = await handler.Handle(new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "App 1",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        }, CancellationToken.None);

        var result2 = await handler.Handle(new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "App 2",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        }, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.ClientId.Should().NotBe(result2.Value!.ClientId);
        result1.Value.ClientId.Should().HaveLength(32); // Guid without dashes
        result2.Value.ClientId.Should().HaveLength(32);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtTimestamp()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var beforeCreate = DateTime.UtcNow;

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        var afterCreate = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        result.Value.CreatedAt.Should().BeOnOrBefore(afterCreate);
    }

    [Fact]
    public async Task Handle_RedirectUrisHaveUniqueIds()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>
            {
                "https://example.com/callback1",
                "https://example.com/callback2"
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var ids = result.Value!.RedirectUris.Select(u => u.Id).ToList();
        ids.Should().OnlyHaveUniqueItems();
        ids.Should().NotContain(Guid.Empty);
    }

    [Fact]
    public async Task Handle_EmptyApplicationName_StillCreates()
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

        var handler = new CreateApplicationClientCommandHandler(applicationClientRepository, context, mediator.Object);

        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = "", // Empty name
            ApplicationType = ApplicationType.Web,
            GrantType = GrantType.AuthorizationCode,
            RedirectUris = new List<string>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().BeEmpty();
    }
}

