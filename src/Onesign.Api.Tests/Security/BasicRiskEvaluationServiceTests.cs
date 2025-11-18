using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Tests.Security;

public class BasicRiskEvaluationServiceTests
{
    private readonly Mock<ITrustedDeviceRepository> _trustedDeviceRepoMock;
    private readonly Mock<IRiskEventRepository> _riskEventRepoMock;
    private readonly BasicRiskEvaluationService _service;

    public BasicRiskEvaluationServiceTests()
    {
        _trustedDeviceRepoMock = new Mock<ITrustedDeviceRepository>();
        _riskEventRepoMock = new Mock<IRiskEventRepository>();

        _service = new BasicRiskEvaluationService(
            _trustedDeviceRepoMock.Object,
            _riskEventRepoMock.Object
        );
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullTrustedDeviceRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new BasicRiskEvaluationService(null!, _riskEventRepoMock.Object);
        act.Should().Throw<ArgumentNullException>().WithParameterName("trustedDeviceRepository");
    }

    [Fact]
    public void Constructor_WithNullRiskEventRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new BasicRiskEvaluationService(_trustedDeviceRepoMock.Object, null!);
        act.Should().Throw<ArgumentNullException>().WithParameterName("riskEventRepository");
    }

    #endregion

    #region EvaluateLoginRiskAsync Tests

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithTrustedDeviceAndNoRiskFactors_ShouldReturnLow()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var country = "US";

        var trustedDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trustedDevice);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RiskEvent>());

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, country);

        // Assert
        result.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithNewDevice_ShouldReturnMedium()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "new-device";
        var ipAddress = "192.168.1.1";
        var country = "US";

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TrustedDevice?)null);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RiskEvent>());

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, country);

        // Assert
        result.Should().Be(RiskLevel.Medium);

        // Verify risk event was recorded
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.EventType == RiskEventType.NewDeviceLogin),
            It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithExpiredDevice_ShouldReturnMedium()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "expired-device";
        var ipAddress = "192.168.1.1";
        var country = "US";

        var expiredDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(-1)); // Expired

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expiredDevice);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RiskEvent>());

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, country);

        // Assert
        result.Should().Be(RiskLevel.Medium);
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithNewCountry_ShouldReturnMedium()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var newCountry = "DE"; // New country

        var trustedDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        // Past events from different countries but not the new one
        var pastEvents = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), null, tenantUserId, RiskEventType.SuspiciousActivity,
                RiskLevel.Low, "192.168.1.1", "US", deviceId, "{}"),
            new RiskEvent(Guid.NewGuid(), null, tenantUserId, RiskEventType.SuspiciousActivity,
                RiskLevel.Low, "192.168.1.2", "UK", deviceId, "{}")
        };

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trustedDevice);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pastEvents);

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, newCountry);

        // Assert
        result.Should().Be(RiskLevel.Medium);
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithMultipleFailedLogins_ShouldReturnHigh()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var country = "US";

        var trustedDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        // More than 3 failed login events in last 10 minutes
        var recentFailedLogins = Enumerable.Range(0, 5).Select(_ =>
            new RiskEvent(Guid.NewGuid(), null, tenantUserId, RiskEventType.MultipleFailedLogins,
                RiskLevel.Medium, ipAddress, country, deviceId, "{}")).ToList();

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trustedDevice);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(recentFailedLogins);

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, country);

        // Assert
        result.Should().Be(RiskLevel.High);

        // Verify high risk event was recorded
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.RiskLevel == RiskLevel.High),
            It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.EvaluateLoginRiskAsync(Guid.Empty, "device", "ip", "country");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task EvaluateLoginRiskAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.EvaluateLoginRiskAsync(Guid.NewGuid(), deviceId, "ip", "country");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task EvaluateLoginRiskAsync_WithNullOrEmptyIpAddress_ShouldThrowArgumentException(string ipAddress)
    {
        // Act & Assert
        var act = async () => await _service.EvaluateLoginRiskAsync(Guid.NewGuid(), "device", ipAddress, "country");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("ipAddress");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task EvaluateLoginRiskAsync_WithNullOrEmptyCountry_ShouldThrowArgumentException(string country)
    {
        // Act & Assert
        var act = async () => await _service.EvaluateLoginRiskAsync(Guid.NewGuid(), "device", "ip", country);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("country");
    }

    [Fact]
    public async Task EvaluateLoginRiskAsync_WithSameCountryHistory_ShouldNotTriggerGeoAnomaly()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var country = "US";

        var trustedDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        // Past events from same country
        var pastEvents = new List<RiskEvent>
        {
            new RiskEvent(Guid.NewGuid(), null, tenantUserId, RiskEventType.SuspiciousActivity,
                RiskLevel.Low, "192.168.1.1", "US", deviceId, "{}")
        };

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trustedDevice);

        _riskEventRepoMock.Setup(r => r.GetByTenantIdAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<RiskLevel?>(), It.IsAny<RiskEventType?>(), tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pastEvents);

        // Act
        var result = await _service.EvaluateLoginRiskAsync(tenantUserId, deviceId, ipAddress, country);

        // Assert
        result.Should().Be(RiskLevel.Low);
    }

    #endregion

    #region RecordRiskEventAsync Tests

    [Fact]
    public async Task RecordRiskEventAsync_WithValidData_ShouldCreateRiskEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        // Act
        await _service.RecordRiskEventAsync(
            tenantId, tenantUserId, RiskEventType.SuspiciousActivity, RiskLevel.Medium,
            "192.168.1.1", "US", "device-123", "{\"key\": \"value\"}");

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e =>
                e.TenantId == tenantId &&
                e.TenantUserId == tenantUserId &&
                e.EventType == RiskEventType.SuspiciousActivity &&
                e.RiskLevel == RiskLevel.Medium &&
                e.IpAddress == "192.168.1.1" &&
                e.Country == "US" &&
                e.DeviceId == "device-123"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RecordRiskEventAsync_WithNullTenantId_ShouldStillRecord()
    {
        // Act
        await _service.RecordRiskEventAsync(
            null, Guid.NewGuid(), RiskEventType.SuspiciousActivity, RiskLevel.Low,
            "192.168.1.1", "US", "device", "{}");

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.TenantId == null),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RecordRiskEventAsync_WithNullTenantUserId_ShouldStillRecord()
    {
        // Act
        await _service.RecordRiskEventAsync(
            Guid.NewGuid(), null, RiskEventType.SuspiciousActivity, RiskLevel.Low,
            "192.168.1.1", "US", "device", "{}");

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.TenantUserId == null),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RecordRiskEventAsync_WithNullDetailsJson_ShouldUseEmptyObject()
    {
        // Act
        await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), RiskEventType.SuspiciousActivity, RiskLevel.Low,
            "192.168.1.1", "US", "device", null!);

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.DetailsJson == "{}"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RecordRiskEventAsync_WithNullOrEmptyIpAddress_ShouldThrowArgumentException(string ipAddress)
    {
        // Act & Assert
        var act = async () => await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), RiskEventType.SuspiciousActivity, RiskLevel.Low,
            ipAddress, "US", "device", "{}");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("ipAddress");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RecordRiskEventAsync_WithNullOrEmptyCountry_ShouldThrowArgumentException(string country)
    {
        // Act & Assert
        var act = async () => await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), RiskEventType.SuspiciousActivity, RiskLevel.Low,
            "192.168.1.1", country, "device", "{}");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("country");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RecordRiskEventAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), RiskEventType.SuspiciousActivity, RiskLevel.Low,
            "192.168.1.1", "US", deviceId, "{}");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    [Theory]
    [InlineData(RiskEventType.NewDeviceLogin)]
    [InlineData(RiskEventType.GeoAnomaly)]
    [InlineData(RiskEventType.MultipleFailedLogins)]
    [InlineData(RiskEventType.SuspiciousActivity)]
    public async Task RecordRiskEventAsync_WithDifferentEventTypes_ShouldRecordCorrectly(RiskEventType eventType)
    {
        // Act
        await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), eventType, RiskLevel.Medium,
            "192.168.1.1", "US", "device", "{}");

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.EventType == eventType),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(RiskLevel.Low)]
    [InlineData(RiskLevel.Medium)]
    [InlineData(RiskLevel.High)]
    public async Task RecordRiskEventAsync_WithDifferentRiskLevels_ShouldRecordCorrectly(RiskLevel riskLevel)
    {
        // Act
        await _service.RecordRiskEventAsync(
            Guid.NewGuid(), Guid.NewGuid(), RiskEventType.SuspiciousActivity, riskLevel,
            "192.168.1.1", "US", "device", "{}");

        // Assert
        _riskEventRepoMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.RiskLevel == riskLevel),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
