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

public class DeleteOrgUnitCommandHandlerTests
{
    private readonly Mock<IOrgTreeService> _orgTreeService;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IUserOrgUnitRepository> _userOrgUnitRepository;
    private readonly Mock<IApplicationOrgUnitRepository> _applicationOrgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<DeleteOrgUnitCommandHandler>> _logger;
    private readonly DeleteOrgUnitCommandHandler _handler;

    public DeleteOrgUnitCommandHandlerTests()
    {
        _orgTreeService = new Mock<IOrgTreeService>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _userOrgUnitRepository = new Mock<IUserOrgUnitRepository>();
        _applicationOrgUnitRepository = new Mock<IApplicationOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<DeleteOrgUnitCommandHandler>>();

        _handler = new DeleteOrgUnitCommandHandler(
            _orgTreeService.Object,
            _orgUnitRepository.Object,
            _userOrgUnitRepository.Object,
            _applicationOrgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommandAndAuthorization_DeletesOrgUnitSuccessfully()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Delete",
            Status = OrgUnitStatus.Active
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _userOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());
        _applicationOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationOrgUnit>());
        _orgTreeService.Setup(x => x.DeleteOrgUnitAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _orgTreeService.Verify(x => x.DeleteOrgUnitAsync(command.OrgUnitId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithUnauthorizedUser_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task Handle_WithNonExistentOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
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
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "To Delete"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
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
    public async Task Handle_WithAssignedUsers_ReturnsHasUsersError()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Delete"
        };

        var userOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = Guid.NewGuid(), OrgUnitId = command.OrgUnitId, IsPrimary = true }
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _userOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userOrgUnits);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_HAS_USERS");
    }

    [Fact]
    public async Task Handle_WithAssignedApplications_ReturnsHasApplicationsError()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Delete"
        };

        var applicationOrgUnits = new List<ApplicationOrgUnit>
        {
            new ApplicationOrgUnit { ApplicationClientId = Guid.NewGuid(), OrgUnitId = command.OrgUnitId }
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _userOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());
        _applicationOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applicationOrgUnits);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_HAS_APPLICATIONS");
    }

    [Fact]
    public async Task Handle_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Delete"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _userOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());
        _applicationOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationOrgUnit>());
        _orgTreeService.Setup(x => x.DeleteOrgUnitAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Cannot delete OrgUnit with children"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_DELETE_FAILED");
    }

    [Fact]
    public async Task Handle_SuccessfulDeletion_LogsAuditEvent()
    {
        // Arrange
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "To Delete"
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _userOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());
        _applicationOrgUnitRepository.Setup(x => x.GetByOrgUnitIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationOrgUnit>());
        _orgTreeService.Setup(x => x.DeleteOrgUnitAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
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
