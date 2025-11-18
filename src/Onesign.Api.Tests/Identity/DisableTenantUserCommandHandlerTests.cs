using FluentAssertions;
using MediatR;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class DisableTenantUserCommandHandlerTests
{
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly DisableTenantUserCommandHandler _handler;

    public DisableTenantUserCommandHandlerTests()
    {
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();
        _mediatorMock = new Mock<IMediator>();

        _handler = new DisableTenantUserCommandHandler(
            _tenantUserRepositoryMock.Object,
            _globalUserRepositoryMock.Object,
            _mediatorMock.Object);
    }

    #region Successful Disable Tests

    [Fact]
    public async Task Handle_ValidUser_ReturnsSuccessWithDisabledUser()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = false,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(tenantUserId);
        result.Value.Status.Should().Be(TenantUserStatus.Disabled);
        result.Value.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Handle_ValidUser_UpdatesStatusToDisabled()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        TenantUser? updatedUser = null;
        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Callback<TenantUser, CancellationToken>((user, _) => updatedUser = user)
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        updatedUser.Should().NotBeNull();
        updatedUser!.Status.Should().Be(TenantUserStatus.Disabled);
    }

    [Fact]
    public async Task Handle_ValidUser_LogsAuditEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        AppendAuditEventCommand? capturedAuditCommand = null;
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .Callback<IRequest<Result<Onesign.Modules.Audit.Application.DTOs.AuditEventDto>>, CancellationToken>((cmd, _) => capturedAuditCommand = cmd as AppendAuditEventCommand)
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedAuditCommand.Should().NotBeNull();
        capturedAuditCommand!.TenantId.Should().Be(tenantId);
        capturedAuditCommand.Description.Should().Contain("test@example.com");
        capturedAuditCommand.Description.Should().Contain("disabled");
    }

    #endregion

    #region User Not Found Tests

    [Fact]
    public async Task Handle_UserNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_UserNotFound_DoesNotUpdateRepository()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _tenantUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_UserNotFound_DoesNotLogAuditEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mediatorMock.Verify(x => x.Send(
            It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    #endregion

    #region Tenant Mismatch Tests

    [Fact]
    public async Task Handle_TenantMismatch_ReturnsUserNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var differentTenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = differentTenantId, // Different tenant
            Status = TenantUserStatus.Active
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId // Requested tenant is different
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_FOUND");
    }

    #endregion

    #region Different Initial Status Tests

    [Fact]
    public async Task Handle_InvitedUser_DisablesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Invited
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Status.Should().Be(TenantUserStatus.Disabled);
    }

    [Fact]
    public async Task Handle_AlreadyDisabledUser_DisablesAgain()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Disabled // Already disabled
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Status.Should().Be(TenantUserStatus.Disabled);
    }

    [Fact]
    public async Task Handle_SuspendedUser_DisablesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Suspended
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Status.Should().Be(TenantUserStatus.Disabled);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task Handle_GlobalUserNotFound_ReturnsSuccessWithUnknownEmail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Email.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_AdminUser_DisablesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = true
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "admin@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsAdmin.Should().BeTrue();
        result.Value.Status.Should().Be(TenantUserStatus.Disabled);
    }

    [Fact]
    public async Task Handle_ReturnsCorrectDtoFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var firstLoginAt = DateTime.UtcNow.AddDays(-20);
        var lastLoginAt = DateTime.UtcNow.AddDays(-1);

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = false,
            CreatedAt = createdAt,
            FirstLoginAt = firstLoginAt,
            LastLoginAt = lastLoginAt
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.Id.Should().Be(tenantUserId);
        result.Value.GlobalUserId.Should().Be(globalUserId);
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.Email.Should().Be("test@example.com");
        result.Value.IsAdmin.Should().BeFalse();
        result.Value.CreatedAt.Should().Be(createdAt);
        result.Value.FirstLoginAt.Should().Be(firstLoginAt);
        result.Value.LastLoginAt.Should().Be(lastLoginAt);
    }

    #endregion
}
