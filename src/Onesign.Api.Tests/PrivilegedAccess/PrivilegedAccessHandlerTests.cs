using FluentAssertions;
using Moq;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Application.Handlers;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Domain.Services;

namespace Onesign.Api.Tests.PrivilegedAccess;

public class PrivilegedAccessHandlerTests
{
    private readonly Mock<IJitGrantService> _jitGrantServiceMock;
    private readonly Mock<IPrivilegedSessionRepository> _sessionRepositoryMock;
    private readonly Mock<IJitGrantRepository> _jitGrantRepositoryMock;

    public PrivilegedAccessHandlerTests()
    {
        _jitGrantServiceMock = new Mock<IJitGrantService>();
        _sessionRepositoryMock = new Mock<IPrivilegedSessionRepository>();
        _jitGrantRepositoryMock = new Mock<IJitGrantRepository>();
    }

    #region RequestJitAccessCommandHandler Tests

    [Fact]
    public async Task RequestJitAccess_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new RequestJitAccessCommandHandler(_jitGrantServiceMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();
        var grantId = Guid.NewGuid();

        var command = new RequestJitAccessCommand
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = roleId,
            DurationMinutes = 60,
            Justification = "Need access for deployment"
        };

        var grant = new JitGrant { Id = grantId };

        _jitGrantServiceMock
            .Setup(x => x.CreateJitGrantAsync(
                tenantId, userId, roleId, 60, userId, "Need access for deployment", It.IsAny<CancellationToken>()))
            .ReturnsAsync(grant);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(grantId);
    }

    [Fact]
    public async Task RequestJitAccess_WhenServiceThrows_ReturnsFailure()
    {
        // Arrange
        var handler = new RequestJitAccessCommandHandler(_jitGrantServiceMock.Object);

        var command = new RequestJitAccessCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RoleId = Guid.NewGuid(),
            DurationMinutes = 60,
            Justification = "Test"
        };

        _jitGrantServiceMock
            .Setup(x => x.CreateJitGrantAsync(
                It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Role not found"));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("JitAccessRequestFailed");
    }

    [Fact]
    public async Task RequestJitAccess_CallsServiceWithCorrectParameters()
    {
        // Arrange
        var handler = new RequestJitAccessCommandHandler(_jitGrantServiceMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var command = new RequestJitAccessCommand
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = roleId,
            DurationMinutes = 30,
            Justification = "Emergency access"
        };

        _jitGrantServiceMock
            .Setup(x => x.CreateJitGrantAsync(
                It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new JitGrant { Id = Guid.NewGuid() });

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _jitGrantServiceMock.Verify(
            x => x.CreateJitGrantAsync(tenantId, userId, roleId, 30, userId, "Emergency access", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region RevokePrivilegedSessionCommandHandler Tests

    [Fact]
    public async Task RevokePrivilegedSession_WithActiveSession_ReturnsSuccess()
    {
        // Arrange
        var handler = new RevokePrivilegedSessionCommandHandler(_sessionRepositoryMock.Object);

        var sessionId = Guid.NewGuid();
        var session = new PrivilegedSession
        {
            Id = sessionId,
            IsActive = true
        };

        var command = new RevokePrivilegedSessionCommand
        {
            SessionId = sessionId,
            RevokedBy = Guid.NewGuid()
        };

        _sessionRepositoryMock
            .Setup(x => x.GetByIdAsync(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();
        session.IsActive.Should().BeFalse();
        session.EndedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokePrivilegedSession_WithNonExistingSession_ReturnsFailure()
    {
        // Arrange
        var handler = new RevokePrivilegedSessionCommandHandler(_sessionRepositoryMock.Object);

        var command = new RevokePrivilegedSessionCommand { SessionId = Guid.NewGuid() };

        _sessionRepositoryMock
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PrivilegedSession?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SessionNotFound");
    }

    [Fact]
    public async Task RevokePrivilegedSession_WithAlreadyEndedSession_ReturnsFailure()
    {
        // Arrange
        var handler = new RevokePrivilegedSessionCommandHandler(_sessionRepositoryMock.Object);

        var sessionId = Guid.NewGuid();
        var session = new PrivilegedSession
        {
            Id = sessionId,
            IsActive = false,
            EndedAt = DateTime.UtcNow.AddHours(-1)
        };

        var command = new RevokePrivilegedSessionCommand { SessionId = sessionId };

        _sessionRepositoryMock
            .Setup(x => x.GetByIdAsync(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SessionAlreadyEnded");
    }

    [Fact]
    public async Task RevokePrivilegedSession_UpdatesRepository()
    {
        // Arrange
        var handler = new RevokePrivilegedSessionCommandHandler(_sessionRepositoryMock.Object);

        var sessionId = Guid.NewGuid();
        var session = new PrivilegedSession { Id = sessionId, IsActive = true };

        var command = new RevokePrivilegedSessionCommand { SessionId = sessionId };

        _sessionRepositoryMock
            .Setup(x => x.GetByIdAsync(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _sessionRepositoryMock.Verify(
            x => x.UpdateAsync(session, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region GetActiveJitGrantsQueryHandler Tests

    [Fact]
    public async Task GetActiveJitGrants_ReturnsGrants()
    {
        // Arrange
        var handler = new GetActiveJitGrantsQueryHandler(_jitGrantRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var grants = new List<JitGrant>
        {
            new JitGrant { Id = Guid.NewGuid(), UserId = userId, RoleName = "Admin", Status = JitGrantStatus.Active },
            new JitGrant { Id = Guid.NewGuid(), UserId = userId, RoleName = "Reader", Status = JitGrantStatus.Active }
        };

        var query = new GetActiveJitGrantsQuery { TenantId = tenantId, UserId = userId };

        _jitGrantRepositoryMock
            .Setup(x => x.GetActiveByUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(grants);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetActiveJitGrants_MapsFieldsCorrectly()
    {
        // Arrange
        var handler = new GetActiveJitGrantsQueryHandler(_jitGrantRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var grantId = Guid.NewGuid();
        var approvedBy = Guid.NewGuid();

        var grants = new List<JitGrant>
        {
            new JitGrant
            {
                Id = grantId,
                UserId = userId,
                RoleId = Guid.NewGuid(),
                RoleName = "Admin",
                GrantedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                ApprovedBy = approvedBy,
                Status = JitGrantStatus.Active,
                Justification = "Emergency access"
            }
        };

        var query = new GetActiveJitGrantsQuery { TenantId = tenantId, UserId = userId };

        _jitGrantRepositoryMock
            .Setup(x => x.GetActiveByUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(grants);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value![0];
        dto.Id.Should().Be(grantId);
        dto.UserId.Should().Be(userId);
        dto.RoleName.Should().Be("Admin");
        dto.ApprovedBy.Should().Be(approvedBy);
        dto.Status.Should().Be("Active");
        dto.Justification.Should().Be("Emergency access");
    }

    #endregion

    #region GetPrivilegedSessionsQueryHandler Tests

    [Fact]
    public async Task GetPrivilegedSessions_ReturnsSessions()
    {
        // Arrange
        var handler = new GetPrivilegedSessionsQueryHandler(_sessionRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var sessions = new List<PrivilegedSession>
        {
            new PrivilegedSession { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), IsActive = true },
            new PrivilegedSession { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), IsActive = true }
        };

        var query = new GetPrivilegedSessionsQuery { TenantId = tenantId, ActiveOnly = true };

        _sessionRepositoryMock
            .Setup(x => x.GetActiveSessionsAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sessions);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    #endregion
}
