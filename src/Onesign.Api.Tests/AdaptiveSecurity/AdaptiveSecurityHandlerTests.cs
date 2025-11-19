using FluentAssertions;
using Moq;
using Onesign.Modules.AdaptiveSecurity.Application.Commands;
using Onesign.Modules.AdaptiveSecurity.Application.Queries;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Api.Tests.AdaptiveSecurity;

public class AdaptiveSecurityHandlerTests
{
    private readonly Mock<IAdaptivePolicyRepository> _policyRepositoryMock;
    private readonly Mock<ISecuritySignalRepository> _signalRepositoryMock;
    private readonly Mock<IUserSecurityContextRepository> _contextRepositoryMock;
    private readonly Mock<ISecuritySignalProcessor> _signalProcessorMock;

    public AdaptiveSecurityHandlerTests()
    {
        _policyRepositoryMock = new Mock<IAdaptivePolicyRepository>();
        _signalRepositoryMock = new Mock<ISecuritySignalRepository>();
        _contextRepositoryMock = new Mock<IUserSecurityContextRepository>();
        _signalProcessorMock = new Mock<ISecuritySignalProcessor>();
    }

    #region CreateAdaptivePolicyCommandHandler Tests

    [Fact]
    public async Task CreateAdaptivePolicy_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateAdaptivePolicyCommandHandler(_policyRepositoryMock.Object);

        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "High Risk Policy",
            Description = "Blocks high risk logins",
            Conditions = "{}",
            Actions = new List<AdaptiveActionType> { AdaptiveActionType.RequireMfa },
            RiskThreshold = RiskLevel.High,
            IsEnabled = true,
            Priority = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("High Risk Policy");
        result.Value.IsEnabled.Should().BeTrue();
        _policyRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<AdaptivePolicy>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateAdaptivePolicy_SetsCorrectTimestamps()
    {
        // Arrange
        var handler = new CreateAdaptivePolicyCommandHandler(_policyRepositoryMock.Object);

        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            IsEnabled = true
        };

        AdaptivePolicy? savedPolicy = null;
        _policyRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AdaptivePolicy>(), It.IsAny<CancellationToken>()))
            .Callback<AdaptivePolicy, CancellationToken>((p, ct) => savedPolicy = p)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedPolicy!.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        savedPolicy.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    #endregion

    #region ProcessSecuritySignalCommandHandler Tests

    [Fact]
    public async Task ProcessSecuritySignal_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new ProcessSecuritySignalCommandHandler(
            _signalRepositoryMock.Object,
            _signalProcessorMock.Object);

        var command = new ProcessSecuritySignalCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            SessionId = Guid.NewGuid(),
            SignalType = SecuritySignalType.UnusualLocation,
            RiskScore = 75,
            DetailsJson = "{\"country\":\"RU\"}"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.SignalType.Should().Be(SecuritySignalType.UnusualLocation);
        result.Value.RiskScore.Should().Be(75);
        _signalRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _signalProcessorMock.Verify(
            x => x.ProcessSignalAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessSecuritySignal_SetsDetectedAtTimestamp()
    {
        // Arrange
        var handler = new ProcessSecuritySignalCommandHandler(
            _signalRepositoryMock.Object,
            _signalProcessorMock.Object);

        var command = new ProcessSecuritySignalCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            SignalType = SecuritySignalType.BruteForceAttempt,
            RiskScore = 90
        };

        SecuritySignal? savedSignal = null;
        _signalRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()))
            .Callback<SecuritySignal, CancellationToken>((s, ct) => savedSignal = s)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedSignal!.DetectedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    #endregion

    #region UpdateUserSecurityContextCommandHandler Tests

    [Fact]
    public async Task UpdateUserSecurityContext_WithExistingContext_UpdatesContext()
    {
        // Arrange
        var handler = new UpdateUserSecurityContextCommandHandler(_contextRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var existingContext = new UserSecurityContext
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            LastLoginLocation = "US",
            LastLoginDevice = "Chrome"
        };

        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            LastLoginLocation = "UK",
            LastLoginDevice = "Firefox"
        };

        _contextRepositoryMock
            .Setup(x => x.GetByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingContext);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.LastLoginLocation.Should().Be("UK");
        result.Value.LastLoginDevice.Should().Be("Firefox");
        _contextRepositoryMock.Verify(
            x => x.UpdateAsync(It.IsAny<UserSecurityContext>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateUserSecurityContext_WithNewContext_CreatesContext()
    {
        // Arrange
        var handler = new UpdateUserSecurityContextCommandHandler(_contextRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            LastLoginLocation = "US",
            LastLoginDevice = "Chrome"
        };

        _contextRepositoryMock
            .Setup(x => x.GetByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSecurityContext?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _contextRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<UserSecurityContext>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateUserSecurityContext_WithTrustedDevices_SerializesToJson()
    {
        // Arrange
        var handler = new UpdateUserSecurityContextCommandHandler(_contextRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            TrustedDevices = new List<string> { "device1", "device2" }
        };

        _contextRepositoryMock
            .Setup(x => x.GetByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSecurityContext?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TrustedDevicesJson.Should().Contain("device1");
    }

    #endregion

    #region GetAdaptivePoliciesQueryHandler Tests

    [Fact]
    public async Task GetAdaptivePolicies_ReturnsAllPolicies()
    {
        // Arrange
        var handler = new GetAdaptivePoliciesQueryHandler(_policyRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var policies = new List<AdaptivePolicy>
        {
            new AdaptivePolicy { Id = Guid.NewGuid(), Name = "Policy 1", IsEnabled = true },
            new AdaptivePolicy { Id = Guid.NewGuid(), Name = "Policy 2", IsEnabled = false }
        };

        var query = new GetAdaptivePoliciesQuery { TenantId = tenantId };

        _policyRepositoryMock
            .Setup(x => x.GetByTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAdaptivePolicies_WithEnabledOnlyFilter_ReturnsEnabledPolicies()
    {
        // Arrange
        var handler = new GetAdaptivePoliciesQueryHandler(_policyRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var policies = new List<AdaptivePolicy>
        {
            new AdaptivePolicy { Id = Guid.NewGuid(), Name = "Policy 1", IsEnabled = true }
        };

        var query = new GetAdaptivePoliciesQuery { TenantId = tenantId, EnabledOnly = true };

        _policyRepositoryMock
            .Setup(x => x.GetEnabledPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetSecuritySignalsQueryHandler Tests

    [Fact]
    public async Task GetSecuritySignals_ByTenant_ReturnsSignals()
    {
        // Arrange
        var handler = new GetSecuritySignalsQueryHandler(_signalRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var signals = new List<SecuritySignal>
        {
            new SecuritySignal { Id = Guid.NewGuid(), SignalType = SecuritySignalType.UnusualLocation },
            new SecuritySignal { Id = Guid.NewGuid(), SignalType = SecuritySignalType.BruteForceAttempt }
        };

        var query = new GetSecuritySignalsQuery { TenantId = tenantId, Limit = 100 };

        _signalRepositoryMock
            .Setup(x => x.GetByTenantAsync(tenantId, 100, It.IsAny<CancellationToken>()))
            .ReturnsAsync(signals);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetSecuritySignals_ByUser_ReturnsFilteredSignals()
    {
        // Arrange
        var handler = new GetSecuritySignalsQueryHandler(_signalRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var signals = new List<SecuritySignal>
        {
            new SecuritySignal { Id = Guid.NewGuid(), UserId = userId, SignalType = SecuritySignalType.UnusualLocation }
        };

        var query = new GetSecuritySignalsQuery { TenantId = tenantId, UserId = userId };

        _signalRepositoryMock
            .Setup(x => x.GetByUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(signals);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetUserSecurityContextQueryHandler Tests

    [Fact]
    public async Task GetUserSecurityContext_WithExistingContext_ReturnsContext()
    {
        // Arrange
        var handler = new GetUserSecurityContextQueryHandler(_contextRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var context = new UserSecurityContext
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            CurrentRiskScore = 30,
            LastLoginLocation = "US"
        };

        var query = new GetUserSecurityContextQuery { TenantId = tenantId, UserId = userId };

        _contextRepositoryMock
            .Setup(x => x.GetByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CurrentRiskScore.Should().Be(30);
        result.Value.LastLoginLocation.Should().Be("US");
    }

    [Fact]
    public async Task GetUserSecurityContext_WithNonExistingContext_ReturnsFailure()
    {
        // Arrange
        var handler = new GetUserSecurityContextQueryHandler(_contextRepositoryMock.Object);

        var query = new GetUserSecurityContextQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _contextRepositoryMock
            .Setup(x => x.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSecurityContext?)null);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("NOT_FOUND");
    }

    #endregion
}
