using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class CreateOrgUnitCommandHandlerTests
{
    private readonly Mock<IOrgTreeService> _orgTreeService;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<CreateOrgUnitCommandHandler>> _logger;
    private readonly CreateOrgUnitCommandHandler _handler;

    public CreateOrgUnitCommandHandlerTests()
    {
        _orgTreeService = new Mock<IOrgTreeService>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<CreateOrgUnitCommandHandler>>();

        _handler = new CreateOrgUnitCommandHandler(
            _orgTreeService.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommandAndAuthorization_CreatesOrgUnitSuccessfully()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = Guid.NewGuid(),
            Name = "New Department",
            Code = "DEPT-001",
            SortOrder = 1,
            ActorId = Guid.NewGuid()
        };

        var createdOrgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            ParentId = command.ParentId,
            Name = command.Name,
            Code = command.Code,
            Path = "000/001",
            Level = 1,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.ParentId!.Value, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgTreeService.Setup(x => x.CreateChildAsync(command.TenantId, command.ParentId, command.Name, command.Code, command.SortOrder, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(createdOrgUnit.Id);
        result.Value.Name.Should().Be(command.Name);
        result.Value.Code.Should().Be(command.Code);
    }

    [Fact]
    public async Task Handle_WithRootOrgUnitAndGlobalAdmin_CreatesOrgUnitSuccessfully()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = null, // Root OrgUnit
            Name = "Root Department",
            Code = "ROOT",
            SortOrder = 1,
            ActorId = Guid.NewGuid()
        };

        var scope = new OrgScope { IsGlobalAdmin = true };
        var createdOrgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            ParentId = null,
            Name = command.Name,
            Code = command.Code,
            Path = "000",
            Level = 0,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _orgTreeService.Setup(x => x.CreateChildAsync(command.TenantId, command.ParentId, command.Name, command.Code, command.SortOrder, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.ParentId.Should().BeNull();
        result.Value.Level.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithRootOrgUnitAndNonGlobalAdmin_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = null, // Root OrgUnit
            Name = "Root Department",
            ActorId = Guid.NewGuid()
        };

        var scope = new OrgScope { IsGlobalAdmin = false };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
        result.Error.Message.Should().Contain("global administrators");
    }

    [Fact]
    public async Task Handle_WithParentOrgUnitAndUnauthorized_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = Guid.NewGuid(),
            Name = "Child Department",
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.ParentId!.Value, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task Handle_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = Guid.NewGuid(),
            Name = "Test",
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.ParentId!.Value, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgTreeService.Setup(x => x.CreateChildAsync(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Parent not found"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_CREATE_FAILED");
    }

    [Fact]
    public async Task Handle_SuccessfulCreation_LogsAuditEvent()
    {
        // Arrange
        var command = new CreateOrgUnitCommand
        {
            TenantId = Guid.NewGuid(),
            ParentId = Guid.NewGuid(),
            Name = "Test",
            ActorId = Guid.NewGuid()
        };

        var createdOrgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            ParentId = command.ParentId,
            Name = command.Name,
            Path = "000/001",
            Level = 1,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.ParentId!.Value, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgTreeService.Setup(x => x.CreateChildAsync(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mediator.Verify(x => x.Send(It.Is<AppendAuditEventCommand>(c =>
            c.TenantId == command.TenantId &&
            c.ActorId == command.ActorId), It.IsAny<CancellationToken>()), Times.Once);
    }
}
