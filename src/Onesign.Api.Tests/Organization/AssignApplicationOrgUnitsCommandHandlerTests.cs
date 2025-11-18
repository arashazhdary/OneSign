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

public class AssignApplicationOrgUnitsCommandHandlerTests
{
    private readonly Mock<IApplicationOrgUnitRepository> _applicationOrgUnitRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<AssignApplicationOrgUnitsCommandHandler>> _logger;
    private readonly AssignApplicationOrgUnitsCommandHandler _handler;

    public AssignApplicationOrgUnitsCommandHandlerTests()
    {
        _applicationOrgUnitRepository = new Mock<IApplicationOrgUnitRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<AssignApplicationOrgUnitsCommandHandler>>();

        _handler = new AssignApplicationOrgUnitsCommandHandler(
            _applicationOrgUnitRepository.Object,
            _orgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_AssignsOrgUnitsSuccessfully()
    {
        // Arrange
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() },
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        foreach (var orgUnitId in command.OrgUnitIds)
        {
            _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OrgUnit { Id = orgUnitId, TenantId = command.TenantId, Name = "Test" });
        }

        _applicationOrgUnitRepository.Setup(x => x.DeleteByApplicationClientIdAsync(command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _applicationOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<ApplicationOrgUnit>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _applicationOrgUnitRepository.Verify(x => x.DeleteByApplicationClientIdAsync(command.ApplicationClientId, It.IsAny<CancellationToken>()), Times.Once);
        _applicationOrgUnitRepository.Verify(x => x.AddRangeAsync(It.Is<List<ApplicationOrgUnit>>(list =>
            list.Count == 2), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithUnauthorizedUser_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid> { Guid.NewGuid() },
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task Handle_WithInvalidOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var invalidOrgUnitId = Guid.NewGuid();
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid> { invalidOrgUnitId },
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(invalidOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithOrgUnitFromDifferentTenant_ReturnsNotFoundError()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid> { orgUnitId },
            ActorId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Test"
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithEmptyOrgUnitList_ClearsAllAssignments()
    {
        // Arrange
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid>(), // Empty list
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _applicationOrgUnitRepository.Setup(x => x.DeleteByApplicationClientIdAsync(command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _applicationOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<ApplicationOrgUnit>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _applicationOrgUnitRepository.Verify(x => x.DeleteByApplicationClientIdAsync(command.ApplicationClientId, It.IsAny<CancellationToken>()), Times.Once);
        _applicationOrgUnitRepository.Verify(x => x.AddRangeAsync(It.Is<List<ApplicationOrgUnit>>(list =>
            list.Count == 0), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SuccessfulAssignment_LogsAuditEvent()
    {
        // Arrange
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitIds = new List<Guid> { Guid.NewGuid() },
            ActorId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.CanManageApplicationAsync(command.ActorId, command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        foreach (var orgUnitId in command.OrgUnitIds)
        {
            _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OrgUnit { Id = orgUnitId, TenantId = command.TenantId, Name = "Test" });
        }

        _applicationOrgUnitRepository.Setup(x => x.DeleteByApplicationClientIdAsync(command.ApplicationClientId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _applicationOrgUnitRepository.Setup(x => x.AddRangeAsync(It.IsAny<List<ApplicationOrgUnit>>(), It.IsAny<CancellationToken>()))
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
