using FluentAssertions;
using Moq;
using Onesign.Modules.Identity.Application.Queries;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class GetUserDetailsQueryHandlerTests
{
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly GetUserDetailsQueryHandler _handler;

    public GetUserDetailsQueryHandlerTests()
    {
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();

        _handler = new GetUserDetailsQueryHandler(
            _tenantUserRepositoryMock.Object,
            _globalUserRepositoryMock.Object);
    }

    #region Successful Query Tests

    [Fact]
    public async Task Handle_ValidUser_ReturnsUserDetails()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = false,
            FirstLoginAt = DateTime.UtcNow.AddDays(-10),
            LastLoginAt = DateTime.UtcNow.AddDays(-1),
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

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(tenantUserId);
        result.GlobalUserId.Should().Be(globalUserId);
        result.TenantId.Should().Be(tenantId);
        result.Email.Should().Be("test@example.com");
        result.Status.Should().Be(TenantUserStatus.Active);
        result.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_AdminUser_ReturnsIsAdminTrue()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = true,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "admin@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.IsAdmin.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ReturnsCorrectDates()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var firstLoginAt = DateTime.UtcNow.AddDays(-20);
        var lastLoginAt = DateTime.UtcNow.AddHours(-5);
        var createdAt = DateTime.UtcNow.AddDays(-30);

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            FirstLoginAt = firstLoginAt,
            LastLoginAt = lastLoginAt,
            CreatedAt = createdAt
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.FirstLoginAt.Should().Be(firstLoginAt);
        result.LastLoginAt.Should().Be(lastLoginAt);
        result.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_UserWithNullDates_ReturnsNullDates()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Invited,
            FirstLoginAt = null,
            LastLoginAt = null,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.FirstLoginAt.Should().BeNull();
        result.LastLoginAt.Should().BeNull();
    }

    #endregion

    #region User Not Found Tests

    [Fact]
    public async Task Handle_TenantUserNotFound_ReturnsNull()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_TenantUserNotFound_DoesNotQueryGlobalUser()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _globalUserRepositoryMock.Verify(x => x.GetByIdAsync(
            It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_GlobalUserNotFound_ReturnsEmptyEmail()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().BeEmpty();
    }

    #endregion

    #region Different Status Tests

    [Fact]
    public async Task Handle_InvitedUser_ReturnsCorrectStatus()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Invited,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(TenantUserStatus.Invited);
    }

    [Fact]
    public async Task Handle_DisabledUser_ReturnsCorrectStatus()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Disabled,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(TenantUserStatus.Disabled);
    }

    [Fact]
    public async Task Handle_SuspendedUser_ReturnsCorrectStatus()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Suspended,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(TenantUserStatus.Suspended);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task Handle_EmptyGuidUserId_HandlesCorrectly()
    {
        // Arrange
        var tenantUserId = Guid.Empty;

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var cancellationToken = new CancellationToken(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, cancellationToken))
            .ThrowsAsync(new OperationCanceledException());

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => _handler.Handle(query, cancellationToken));
    }

    [Fact]
    public async Task Handle_SpecialCharactersInEmail_ReturnsCorrectly()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var specialEmail = "test+special@sub.example.com";

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = specialEmail
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(specialEmail);
    }

    #endregion
}
