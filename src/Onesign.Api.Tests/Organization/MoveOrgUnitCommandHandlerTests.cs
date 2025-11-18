using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class MoveOrgUnitCommandHandlerTests
{
    private readonly Mock<IOrgTreeService> _orgTreeService;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<MoveOrgUnitCommandHandler>> _logger;
    private readonly MoveOrgUnitCommandHandler _handler;

    public MoveOrgUnitCommandHandlerTests()
    {
        _orgTreeService = new Mock<IOrgTreeService>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<MoveOrgUnitCommandHandler>>();

        _handler = new MoveOrgUnitCommandHandler(
            _orgTreeService.Object,
            _orgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommandAndAuthorization_MovesOrgUnitSuccessfully()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Move",
            Path = "000",
            Level = 0
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.MoveOrgUnitAsync(command.OrgUnitId, command.NewParentId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _orgTreeService.Verify(x => x.MoveOrgUnitAsync(command.OrgUnitId, command.NewParentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithUnauthorizedToManageOrgUnit_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
        result.Error.Message.Should().Contain("move this organizational unit");
    }

    [Fact]
    public async Task Handle_WithUnauthorizedToManageNewParent_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
        result.Error.Message.Should().Contain("to this parent");
    }

    [Fact]
    public async Task Handle_WithNonExistentOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithTenantMismatch_ReturnsTenantMismatchError()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "To Move"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("TENANT_MISMATCH");
    }

    [Fact]
    public async Task Handle_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Move"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.MoveOrgUnitAsync(command.OrgUnitId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Cannot move to descendant"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_MOVE_FAILED");
    }

    [Fact]
    public async Task Handle_SuccessfulMove_LogsAuditEvent()
    {
        // Arrange
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            NewParentId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Move"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.NewParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.MoveOrgUnitAsync(command.OrgUnitId, command.NewParentId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
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
