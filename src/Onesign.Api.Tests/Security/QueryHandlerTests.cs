using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Api.Tests.Security;

#region GetUserMfaMethodsQueryHandler Tests

public class GetUserMfaMethodsQueryHandlerTests
{
    private readonly Mock<IUserMfaMethodRepository> _repositoryMock;
    private readonly GetUserMfaMethodsQueryHandler _handler;

    public GetUserMfaMethodsQueryHandlerTests()
    {
        _repositoryMock = new Mock<IUserMfaMethodRepository>();
        _handler = new GetUserMfaMethodsQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithUserMethods_ShouldReturnMappedDtos()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetUserMfaMethodsQuery { UserId = userId };

        var methods = new List<UserMfaMethod>
        {
            new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.Totp, true, "secret1"),
            new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, false, "secret2")
        };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(methods);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].MethodType.Should().Be((int)MfaMethodType.Totp);
        result[0].IsDefault.Should().BeTrue();
        result[1].MethodType.Should().Be((int)MfaMethodType.EmailOtp);
        result[1].IsDefault.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithNoMethods_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetUserMfaMethodsQuery { UserId = userId };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldMapAllProperties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var methodId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-7);

        var method = new UserMfaMethod(methodId, userId, MfaMethodType.SmsOtp, true, "secret");
        var methods = new List<UserMfaMethod> { method };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(methods);

        // Act
        var result = await _handler.Handle(new GetUserMfaMethodsQuery { UserId = userId }, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].Id.Should().Be(methodId);
        result[0].MethodType.Should().Be((int)MfaMethodType.SmsOtp);
        result[0].IsDefault.Should().BeTrue();
    }
}

#endregion

#region GetSecurityPolicyQueryHandler Tests

public class GetSecurityPolicyQueryHandlerTests
{
    private readonly Mock<ISecurityPolicyRepository> _repositoryMock;
    private readonly GetSecurityPolicyQueryHandler _handler;

    public GetSecurityPolicyQueryHandlerTests()
    {
        _repositoryMock = new Mock<ISecurityPolicyRepository>();
        _handler = new GetSecurityPolicyQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPolicyExists_ShouldReturnMappedDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSecurityPolicyQuery { TenantId = tenantId };

        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.AllUsers, true, 30, true, 5, true, RiskLevel.High);

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.MfaRequirement.Should().Be((int)MfaRequirementLevel.AllUsers);
        result.AllowTrustedDevices.Should().BeTrue();
        result.TrustedDeviceExpireDays.Should().Be(30);
        result.MaxFailedLoginAttempts.Should().Be(5);
    }

    [Fact]
    public async Task Handle_WhenPolicyNotExists_ShouldReturnNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSecurityPolicyQuery { TenantId = tenantId };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityPolicy?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Theory]
    [InlineData(MfaRequirementLevel.None)]
    [InlineData(MfaRequirementLevel.AdminsOnly)]
    [InlineData(MfaRequirementLevel.AllUsers)]
    public async Task Handle_WithDifferentMfaRequirements_ShouldMapCorrectly(MfaRequirementLevel level)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, level, true, 30, true, 5, true, RiskLevel.High);

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _handler.Handle(new GetSecurityPolicyQuery { TenantId = tenantId }, CancellationToken.None);

        // Assert
        result!.MfaRequirement.Should().Be((int)level);
    }
}

#endregion

#region CheckMfaRequirementQueryHandler Tests

public class CheckMfaRequirementQueryHandlerTests
{
    private readonly Mock<ISecurityPolicyService> _policyServiceMock;
    private readonly CheckMfaRequirementQueryHandler _handler;

    public CheckMfaRequirementQueryHandlerTests()
    {
        _policyServiceMock = new Mock<ISecurityPolicyService>();
        _handler = new CheckMfaRequirementQueryHandler(_policyServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMfaRequired_ShouldReturnTrue()
    {
        // Arrange
        var query = new CheckMfaRequirementQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            OrgUnitId = Guid.NewGuid(),
            IsAdmin = false
        };

        _policyServiceMock.Setup(s => s.GetEffectiveMfaRequirementAsync(
            query.UserId, query.TenantId, It.IsAny<List<Guid>>(), query.IsAdmin,
            It.IsAny<bool>(), It.IsAny<RiskLevel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenMfaNotRequired_ShouldReturnFalse()
    {
        // Arrange
        var query = new CheckMfaRequirementQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IsAdmin = false
        };

        _policyServiceMock.Setup(s => s.GetEffectiveMfaRequirementAsync(
            query.UserId, query.TenantId, It.IsAny<List<Guid>>(), query.IsAdmin,
            It.IsAny<bool>(), It.IsAny<RiskLevel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithAdminUser_ShouldPassIsAdminToService()
    {
        // Arrange
        var query = new CheckMfaRequirementQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IsAdmin = true
        };

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _policyServiceMock.Verify(s => s.GetEffectiveMfaRequirementAsync(
            query.UserId, query.TenantId, It.IsAny<List<Guid>>(), true,
            It.IsAny<bool>(), It.IsAny<RiskLevel>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion

#region GetTrustedDevicesQueryHandler Tests

public class GetTrustedDevicesQueryHandlerTests
{
    private readonly Mock<ITrustedDeviceRepository> _repositoryMock;
    private readonly GetTrustedDevicesQueryHandler _handler;

    public GetTrustedDevicesQueryHandlerTests()
    {
        _repositoryMock = new Mock<ITrustedDeviceRepository>();
        _handler = new GetTrustedDevicesQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithDevices_ShouldReturnMappedDtos()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetTrustedDevicesQuery { UserId = userId };

        var devices = new List<TrustedDevice>
        {
            new TrustedDevice(Guid.NewGuid(), userId, "device-1", "iPhone", DateTime.UtcNow.AddDays(30)),
            new TrustedDevice(Guid.NewGuid(), userId, "device-2", "MacBook", DateTime.UtcNow.AddDays(60))
        };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(devices);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].DeviceName.Should().Be("iPhone");
        result[1].DeviceName.Should().Be("MacBook");
    }

    [Fact]
    public async Task Handle_WithNoDevices_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetTrustedDevicesQuery { UserId = userId };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TrustedDevice>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldMapAllProperties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var deviceId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddDays(30);

        var device = new TrustedDevice(deviceId, userId, "device-id", "My Device", expiresAt);
        var devices = new List<TrustedDevice> { device };

        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(devices);

        // Act
        var result = await _handler.Handle(new GetTrustedDevicesQuery { UserId = userId }, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].Id.Should().Be(deviceId);
        result[0].DeviceName.Should().Be("My Device");
        result[0].ExpiresAt.Should().BeCloseTo(expiresAt, TimeSpan.FromSeconds(1));
    }
}

#endregion

#region CheckTrustedDeviceQueryHandler Tests

public class CheckTrustedDeviceQueryHandlerTests
{
    private readonly Mock<IDeviceFingerprintService> _deviceServiceMock;
    private readonly CheckTrustedDeviceQueryHandler _handler;

    public CheckTrustedDeviceQueryHandlerTests()
    {
        _deviceServiceMock = new Mock<IDeviceFingerprintService>();
        _handler = new CheckTrustedDeviceQueryHandler(_deviceServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenDeviceIsTrusted_ShouldReturnTrue()
    {
        // Arrange
        var query = new CheckTrustedDeviceQuery
        {
            UserId = Guid.NewGuid(),
            DeviceFingerprint = "device-fingerprint-123"
        };

        _deviceServiceMock.Setup(s => s.IsTrustedDeviceAsync(
            query.UserId, query.DeviceFingerprint, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenDeviceIsNotTrusted_ShouldReturnFalse()
    {
        // Arrange
        var query = new CheckTrustedDeviceQuery
        {
            UserId = Guid.NewGuid(),
            DeviceFingerprint = "unknown-device"
        };

        _deviceServiceMock.Setup(s => s.IsTrustedDeviceAsync(
            query.UserId, query.DeviceFingerprint, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ShouldPassCorrectParameters()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var fingerprint = "unique-fingerprint";
        var query = new CheckTrustedDeviceQuery
        {
            UserId = userId,
            DeviceFingerprint = fingerprint
        };

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _deviceServiceMock.Verify(s => s.IsTrustedDeviceAsync(
            userId, fingerprint, It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion

#region GetRiskEventsQueryHandler Tests

public class GetRiskEventsQueryHandlerTests
{
    private readonly Mock<IRiskEventRepository> _repositoryMock;
    private readonly GetRiskEventsQueryHandler _handler;

    public GetRiskEventsQueryHandlerTests()
    {
        _repositoryMock = new Mock<IRiskEventRepository>();
        _handler = new GetRiskEventsQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithEvents_ShouldReturnMappedDtos()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        var events = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), tenantId, userId, RiskEventType.SuspiciousActivity,
                RiskLevel.Medium, "192.168.1.1", "US", "device-1", "{}"),
            new RiskEvent(Guid.NewGuid(), tenantId, userId, RiskEventType.NewDeviceLogin,
                RiskLevel.Low, "192.168.1.2", "UK", "device-2", "{}")
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithUserIdFilter_ShouldFilterByUserId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            UserId = userId1,
            PageNumber = 1,
            PageSize = 10
        };

        var events = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), tenantId, userId1, RiskEventType.SuspiciousActivity,
                RiskLevel.Medium, "192.168.1.1", "US", "device-1", "{}"),
            new RiskEvent(Guid.NewGuid(), tenantId, userId2, RiskEventType.NewDeviceLogin,
                RiskLevel.Low, "192.168.1.2", "UK", "device-2", "{}")
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].UserId.Should().Be(userId1);
    }

    [Fact]
    public async Task Handle_WithEventTypeFilter_ShouldFilterByEventType()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            EventType = (int)RiskEventType.SuspiciousActivity,
            PageNumber = 1,
            PageSize = 10
        };

        var events = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), tenantId, Guid.NewGuid(), RiskEventType.SuspiciousActivity,
                RiskLevel.Medium, "192.168.1.1", "US", "device-1", "{}"),
            new RiskEvent(Guid.NewGuid(), tenantId, Guid.NewGuid(), RiskEventType.NewDeviceLogin,
                RiskLevel.Low, "192.168.1.2", "UK", "device-2", "{}")
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].EventType.Should().Be((int)RiskEventType.SuspiciousActivity);
    }

    [Fact]
    public async Task Handle_WithRiskLevelFilter_ShouldFilterByRiskLevel()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            RiskLevel = (int)RiskLevel.High,
            PageNumber = 1,
            PageSize = 10
        };

        var events = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), tenantId, Guid.NewGuid(), RiskEventType.SuspiciousActivity,
                RiskLevel.High, "192.168.1.1", "US", "device-1", "{}"),
            new RiskEvent(Guid.NewGuid(), tenantId, Guid.NewGuid(), RiskEventType.NewDeviceLogin,
                RiskLevel.Low, "192.168.1.2", "UK", "device-2", "{}")
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].RiskLevel.Should().Be((int)RiskLevel.High);
    }

    [Fact]
    public async Task Handle_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 2,
            PageSize = 2
        };

        var events = Enumerable.Range(1, 5).Select(i =>
            new RiskEvent(Guid.NewGuid(), tenantId, Guid.NewGuid(), RiskEventType.SuspiciousActivity,
                RiskLevel.Medium, $"192.168.1.{i}", "US", $"device-{i}", "{}")).ToList();

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithNoEvents_ShouldReturnEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RiskEvent>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldMapAllProperties()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var riskEvent = new RiskEvent(eventId, tenantId, userId, RiskEventType.GeoAnomaly,
            RiskLevel.Medium, "192.168.1.1", "US", "device-1", "{\"key\": \"value\"}");

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RiskEvent> { riskEvent });

        // Act
        var result = await _handler.Handle(new GetRiskEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        }, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].Id.Should().Be(eventId);
        result[0].UserId.Should().Be(userId);
        result[0].EventType.Should().Be((int)RiskEventType.GeoAnomaly);
        result[0].RiskLevel.Should().Be((int)RiskLevel.Medium);
        result[0].IpAddress.Should().Be("192.168.1.1");
        result[0].Location.Should().Be("US");
    }
}

#endregion

#region GetOrgUnitMfaRulesQueryHandler Tests

public class GetOrgUnitMfaRulesQueryHandlerTests
{
    private readonly Mock<IOrgUnitMfaRuleRepository> _repositoryMock;
    private readonly GetOrgUnitMfaRulesQueryHandler _handler;

    public GetOrgUnitMfaRulesQueryHandlerTests()
    {
        _repositoryMock = new Mock<IOrgUnitMfaRuleRepository>();
        _handler = new GetOrgUnitMfaRulesQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithRules_ShouldReturnMappedDtos()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitMfaRulesQuery { TenantId = tenantId };

        var rules = new List<OrgUnitMfaRule>
        {
            new OrgUnitMfaRule(Guid.NewGuid(), tenantId, Guid.NewGuid(), true),
            new OrgUnitMfaRule(Guid.NewGuid(), tenantId, Guid.NewGuid(), false)
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(rules);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithNoRules_ShouldReturnEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitMfaRulesQuery { TenantId = tenantId };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldMapAllProperties()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var ruleId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var rule = new OrgUnitMfaRule(ruleId, tenantId, orgUnitId, true);
        var rules = new List<OrgUnitMfaRule> { rule };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(rules);

        // Act
        var result = await _handler.Handle(new GetOrgUnitMfaRulesQuery { TenantId = tenantId }, CancellationToken.None);

        // Assert
        result.Should().ContainSingle();
        result[0].Id.Should().Be(ruleId);
        result[0].OrgUnitId.Should().Be(orgUnitId);
        result[0].OrgUnitName.Should().BeEmpty(); // As per implementation
    }

    [Fact]
    public async Task Handle_ShouldCallRepositoryWithCorrectTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitMfaRulesQuery { TenantId = tenantId };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule>());

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion
