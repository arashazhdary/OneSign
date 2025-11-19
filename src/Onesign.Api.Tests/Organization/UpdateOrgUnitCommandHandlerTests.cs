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

public class UpdateOrgUnitCommandHandlerTests
{
    private readonly Mock<IOrgTreeService> _orgTreeService;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<UpdateOrgUnitCommandHandler>> _logger;
    private readonly UpdateOrgUnitCommandHandler _handler;

    public UpdateOrgUnitCommandHandlerTests()
    {
        _orgTreeService = new Mock<IOrgTreeService>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<UpdateOrgUnitCommandHandler>>();

        _handler = new UpdateOrgUnitCommandHandler(
            _orgTreeService.Object,
            _orgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommandAndAuthorization_UpdatesOrgUnitSuccessfully()
    {
        // Arrange
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
            SortOrder = 5,
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Old Name",
            Code = "OLD",
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            Path = "000",
            Level = 0
        };

        var updatedOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = command.Name,
            Code = "OLD",
            SortOrder = 5,
            Status = OrgUnitStatus.Active,
            Path = "000",
            Level = 0,
            UpdatedAt = DateTime.UtcNow
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.UpdateOrgUnitAsync(command.OrgUnitId, command.Name, existingOrgUnit.Code, command.SortOrder, existingOrgUnit.Status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Name.Should().Be(command.Name);
        result.Value.SortOrder.Should().Be(5);
    }

    [Fact]
    public async Task Handle_WithUnauthorizedUser_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
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
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
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
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Old Name"
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
    public async Task Handle_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Old Name",
            Code = "OLD",
            SortOrder = 1,
            Status = OrgUnitStatus.Active
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.UpdateOrgUnitAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<OrgUnitStatus>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_UPDATE_FAILED");
    }

    [Fact]
    public async Task Handle_SuccessfulUpdate_LogsAuditEvent()
    {
        // Arrange
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Old Name",
            Code = "OLD",
            SortOrder = 1,
            Status = OrgUnitStatus.Active
        };

        var updatedOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = command.Name,
            Code = "OLD",
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            UpdatedAt = DateTime.UtcNow
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.UpdateOrgUnitAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<OrgUnitStatus>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mediator.Verify(x => x.Send(It.Is<AppendAuditEventCommand>(c =>
            c.TenantId == command.TenantId &&
            c.ActorId == command.ActorId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNullSortOrder_KeepsExistingSortOrder()
    {
        // Arrange
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Name",
            SortOrder = null, // Null sort order
            ActorId = Guid.NewGuid()
        };

        var existingOrgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Old Name",
            Code = "OLD",
            SortOrder = 10, // Existing sort order
            Status = OrgUnitStatus.Active
        };

        _orgAuthorizationService.Setup(x => x.CanManageOrgUnitAsync(command.ActorId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _orgTreeService.Setup(x => x.UpdateOrgUnitAsync(command.OrgUnitId, command.Name, existingOrgUnit.Code, existingOrgUnit.SortOrder, existingOrgUnit.Status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOrgUnit);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert - verify UpdateOrgUnitAsync was called with existing sort order
        _orgTreeService.Verify(x => x.UpdateOrgUnitAsync(
            command.OrgUnitId,
            command.Name,
            existingOrgUnit.Code,
            existingOrgUnit.SortOrder, // Should keep existing sort order
            existingOrgUnit.Status,
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
