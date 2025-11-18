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

public class RemoveDelegatedAdminCommandHandlerTests
{
    private readonly Mock<IDelegatedAdminRepository> _delegatedAdminRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<RemoveDelegatedAdminCommandHandler>> _logger;
    private readonly RemoveDelegatedAdminCommandHandler _handler;

    public RemoveDelegatedAdminCommandHandlerTests()
    {
        _delegatedAdminRepository = new Mock<IDelegatedAdminRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<RemoveDelegatedAdminCommandHandler>>();

        _handler = new RemoveDelegatedAdminCommandHandler(
            _delegatedAdminRepository.Object,
            _orgUnitRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_RemovesDelegatedAdminSuccessfully()
    {
        // Arrange
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var delegatedAdmin = new DelegatedAdminScope
        {
            Id = command.DelegatedAdminId,
            TenantUserId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ScopeType = AdminScopeType.OrgAndDescendants
        };

        var orgUnit = new OrgUnit
        {
            Id = delegatedAdmin.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Test"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _delegatedAdminRepository.Setup(x => x.GetByIdAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmin);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(delegatedAdmin.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _delegatedAdminRepository.Setup(x => x.DeleteAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _delegatedAdminRepository.Verify(x => x.DeleteAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonGlobalAdmin_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
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
    }

    [Fact]
    public async Task Handle_WithNonExistentDelegatedAdmin_ReturnsNotFoundError()
    {
        // Arrange
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _delegatedAdminRepository.Setup(x => x.GetByIdAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((DelegatedAdminScope?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("DELEGATED_ADMIN_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithTenantMismatch_ReturnsTenantMismatchError()
    {
        // Arrange
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var delegatedAdmin = new DelegatedAdminScope
        {
            Id = command.DelegatedAdminId,
            TenantUserId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = delegatedAdmin.OrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Test"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _delegatedAdminRepository.Setup(x => x.GetByIdAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmin);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(delegatedAdmin.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("TENANT_MISMATCH");
    }

    [Fact]
    public async Task Handle_SuccessfulRemoval_LogsAuditEvent()
    {
        // Arrange
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var delegatedAdmin = new DelegatedAdminScope
        {
            Id = command.DelegatedAdminId,
            TenantUserId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = delegatedAdmin.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Test"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _delegatedAdminRepository.Setup(x => x.GetByIdAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmin);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(delegatedAdmin.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _delegatedAdminRepository.Setup(x => x.DeleteAsync(command.DelegatedAdminId, It.IsAny<CancellationToken>()))
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
