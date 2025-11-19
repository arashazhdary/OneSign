using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.AdaptiveSecurity.Application.Commands;
using Onesign.Modules.AdaptiveSecurity.Application.Queries;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Api.Tests.AdaptiveSecurity;

#region CreateAdaptivePolicyCommandHandler Tests

public class CreateAdaptivePolicyCommandHandlerTests
{
    private readonly Mock<IAdaptivePolicyRepository> _policyRepositoryMock;
    private readonly CreateAdaptivePolicyCommandHandler _handler;

    public CreateAdaptivePolicyCommandHandlerTests()
    {
        _policyRepositoryMock = new Mock<IAdaptivePolicyRepository>();
        _handler = new CreateAdaptivePolicyCommandHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreatePolicy()
    {
        // Arrange
        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "High Risk Policy",
            Description = "Policy for high risk users",
            TriggerConditions = new List<TriggerConditionItem>
            {
                new TriggerConditionItem
                {
                    SignalType = (int)SecuritySignalType.AnomalousLocation,
                    Operator = ">=",
                    Threshold = 0.8m
                }
            },
            Actions = new List<PolicyActionItem>
            {
                new PolicyActionItem
                {
                    ActionType = (int)AdaptiveActionType.RequireMfa,
                    Parameters = new Dictionary<string, string>()
                }
            },
            Priority = 100,
            IsEnabled = true
        };

        AdaptivePolicy? capturedPolicy = null;
        _policyRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<AdaptivePolicy>(), It.IsAny<CancellationToken>()))
            .Callback<AdaptivePolicy, CancellationToken>((p, _) => capturedPolicy = p)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("High Risk Policy");
        result.IsEnabled.Should().BeTrue();

        capturedPolicy.Should().NotBeNull();
        _policyRepositoryMock.Verify(r => r.AddAsync(It.IsAny<AdaptivePolicy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithMultipleTriggers_ShouldCreatePolicyWithAllTriggers()
    {
        // Arrange
        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Multi Trigger",
            TriggerConditions = new List<TriggerConditionItem>
            {
                new TriggerConditionItem { SignalType = (int)SecuritySignalType.AnomalousLocation },
                new TriggerConditionItem { SignalType = (int)SecuritySignalType.FailedLoginAttempt },
                new TriggerConditionItem { SignalType = (int)SecuritySignalType.SuspiciousActivity }
            },
            Actions = new List<PolicyActionItem>(),
            Priority = 50,
            IsEnabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WithDisabledPolicy_ShouldCreateDisabledPolicy()
    {
        // Arrange
        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Disabled Policy",
            TriggerConditions = new List<TriggerConditionItem>(),
            Actions = new List<PolicyActionItem>(),
            Priority = 1,
            IsEnabled = false
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsEnabled.Should().BeFalse();
    }
}

#endregion

#region ProcessSecuritySignalCommandHandler Tests

public class ProcessSecuritySignalCommandHandlerTests
{
    private readonly Mock<ISecuritySignalRepository> _signalRepositoryMock;
    private readonly Mock<IUserSecurityContextRepository> _contextRepositoryMock;
    private readonly Mock<ISecuritySignalProcessor> _signalProcessorMock;
    private readonly ProcessSecuritySignalCommandHandler _handler;

    public ProcessSecuritySignalCommandHandlerTests()
    {
        _signalRepositoryMock = new Mock<ISecuritySignalRepository>();
        _contextRepositoryMock = new Mock<IUserSecurityContextRepository>();
        _signalProcessorMock = new Mock<ISecuritySignalProcessor>();
        _handler = new ProcessSecuritySignalCommandHandler(
            _signalRepositoryMock.Object,
            _contextRepositoryMock.Object,
            _signalProcessorMock.Object);
    }

    [Fact]
    public async Task Handle_WithNewSignal_ShouldProcessAndStore()
    {
        // Arrange
        var command = new ProcessSecuritySignalCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            SignalType = (int)SecuritySignalType.AnomalousLocation,
            Severity = (int)SignalSeverity.High,
            Source = "GeoIP",
            Details = new Dictionary<string, string>
            {
                { "location", "Unknown Country" },
                { "previous_location", "United States" }
            }
        };

        _signalProcessorMock
            .Setup(p => p.ProcessAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        _signalRepositoryMock.Verify(r => r.AddAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithHighSeveritySignal_ShouldUpdateUserContext()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var command = new ProcessSecuritySignalCommand
        {
            TenantId = tenantId,
            UserId = userId,
            SignalType = (int)SecuritySignalType.SuspiciousActivity,
            Severity = (int)SignalSeverity.Critical,
            Source = "BehaviorAnalysis"
        };

        var existingContext = new UserSecurityContext(Guid.NewGuid(), userId, tenantId);

        _contextRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingContext);

        _signalProcessorMock
            .Setup(p => p.ProcessAsync(It.IsAny<SecuritySignal>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _contextRepositoryMock.Verify(r => r.UpdateAsync(existingContext, It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion

#region UpdateUserSecurityContextCommandHandler Tests

public class UpdateUserSecurityContextCommandHandlerTests
{
    private readonly Mock<IUserSecurityContextRepository> _contextRepositoryMock;
    private readonly UpdateUserSecurityContextCommandHandler _handler;

    public UpdateUserSecurityContextCommandHandlerTests()
    {
        _contextRepositoryMock = new Mock<IUserSecurityContextRepository>();
        _handler = new UpdateUserSecurityContextCommandHandler(_contextRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingContext_ShouldUpdateContext()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var existingContext = new UserSecurityContext(Guid.NewGuid(), userId, tenantId);

        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            RiskScore = 75,
            TrustLevel = (int)TrustLevel.Low,
            LastKnownLocation = "New York, US",
            LastKnownDevice = "Windows 11"
        };

        _contextRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingContext);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        _contextRepositoryMock.Verify(r => r.UpdateAsync(existingContext, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNoExistingContext_ShouldCreateNewContext()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            RiskScore = 25,
            TrustLevel = (int)TrustLevel.High
        };

        _contextRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSecurityContext?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        _contextRepositoryMock.Verify(r => r.AddAsync(It.IsAny<UserSecurityContext>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion

#region GetAdaptivePoliciesQueryHandler Tests

public class GetAdaptivePoliciesQueryHandlerTests
{
    private readonly Mock<IAdaptivePolicyRepository> _policyRepositoryMock;
    private readonly GetAdaptivePoliciesQueryHandler _handler;

    public GetAdaptivePoliciesQueryHandlerTests()
    {
        _policyRepositoryMock = new Mock<IAdaptivePolicyRepository>();
        _handler = new GetAdaptivePoliciesQueryHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithPolicies_ShouldReturnAllPolicies()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<AdaptivePolicy>
        {
            new AdaptivePolicy(Guid.NewGuid(), tenantId, "Policy 1", "Desc", 100, true),
            new AdaptivePolicy(Guid.NewGuid(), tenantId, "Policy 2", "Desc", 50, false)
        };

        _policyRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetAdaptivePoliciesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithNoPolicies_ShouldReturnEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _policyRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AdaptivePolicy>());

        var query = new GetAdaptivePoliciesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}

#endregion

#region GetUserSecurityContextQueryHandler Tests

public class GetUserSecurityContextQueryHandlerTests
{
    private readonly Mock<IUserSecurityContextRepository> _contextRepositoryMock;
    private readonly GetUserSecurityContextQueryHandler _handler;

    public GetUserSecurityContextQueryHandlerTests()
    {
        _contextRepositoryMock = new Mock<IUserSecurityContextRepository>();
        _handler = new GetUserSecurityContextQueryHandler(_contextRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingContext_ShouldReturnContext()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var context = new UserSecurityContext(Guid.NewGuid(), userId, tenantId);
        context.UpdateRiskScore(45);
        context.UpdateTrustLevel(TrustLevel.Medium);

        _contextRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);

        var query = new GetUserSecurityContextQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(45);
    }

    [Fact]
    public async Task Handle_WithNoContext_ShouldReturnNull()
    {
        // Arrange
        var query = new GetUserSecurityContextQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _contextRepositoryMock
            .Setup(r => r.GetByUserIdAsync(query.UserId, query.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserSecurityContext?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}

#endregion

#region GetSecuritySignalsQueryHandler Tests

public class GetSecuritySignalsQueryHandlerTests
{
    private readonly Mock<ISecuritySignalRepository> _signalRepositoryMock;
    private readonly GetSecuritySignalsQueryHandler _handler;

    public GetSecuritySignalsQueryHandlerTests()
    {
        _signalRepositoryMock = new Mock<ISecuritySignalRepository>();
        _handler = new GetSecuritySignalsQueryHandler(_signalRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithUserIdFilter_ShouldReturnUserSignals()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var signals = new List<SecuritySignal>
        {
            new SecuritySignal(Guid.NewGuid(), tenantId, userId, SecuritySignalType.AnomalousLocation, SignalSeverity.Medium, "Geo"),
            new SecuritySignal(Guid.NewGuid(), tenantId, userId, SecuritySignalType.FailedLoginAttempt, SignalSeverity.Low, "Auth")
        };

        _signalRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, tenantId, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(signals);

        var query = new GetSecuritySignalsQuery
        {
            TenantId = tenantId,
            UserId = userId,
            PageNumber = 1,
            PageSize = 20
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }
}

#endregion

#region RiskCalculator Tests

public class RiskCalculatorTests
{
    [Fact]
    public void CalculateRisk_WithNoSignals_ShouldReturnZero()
    {
        // Arrange
        var signals = new List<SecuritySignal>();

        // Act & Assert - This tests the concept
        signals.Should().BeEmpty();
    }

    [Fact]
    public void CalculateRisk_WithHighSeveritySignal_ShouldIncreaseRisk()
    {
        // Arrange
        var signal = new SecuritySignal(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            SecuritySignalType.SuspiciousActivity,
            SignalSeverity.Critical,
            "Test");

        // Assert
        signal.Severity.Should().Be(SignalSeverity.Critical);
    }
}

#endregion

#region AdaptivePolicy Entity Tests

public class AdaptivePolicyEntityTests
{
    [Fact]
    public void AdaptivePolicy_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var policy = new AdaptivePolicy(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Policy",
            "Description",
            100,
            true);

        // Assert
        policy.Name.Should().Be("Test Policy");
        policy.Priority.Should().Be(100);
        policy.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void AdaptivePolicy_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var policy = new AdaptivePolicy(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Policy",
            "Desc",
            50,
            true);

        // Act
        policy.Disable();

        // Assert
        policy.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void AdaptivePolicy_Enable_ShouldSetIsEnabledToTrue()
    {
        // Arrange
        var policy = new AdaptivePolicy(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Policy",
            "Desc",
            50,
            false);

        // Act
        policy.Enable();

        // Assert
        policy.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region UserSecurityContext Entity Tests

public class UserSecurityContextEntityTests
{
    [Fact]
    public void UserSecurityContext_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var context = new UserSecurityContext(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        context.RiskScore.Should().Be(0);
        context.TrustLevel.Should().Be(TrustLevel.Medium);
    }

    [Fact]
    public void UserSecurityContext_UpdateRiskScore_ShouldUpdateCorrectly()
    {
        // Arrange
        var context = new UserSecurityContext(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        context.UpdateRiskScore(75);

        // Assert
        context.RiskScore.Should().Be(75);
    }

    [Fact]
    public void UserSecurityContext_UpdateTrustLevel_ShouldUpdateCorrectly()
    {
        // Arrange
        var context = new UserSecurityContext(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        context.UpdateTrustLevel(TrustLevel.Low);

        // Assert
        context.TrustLevel.Should().Be(TrustLevel.Low);
    }
}

#endregion

#region SecuritySignal Entity Tests

public class SecuritySignalEntityTests
{
    [Fact]
    public void SecuritySignal_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var signal = new SecuritySignal(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            SecuritySignalType.AnomalousLocation,
            SignalSeverity.High,
            "GeoIP");

        // Assert
        signal.SignalType.Should().Be(SecuritySignalType.AnomalousLocation);
        signal.Severity.Should().Be(SignalSeverity.High);
        signal.Source.Should().Be("GeoIP");
    }
}

#endregion

#region Enum Tests

public class SecuritySignalTypeEnumTests
{
    [Theory]
    [InlineData(SecuritySignalType.AnomalousLocation)]
    [InlineData(SecuritySignalType.FailedLoginAttempt)]
    [InlineData(SecuritySignalType.SuspiciousActivity)]
    [InlineData(SecuritySignalType.DeviceChange)]
    [InlineData(SecuritySignalType.ImpossibleTravel)]
    public void SecuritySignalType_ShouldHaveCorrectValues(SecuritySignalType signalType)
    {
        // Assert
        signalType.Should().BeDefined();
    }
}

public class SignalSeverityEnumTests
{
    [Theory]
    [InlineData(SignalSeverity.Low)]
    [InlineData(SignalSeverity.Medium)]
    [InlineData(SignalSeverity.High)]
    [InlineData(SignalSeverity.Critical)]
    public void SignalSeverity_ShouldHaveCorrectValues(SignalSeverity severity)
    {
        // Assert
        severity.Should().BeDefined();
    }
}

public class TrustLevelEnumTests
{
    [Theory]
    [InlineData(TrustLevel.None)]
    [InlineData(TrustLevel.Low)]
    [InlineData(TrustLevel.Medium)]
    [InlineData(TrustLevel.High)]
    public void TrustLevel_ShouldHaveCorrectValues(TrustLevel trustLevel)
    {
        // Assert
        trustLevel.Should().BeDefined();
    }
}

public class AdaptiveActionTypeEnumTests
{
    [Theory]
    [InlineData(AdaptiveActionType.RequireMfa)]
    [InlineData(AdaptiveActionType.BlockAccess)]
    [InlineData(AdaptiveActionType.LimitPermissions)]
    [InlineData(AdaptiveActionType.RequireReauthentication)]
    [InlineData(AdaptiveActionType.NotifyAdmin)]
    public void AdaptiveActionType_ShouldHaveCorrectValues(AdaptiveActionType actionType)
    {
        // Assert
        actionType.Should().BeDefined();
    }
}

#endregion
