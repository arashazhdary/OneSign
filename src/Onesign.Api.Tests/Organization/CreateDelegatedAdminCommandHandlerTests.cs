using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class CreateDelegatedAdminCommandHandlerTests
{
    private readonly Mock<IDelegatedAdminRepository> _delegatedAdminRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<ITenantUserRepository> _tenantUserRepository;
    private readonly Mock<IGlobalUserRepository> _globalUserRepository;
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<IMediator> _mediator;
    private readonly Mock<ILogger<CreateDelegatedAdminCommandHandler>> _logger;
    private readonly CreateDelegatedAdminCommandHandler _handler;

    public CreateDelegatedAdminCommandHandlerTests()
    {
        _delegatedAdminRepository = new Mock<IDelegatedAdminRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _tenantUserRepository = new Mock<ITenantUserRepository>();
        _globalUserRepository = new Mock<IGlobalUserRepository>();
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _mediator = new Mock<IMediator>();
        _logger = new Mock<ILogger<CreateDelegatedAdminCommandHandler>>();

        _handler = new CreateDelegatedAdminCommandHandler(
            _delegatedAdminRepository.Object,
            _orgUnitRepository.Object,
            _tenantUserRepository.Object,
            _globalUserRepository.Object,
            _orgAuthorizationService.Object,
            _mediator.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CreatesDelegatedAdminSuccessfully()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ScopeType = AdminScopeType.OrgAndDescendants,
            ActorId = Guid.NewGuid()
        };

        var globalUserId = Guid.NewGuid();
        var tenantUser = new TenantUser
        {
            Id = command.TenantUserId,
            TenantId = command.TenantId,
            GlobalUserId = globalUserId,
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "admin@example.com"
        };

        var orgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Test Department"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _delegatedAdminRepository.Setup(x => x.ExistsAsync(command.TenantUserId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _delegatedAdminRepository.Setup(x => x.AddAsync(It.IsAny<DelegatedAdminScope>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DelegatedAdminScope s, CancellationToken _) => s);
        _globalUserRepository.Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);
        _mediator.Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.TenantUserId.Should().Be(command.TenantUserId);
        result.Value.OrgUnitId.Should().Be(command.OrgUnitId);
        result.Value.ScopeType.Should().Be(command.ScopeType);
        result.Value.OrgUnitName.Should().Be(orgUnit.Name);
        result.Value.UserEmail.Should().Be(globalUser.Email);
    }

    [Fact]
    public async Task Handle_WithNonGlobalAdmin_ReturnsUnauthorizedError()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ScopeType = AdminScopeType.OrgOnly,
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
    public async Task Handle_WithNonExistentUser_ReturnsUserNotFoundError()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("USER_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithNonAdminUser_ReturnsUserNotAdminError()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var tenantUser = new TenantUser
        {
            Id = command.TenantUserId,
            TenantId = command.TenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member, // Not an admin
            Status = TenantUserStatus.Active
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("USER_NOT_ADMIN");
    }

    [Fact]
    public async Task Handle_WithNonExistentOrgUnit_ReturnsOrgUnitNotFoundError()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var tenantUser = new TenantUser
        {
            Id = command.TenantUserId,
            TenantId = command.TenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithExistingDelegatedAdmin_ReturnsDelegatedAdminExistsError()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ActorId = Guid.NewGuid()
        };

        var tenantUser = new TenantUser
        {
            Id = command.TenantUserId,
            TenantId = command.TenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        var orgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Test"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _delegatedAdminRepository.Setup(x => x.ExistsAsync(command.TenantUserId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("DELEGATED_ADMIN_EXISTS");
    }

    [Fact]
    public async Task Handle_SuccessfulCreation_LogsAuditEvent()
    {
        // Arrange
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            ScopeType = AdminScopeType.OrgOnly,
            ActorId = Guid.NewGuid()
        };

        var globalUserId = Guid.NewGuid();
        var tenantUser = new TenantUser
        {
            Id = command.TenantUserId,
            TenantId = command.TenantId,
            GlobalUserId = globalUserId,
            Role = TenantUserRole.TenantAdmin
        };

        var orgUnit = new OrgUnit
        {
            Id = command.OrgUnitId,
            TenantId = command.TenantId,
            Name = "Test"
        };

        var scope = new OrgScope { IsGlobalAdmin = true };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(command.ActorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(command.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _delegatedAdminRepository.Setup(x => x.ExistsAsync(command.TenantUserId, command.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _delegatedAdminRepository.Setup(x => x.AddAsync(It.IsAny<DelegatedAdminScope>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DelegatedAdminScope s, CancellationToken _) => s);
        _globalUserRepository.Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);
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
