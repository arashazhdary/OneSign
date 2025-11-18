using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Api.Tests.Security;

public class MfaChallengeServiceTests
{
    private readonly Mock<IMfaChallengeRepository> _challengeRepoMock;
    private readonly Mock<IUserMfaMethodRepository> _userMfaMethodRepoMock;
    private readonly Mock<IMfaService> _mfaServiceMock;
    private readonly MfaChallengeService _service;

    public MfaChallengeServiceTests()
    {
        _challengeRepoMock = new Mock<IMfaChallengeRepository>();
        _userMfaMethodRepoMock = new Mock<IUserMfaMethodRepository>();
        _mfaServiceMock = new Mock<IMfaService>();

        _service = new MfaChallengeService(
            _challengeRepoMock.Object,
            _userMfaMethodRepoMock.Object,
            _mfaServiceMock.Object
        );
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullMfaChallengeRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new MfaChallengeService(null!, _userMfaMethodRepoMock.Object, _mfaServiceMock.Object);
        act.Should().Throw<ArgumentNullException>().WithParameterName("mfaChallengeRepository");
    }

    [Fact]
    public void Constructor_WithNullUserMfaMethodRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new MfaChallengeService(_challengeRepoMock.Object, null!, _mfaServiceMock.Object);
        act.Should().Throw<ArgumentNullException>().WithParameterName("userMfaMethodRepository");
    }

    [Fact]
    public void Constructor_WithNullMfaService_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new MfaChallengeService(_challengeRepoMock.Object, _userMfaMethodRepoMock.Object, null!);
        act.Should().Throw<ArgumentNullException>().WithParameterName("mfaService");
    }

    #endregion

    #region CreateChallengeAsync Tests

    [Fact]
    public async Task CreateChallengeAsync_WithTotpMethod_ShouldCreateChallengeWithEmptyCodeHash()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";

        // Act
        var result = await _service.CreateChallengeAsync(
            tenantUserId, MfaMethodType.Totp, deviceId, ipAddress);

        // Assert
        result.Should().NotBeNull();
        result.TenantUserId.Should().Be(tenantUserId);
        result.MethodType.Should().Be(MfaMethodType.Totp);
        result.CodeHash.Should().BeEmpty();
        result.DeviceId.Should().Be(deviceId);
        result.IpAddress.Should().Be(ipAddress);
        result.Consumed.Should().BeFalse();

        _challengeRepoMock.Verify(r => r.AddAsync(It.IsAny<MfaChallenge>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateChallengeAsync_WithEmailOtpMethod_ShouldGenerateAndHashCode()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var generatedCode = "123456";
        var hashedCode = "hashed-code";

        _mfaServiceMock.Setup(s => s.GenerateOtpCode()).Returns(generatedCode);
        _mfaServiceMock.Setup(s => s.HashCode(generatedCode)).Returns(hashedCode);

        // Act
        var result = await _service.CreateChallengeAsync(
            tenantUserId, MfaMethodType.EmailOtp, deviceId, ipAddress);

        // Assert
        result.Should().NotBeNull();
        result.MethodType.Should().Be(MfaMethodType.EmailOtp);
        result.CodeHash.Should().Be(hashedCode);

        _mfaServiceMock.Verify(s => s.GenerateOtpCode(), Times.Once);
        _mfaServiceMock.Verify(s => s.HashCode(generatedCode), Times.Once);
    }

    [Fact]
    public async Task CreateChallengeAsync_WithSmsOtpMethod_ShouldGenerateAndHashCode()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var deviceId = "device-123";
        var ipAddress = "192.168.1.1";
        var generatedCode = "654321";
        var hashedCode = "hashed-sms-code";

        _mfaServiceMock.Setup(s => s.GenerateOtpCode()).Returns(generatedCode);
        _mfaServiceMock.Setup(s => s.HashCode(generatedCode)).Returns(hashedCode);

        // Act
        var result = await _service.CreateChallengeAsync(
            tenantUserId, MfaMethodType.SmsOtp, deviceId, ipAddress);

        // Assert
        result.Should().NotBeNull();
        result.MethodType.Should().Be(MfaMethodType.SmsOtp);
        result.CodeHash.Should().Be(hashedCode);
    }

    [Fact]
    public async Task CreateChallengeAsync_ShouldSetExpirationTo5Minutes()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var beforeCreate = DateTime.UtcNow;

        // Act
        var result = await _service.CreateChallengeAsync(
            tenantUserId, MfaMethodType.Totp, "device", "ip");

        // Assert
        result.ExpiresAt.Should().BeAfter(beforeCreate.AddMinutes(4));
        result.ExpiresAt.Should().BeBefore(DateTime.UtcNow.AddMinutes(6));
    }

    [Fact]
    public async Task CreateChallengeAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.CreateChallengeAsync(
            Guid.Empty, MfaMethodType.Totp, "device", "ip");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateChallengeAsync_WithNullOrEmptyDeviceId_ShouldThrowArgumentException(string deviceId)
    {
        // Act & Assert
        var act = async () => await _service.CreateChallengeAsync(
            Guid.NewGuid(), MfaMethodType.Totp, deviceId, "ip");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("deviceId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateChallengeAsync_WithNullOrEmptyIpAddress_ShouldThrowArgumentException(string ipAddress)
    {
        // Act & Assert
        var act = async () => await _service.CreateChallengeAsync(
            Guid.NewGuid(), MfaMethodType.Totp, "device", ipAddress);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("ipAddress");
    }

    [Fact]
    public async Task CreateChallengeAsync_WithUnsupportedMethodType_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.CreateChallengeAsync(
            Guid.NewGuid(), (MfaMethodType)99, "device", "ip");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("methodType");
    }

    #endregion

    #region ValidateAndConsumeChallengeAsync Tests

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithValidTotpCode_ShouldReturnTrueAndConsume()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var secret = "JBSWY3DPEHPK3PXP";
        var code = "123456";

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        var userMfaMethod = new UserMfaMethod(
            Guid.NewGuid(), tenantUserId, MfaMethodType.Totp, true, secret);
        userMfaMethod.MarkAsVerified();

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _userMfaMethodRepoMock.Setup(r => r.GetPrimaryByTenantUserIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userMfaMethod);

        _mfaServiceMock.Setup(s => s.VerifyTotpCode(secret, code)).Returns(true);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, code);

        // Assert
        result.Should().BeTrue();
        challenge.Consumed.Should().BeTrue();

        _challengeRepoMock.Verify(r => r.UpdateAsync(challenge, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithValidEmailOtpCode_ShouldReturnTrue()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var codeHash = "hashed-code";
        var code = "123456";

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.EmailOtp, codeHash,
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _mfaServiceMock.Setup(s => s.VerifyCodeHash(code, codeHash)).Returns(true);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, code);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithValidSmsOtpCode_ShouldReturnTrue()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var codeHash = "hashed-sms-code";
        var code = "654321";

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.SmsOtp, codeHash,
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _mfaServiceMock.Setup(s => s.VerifyCodeHash(code, codeHash)).Returns(true);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, code);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var codeHash = "hashed-code";

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.EmailOtp, codeHash,
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _mfaServiceMock.Setup(s => s.VerifyCodeHash(It.IsAny<string>(), codeHash)).Returns(false);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "wrong-code");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithNonExistentChallenge_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MfaChallenge?)null);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithExpiredChallenge_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var challenge = new MfaChallenge(
            challengeId, Guid.NewGuid(), MfaMethodType.EmailOtp, "hash",
            DateTime.UtcNow.AddMinutes(-1), "device", "ip"); // Expired

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithAlreadyConsumedChallenge_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var challenge = new MfaChallenge(
            challengeId, Guid.NewGuid(), MfaMethodType.EmailOtp, "hash",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");
        challenge.MarkAsConsumed();

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithEmptyChallengeId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.ValidateAndConsumeChallengeAsync(Guid.Empty, "123456");
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("challengeId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAndConsumeChallengeAsync_WithNullOrEmptyCode_ShouldReturnFalse(string code)
    {
        // Arrange
        var challengeId = Guid.NewGuid();

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, code);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithTotpButNoUserMethod_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _userMfaMethodRepoMock.Setup(r => r.GetPrimaryByTenantUserIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserMfaMethod?)null);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithUnverifiedMfaMethod_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        var userMfaMethod = new UserMfaMethod(
            Guid.NewGuid(), tenantUserId, MfaMethodType.Totp, true, "secret");
        // Not verified

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _userMfaMethodRepoMock.Setup(r => r.GetPrimaryByTenantUserIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userMfaMethod);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeChallengeAsync_WithMismatchedMethodType_ShouldReturnFalse()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var challenge = new MfaChallenge(
            challengeId, tenantUserId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        var userMfaMethod = new UserMfaMethod(
            Guid.NewGuid(), tenantUserId, MfaMethodType.EmailOtp, true, "secret");
        userMfaMethod.MarkAsVerified();

        _challengeRepoMock.Setup(r => r.GetByIdAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _userMfaMethodRepoMock.Setup(r => r.GetPrimaryByTenantUserIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userMfaMethod);

        // Act
        var result = await _service.ValidateAndConsumeChallengeAsync(challengeId, "123456");

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}
