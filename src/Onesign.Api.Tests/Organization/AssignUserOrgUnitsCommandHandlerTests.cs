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

public class AssignUserOrgUnitsCommandHandlerTests
{
    private readonly Mock<IUserOrgUnitRepository> _userOrgUnitRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<AssignUserOrgUnitsCommandHandler>> _logger;
    private readonly AssignUserOrgUnitsCommandHandler _handler;

    public AssignUserOrgUnitsCommandHandlerTests()
    {
        _userOrgUnitRepository = new Mock<IUserOrgUnitRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<AssignUserOrgUnitsCommandHandler>>();

        _handler = new AssignUserOrgUnitsCommandHandler(
            _userOrgUnitRepository.Object,
            _orgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_AssignsOrgUnitsSuccessfully()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            SecondaryOrgUnitIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() },
            ActorId = Guid.NewGuid()
        };

        var primaryOrgUnit = new OrgUnit
        {
            Id = command.PrimaryOrgUnitId,
            TenantId = command.TenantId,
            Name = "Primary"
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(primaryOrgUnit);

        foreach (var secondaryId in command.SecondaryOrgUnitIds)
        {
            _orgUnitRepository.Setup(x => x.GetByIdAsync(secondaryId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OrgUnit { Id = secondaryId, TenantId = command.TenantId, Name = "Secondary" });
        }

        _userOrgUnitRepository.Setup(x => x.DeleteByTenantUserIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _userOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<UserOrgUnit>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userOrgUnitRepository.Verify(x => x.DeleteByTenantUserIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()), Times.Once);
        _userOrgUnitRepository.Verify(x => x.AddRangeAsync(It.Is<List<UserOrgUnit>>(list =>
            list.Count == 3 &&
            list.Any(u => u.OrgUnitId == command.PrimaryOrgUnitId && u.IsPrimary)), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithUnauthorizedUser_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task Handle_WithInvalidPrimaryOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
        result.Error.Message.Should().Contain("Primary");
    }

    [Fact]
    public async Task Handle_WithPrimaryOrgUnitFromDifferentTenant_ReturnsNotFoundError()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var primaryOrgUnit = new OrgUnit
        {
            Id = command.PrimaryOrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Primary"
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(primaryOrgUnit);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithInvalidSecondaryOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var invalidSecondaryId = Guid.NewGuid();
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            SecondaryOrgUnitIds = new List<Guid> { invalidSecondaryId },
            ActorId = Guid.NewGuid()
        };

        var primaryOrgUnit = new OrgUnit
        {
            Id = command.PrimaryOrgUnitId,
            TenantId = command.TenantId,
            Name = "Primary"
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(primaryOrgUnit);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(invalidSecondaryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
        result.Error.Message.Should().Contain("Secondary");
    }

    [Fact]
    public async Task Handle_WithOnlyPrimaryOrgUnit_AssignsSingleOrgUnit()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            SecondaryOrgUnitIds = new List<Guid>(), // No secondary
            ActorId = Guid.NewGuid()
        };

        var primaryOrgUnit = new OrgUnit
        {
            Id = command.PrimaryOrgUnitId,
            TenantId = command.TenantId,
            Name = "Primary"
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(primaryOrgUnit);
        _userOrgUnitRepository.Setup(x => x.DeleteByTenantUserIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _userOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<UserOrgUnit>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userOrgUnitRepository.Verify(x => x.AddRangeAsync(It.Is<List<UserOrgUnit>>(list =>
            list.Count == 1 &&
            list.Single().IsPrimary), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SuccessfulAssignment_LogsAuditEvent()
    {
        // Arrange
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryOrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var primaryOrgUnit = new OrgUnit
        {
            Id = command.PrimaryOrgUnitId,
            TenantId = command.TenantId,
            Name = "Primary"
        };

        _orgAuthorizationService.Setup(x => x.CanManageUserAsync(command.ActorId, command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.PrimaryOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(primaryOrgUnit);
        _userOrgUnitRepository.Setup(x => x.DeleteByTenantUserIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _userOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<UserOrgUnit>>(), It.IsAny<CancellationToken>()))
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
