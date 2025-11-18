using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Tests.Security;

public class DeviceFingerprintServiceTests
{
    private readonly Mock<ITrustedDeviceRepository> _trustedDeviceRepoMock;
    private readonly DeviceFingerprintService _service;

    public DeviceFingerprintServiceTests()
    {
        _trustedDeviceRepoMock = new Mock<ITrustedDeviceRepository>();
        _service = new DeviceFingerprintService(_trustedDeviceRepoMock.Object);
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new DeviceFingerprintService(null!);
        act.Should().Throw<ArgumentNullException>().WithParameterName("trustedDeviceRepository");
    }

    #endregion

    #region GetTrustedDeviceAsync Tests

    [Fact]
    public async Task GetTrustedDeviceAsync_WhenDeviceExists_ShouldReturnDevice()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var device = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        // Act
        var result = await _service.GetTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().NotBeNull();
        result!.DeviceId.Should().Be(deviceId);
        result.TenantUserId.Should().Be(tenantUserId);
    }

    [Fact]
    public async Task GetTrustedDeviceAsync_WhenDeviceNotExists_ShouldReturnNull()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "nonexistent-device";

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TrustedDevice?)null);

        // Act
        var result = await _service.GetTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTrustedDeviceAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.GetTrustedDeviceAsync(Guid.Empty, "device");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetTrustedDeviceAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.GetTrustedDeviceAsync(Guid.NewGuid(), deviceId);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    #endregion

    #region IsTrustedDeviceAsync Tests

    [Fact]
    public async Task IsTrustedDeviceAsync_WhenDeviceExistsAndNotExpired_ShouldReturnTrue()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var device = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        // Act
        var result = await _service.IsTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsTrustedDeviceAsync_WhenDeviceNotExists_ShouldReturnFalse()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "nonexistent-device";

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TrustedDevice?)null);

        // Act
        var result = await _service.IsTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsTrustedDeviceAsync_WhenDeviceIsExpired_ShouldReturnFalse()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var device = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(-1)); // Expired

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        // Act
        var result = await _service.IsTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsTrustedDeviceAsync_WhenDeviceHasNoExpiry_ShouldReturnTrue()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var device = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", null); // No expiry

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        // Act
        var result = await _service.IsTrustedDeviceAsync(tenantUserId, deviceId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsTrustedDeviceAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.IsTrustedDeviceAsync(Guid.Empty, "device");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task IsTrustedDeviceAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.IsTrustedDeviceAsync(Guid.NewGuid(), deviceId);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    #endregion

    #region MarkDeviceAsTrustedAsync Tests

    [Fact]
    public async Task MarkDeviceAsTrustedAsync_WhenDeviceNotExists_ShouldCreateNewDevice()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "new-device";
        var deviceName = "My New Device";
        var rememberDays = 30;

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TrustedDevice?)null);

        // Act
        var result = await _service.MarkDeviceAsTrustedAsync(tenantUserId, deviceId, deviceName, rememberDays);

        // Assert
        result.Should().NotBeNull();
        result.TenantUserId.Should().Be(tenantUserId);
        result.DeviceId.Should().Be(deviceId);
        result.DeviceName.Should().Be(deviceName);
        result.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddDays(rememberDays), TimeSpan.FromMinutes(1));

        _trustedDeviceRepoMock.Verify(r => r.AddAsync(It.IsAny<TrustedDevice>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task MarkDeviceAsTrustedAsync_WhenDeviceExists_ShouldUpdateLastSeen()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "existing-device";
        var existingDevice = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "Old Name", DateTime.UtcNow.AddDays(30));

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDevice);

        // Act
        var result = await _service.MarkDeviceAsTrustedAsync(tenantUserId, deviceId, "New Name", 60);

        // Assert
        result.Should().Be(existingDevice);

        _trustedDeviceRepoMock.Verify(r => r.UpdateAsync(existingDevice, It.IsAny<CancellationToken>()), Times.Once);
        _trustedDeviceRepoMock.Verify(r => r.AddAsync(It.IsAny<TrustedDevice>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task MarkDeviceAsTrustedAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.MarkDeviceAsTrustedAsync(Guid.Empty, "device", "name", 30);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task MarkDeviceAsTrustedAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.MarkDeviceAsTrustedAsync(Guid.NewGuid(), deviceId, "name", 30);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task MarkDeviceAsTrustedAsync_WithNullOrEmptyDeviceName_ShouldThrowArgumentException(string deviceName)
    {
        // Act & Assert
        var act = async () => await _service.MarkDeviceAsTrustedAsync(Guid.NewGuid(), "device", deviceName, 30);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceName");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task MarkDeviceAsTrustedAsync_WithInvalidRememberDays_ShouldThrowArgumentException(int rememberDays)
    {
        // Act & Assert
        var act = async () => await _service.MarkDeviceAsTrustedAsync(Guid.NewGuid(), "device", "name", rememberDays);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("rememberDays");
    }

    #endregion

    #region UpdateDeviceLastSeenAsync Tests

    [Fact]
    public async Task UpdateDeviceLastSeenAsync_WhenDeviceExists_ShouldUpdateLastSeen()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var device = new TrustedDevice(
            Guid.NewGuid(), tenantUserId, deviceId, "My Device", DateTime.UtcNow.AddDays(30));

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        // Act
        await _service.UpdateDeviceLastSeenAsync(tenantUserId, deviceId);

        // Assert
        _trustedDeviceRepoMock.Verify(r => r.UpdateAsync(device, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateDeviceLastSeenAsync_WhenDeviceNotExists_ShouldNotThrow()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "nonexistent-device";

        _trustedDeviceRepoMock.Setup(r => r.GetByDeviceIdAsync(tenantUserId, deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TrustedDevice?)null);

        // Act & Assert
        await FluentActions.Invoking(() => _service.UpdateDeviceLastSeenAsync(tenantUserId, deviceId))
            .Should().NotThrowAsync();

        _trustedDeviceRepoMock.Verify(r => r.UpdateAsync(It.IsAny<TrustedDevice>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateDeviceLastSeenAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.UpdateDeviceLastSeenAsync(Guid.Empty, "device");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateDeviceLastSeenAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.UpdateDeviceLastSeenAsync(Guid.NewGuid(), deviceId);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    #endregion
}
