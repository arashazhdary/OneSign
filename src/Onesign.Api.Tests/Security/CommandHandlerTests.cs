using Xunit;
using Moq;
using FluentAssertions;
using MediatR;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Api.Tests.Security;

#region BeginTotpEnrollmentCommandHandler Tests

public class BeginTotpEnrollmentCommandHandlerTests
{
    private readonly Mock<IMfaService> _mfaServiceMock;
    private readonly BeginTotpEnrollmentCommandHandler _handler;

    public BeginTotpEnrollmentCommandHandlerTests()
    {
        _mfaServiceMock = new Mock<IMfaService>();
        _handler = new BeginTotpEnrollmentCommandHandler(_mfaServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldGenerateSecretAndQrCodeUri()
    {
        // Arrange
        var command = new BeginTotpEnrollmentCommand
        {
            UserId = Guid.NewGuid(),
            UserEmail = "test@example.com"
        };

        var secret = "JBSWY3DPEHPK3PXP";
        var qrCodeUri = "otpauth://totp/OneSign:test@example.com?secret=" + secret;

        _mfaServiceMock.Setup(s => s.GenerateTotpSecret()).Returns(secret);
        _mfaServiceMock.Setup(s => s.GenerateOtpauthUrl(secret, It.IsAny<string>(), command.UserEmail))
            .Returns(qrCodeUri);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Secret.Should().Be(secret);
        result.QrCodeUri.Should().Be(qrCodeUri);
    }

    [Fact]
    public async Task Handle_WithDifferentEmails_ShouldGenerateUniqueQrCodes()
    {
        // Arrange
        var email1 = "user1@example.com";
        var email2 = "user2@example.com";
        var secret = "JBSWY3DPEHPK3PXP";

        _mfaServiceMock.Setup(s => s.GenerateTotpSecret()).Returns(secret);
        _mfaServiceMock.Setup(s => s.GenerateOtpauthUrl(secret, It.IsAny<string>(), email1))
            .Returns($"otpauth://totp/OneSign:{email1}?secret={secret}");
        _mfaServiceMock.Setup(s => s.GenerateOtpauthUrl(secret, It.IsAny<string>(), email2))
            .Returns($"otpauth://totp/OneSign:{email2}?secret={secret}");

        // Act
        var result1 = await _handler.Handle(new BeginTotpEnrollmentCommand { UserEmail = email1 }, CancellationToken.None);
        var result2 = await _handler.Handle(new BeginTotpEnrollmentCommand { UserEmail = email2 }, CancellationToken.None);

        // Assert
        result1.QrCodeUri.Should().Contain(email1);
        result2.QrCodeUri.Should().Contain(email2);
    }
}

#endregion

#region ConfirmTotpEnrollmentCommandHandler Tests

public class ConfirmTotpEnrollmentCommandHandlerTests
{
    private readonly Mock<IUserMfaMethodRepository> _repositoryMock;
    private readonly Mock<IMfaService> _mfaServiceMock;
    private readonly ConfirmTotpEnrollmentCommandHandler _handler;

    public ConfirmTotpEnrollmentCommandHandlerTests()
    {
        _repositoryMock = new Mock<IUserMfaMethodRepository>();
        _mfaServiceMock = new Mock<IMfaService>();
        _handler = new ConfirmTotpEnrollmentCommandHandler(_repositoryMock.Object, _mfaServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCode_ShouldCreateMfaMethod()
    {
        // Arrange
        var command = new ConfirmTotpEnrollmentCommand
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Secret = "JBSWY3DPEHPK3PXP",
            Code = "123456"
        };

        _mfaServiceMock.Setup(s => s.VerifyTotpCode(command.Secret, command.Code)).Returns(true);
        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(command.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.MethodType.Should().Be((int)MfaMethodType.Totp);
        result.IsDefault.Should().BeTrue();

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<UserMfaMethod>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var command = new ConfirmTotpEnrollmentCommand
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Secret = "JBSWY3DPEHPK3PXP",
            Code = "000000"
        };

        _mfaServiceMock.Setup(s => s.VerifyTotpCode(command.Secret, command.Code)).Returns(false);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Invalid TOTP code*");
    }

    [Fact]
    public async Task Handle_WhenUserHasExistingMethods_ShouldNotSetAsDefault()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new ConfirmTotpEnrollmentCommand
        {
            UserId = userId,
            TenantId = Guid.NewGuid(),
            Secret = "JBSWY3DPEHPK3PXP",
            Code = "123456"
        };

        var existingMethod = new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, true, "secret");

        _mfaServiceMock.Setup(s => s.VerifyTotpCode(command.Secret, command.Code)).Returns(true);
        _repositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod> { existingMethod });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsDefault.Should().BeFalse();
    }
}

#endregion

#region DisableMfaMethodCommandHandler Tests

public class DisableMfaMethodCommandHandlerTests
{
    private readonly Mock<IUserMfaMethodRepository> _repositoryMock;
    private readonly DisableMfaMethodCommandHandler _handler;

    public DisableMfaMethodCommandHandlerTests()
    {
        _repositoryMock = new Mock<IUserMfaMethodRepository>();
        _handler = new DisableMfaMethodCommandHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidMethod_ShouldDeleteMethod()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var methodId = Guid.NewGuid();
        var command = new DisableMfaMethodCommand
        {
            UserId = userId,
            MethodId = methodId
        };

        var method = new UserMfaMethod(methodId, userId, MfaMethodType.Totp, true, "secret");

        _repositoryMock.Setup(r => r.GetByIdAsync(methodId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(method);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _repositoryMock.Verify(r => r.DeleteAsync(methodId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentMethod_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var command = new DisableMfaMethodCommand
        {
            UserId = Guid.NewGuid(),
            MethodId = Guid.NewGuid()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(command.MethodId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserMfaMethod?)null);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*MFA method not found*");
    }

    [Fact]
    public async Task Handle_WithMethodBelongingToDifferentUser_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var methodId = Guid.NewGuid();

        var command = new DisableMfaMethodCommand
        {
            UserId = userId,
            MethodId = methodId
        };

        var method = new UserMfaMethod(methodId, differentUserId, MfaMethodType.Totp, true, "secret");

        _repositoryMock.Setup(r => r.GetByIdAsync(methodId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(method);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}

#endregion

#region CreateMfaChallengeCommandHandler Tests

public class CreateMfaChallengeCommandHandlerTests
{
    private readonly Mock<IUserMfaMethodRepository> _methodRepositoryMock;
    private readonly Mock<IMfaChallengeService> _challengeServiceMock;
    private readonly Mock<IMfaService> _mfaServiceMock;
    private readonly CreateMfaChallengeCommandHandler _handler;

    public CreateMfaChallengeCommandHandlerTests()
    {
        _methodRepositoryMock = new Mock<IUserMfaMethodRepository>();
        _challengeServiceMock = new Mock<IMfaChallengeService>();
        _mfaServiceMock = new Mock<IMfaService>();
        _handler = new CreateMfaChallengeCommandHandler(
            _methodRepositoryMock.Object,
            _challengeServiceMock.Object,
            _mfaServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithNoMfaMethods_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var command = new CreateMfaChallengeCommand
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserEmail = "test@example.com"
        };

        _methodRepositoryMock.Setup(r => r.GetByTenantUserIdAsync(command.UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod>());

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*no MFA methods*");
    }

    [Fact]
    public async Task Handle_WithDefaultMethod_ShouldUseDefaultMethod()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var methodId = Guid.NewGuid();
        var challengeId = Guid.NewGuid();

        var command = new CreateMfaChallengeCommand
        {
            UserId = userId,
            TenantId = tenantId,
            UserEmail = "test@example.com"
        };

        var defaultMethod = new UserMfaMethod(methodId, userId, MfaMethodType.Totp, true, "secret");
        var challenge = new MfaChallenge(challengeId, userId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _methodRepositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod> { defaultMethod });

        _challengeServiceMock.Setup(s => s.CreateChallengeAsync(
            userId, tenantId, methodId, MfaMethodType.Totp, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.ChallengeId.Should().Be(challengeId);
        result.MethodType.Should().Be((int)MfaMethodType.Totp);
    }

    [Fact]
    public async Task Handle_WithPreferredMethodType_ShouldUsePreferredMethod()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var command = new CreateMfaChallengeCommand
        {
            UserId = userId,
            TenantId = tenantId,
            PreferredMethodType = (int)MfaMethodType.EmailOtp,
            UserEmail = "test@example.com"
        };

        var totpMethod = new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.Totp, true, "secret");
        var emailMethod = new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, false, "secret");
        var challenge = new MfaChallenge(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, "hash",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _methodRepositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod> { totpMethod, emailMethod });

        _challengeServiceMock.Setup(s => s.CreateChallengeAsync(
            userId, tenantId, emailMethod.Id, MfaMethodType.EmailOtp, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _mfaServiceMock.Setup(s => s.GenerateOtpCode()).Returns("123456");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.MethodType.Should().Be((int)MfaMethodType.EmailOtp);
        result.MaskedDestination.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_WithEmailOtp_ShouldMaskEmailCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new CreateMfaChallengeCommand
        {
            UserId = userId,
            TenantId = Guid.NewGuid(),
            UserEmail = "testuser@example.com"
        };

        var emailMethod = new UserMfaMethod(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, true, "secret");
        var challenge = new MfaChallenge(Guid.NewGuid(), userId, MfaMethodType.EmailOtp, "hash",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _methodRepositoryMock.Setup(r => r.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod> { emailMethod });

        _challengeServiceMock.Setup(s => s.CreateChallengeAsync(
            It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), MfaMethodType.EmailOtp, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        _mfaServiceMock.Setup(s => s.GenerateOtpCode()).Returns("123456");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.MaskedDestination.Should().Be("t***r@example.com");
    }
}

#endregion

#region VerifyMfaChallengeCommandHandler Tests

public class VerifyMfaChallengeCommandHandlerTests
{
    private readonly Mock<IMfaChallengeService> _challengeServiceMock;
    private readonly Mock<IDeviceFingerprintService> _deviceServiceMock;
    private readonly VerifyMfaChallengeCommandHandler _handler;

    public VerifyMfaChallengeCommandHandlerTests()
    {
        _challengeServiceMock = new Mock<IMfaChallengeService>();
        _deviceServiceMock = new Mock<IDeviceFingerprintService>();
        _handler = new VerifyMfaChallengeCommandHandler(_challengeServiceMock.Object, _deviceServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var command = new VerifyMfaChallengeCommand
        {
            ChallengeId = challengeId,
            Code = "123456",
            RememberDevice = false
        };

        _challengeServiceMock.Setup(s => s.ValidateAndConsumeChallengeAsync(
            challengeId, command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var command = new VerifyMfaChallengeCommand
        {
            ChallengeId = Guid.NewGuid(),
            Code = "000000",
            RememberDevice = false
        };

        _challengeServiceMock.Setup(s => s.ValidateAndConsumeChallengeAsync(
            It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithRememberDevice_ShouldMarkDeviceAsTrusted()
    {
        // Arrange
        var challengeId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var deviceFingerprint = "device-fingerprint-123";

        var command = new VerifyMfaChallengeCommand
        {
            ChallengeId = challengeId,
            Code = "123456",
            RememberDevice = true,
            DeviceFingerprint = deviceFingerprint
        };

        var challenge = new MfaChallenge(challengeId, userId, MfaMethodType.Totp, "",
            DateTime.UtcNow.AddMinutes(5), "device", "ip");

        _challengeServiceMock.Setup(s => s.ValidateAndConsumeChallengeAsync(
            challengeId, command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _challengeServiceMock.Setup(s => s.GetChallengeAsync(challengeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(challenge);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _deviceServiceMock.Verify(s => s.MarkDeviceAsTrustedAsync(
            userId, tenantId, deviceFingerprint, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithRememberDeviceButNoFingerprint_ShouldNotMarkDevice()
    {
        // Arrange
        var command = new VerifyMfaChallengeCommand
        {
            ChallengeId = Guid.NewGuid(),
            Code = "123456",
            RememberDevice = true,
            DeviceFingerprint = null
        };

        _challengeServiceMock.Setup(s => s.ValidateAndConsumeChallengeAsync(
            It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _deviceServiceMock.Verify(s => s.MarkDeviceAsTrustedAsync(
            It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

#endregion

#region UpdateSecurityPolicyCommandHandler Tests

public class UpdateSecurityPolicyCommandHandlerTests
{
    private readonly Mock<ISecurityPolicyRepository> _repositoryMock;
    private readonly UpdateSecurityPolicyCommandHandler _handler;

    public UpdateSecurityPolicyCommandHandlerTests()
    {
        _repositoryMock = new Mock<ISecurityPolicyRepository>();
        _handler = new UpdateSecurityPolicyCommandHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenNoPolicyExists_ShouldCreateNewPolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new UpdateSecurityPolicyCommand
        {
            TenantId = tenantId,
            MfaRequirement = (int)MfaRequirementLevel.AllUsers,
            AllowTrustedDevices = true,
            TrustedDeviceExpireDays = 30,
            SessionTimeoutMinutes = 60,
            MaxFailedLoginAttempts = 5
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityPolicy?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TenantId.Should().Be(tenantId);
        result.MfaRequirement.Should().Be((int)MfaRequirementLevel.AllUsers);

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<SecurityPolicy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPolicyExists_ShouldUpdateExistingPolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var existingPolicy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, false, 7, false, 3, false, RiskLevel.High);

        var command = new UpdateSecurityPolicyCommand
        {
            TenantId = tenantId,
            MfaRequirement = (int)MfaRequirementLevel.AdminsOnly,
            AllowTrustedDevices = true,
            TrustedDeviceExpireDays = 14,
            SessionTimeoutMinutes = 30,
            MaxFailedLoginAttempts = 10
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.UpdateAsync(existingPolicy, It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion

#region UpdateOrgUnitMfaRulesCommandHandler Tests

public class UpdateOrgUnitMfaRulesCommandHandlerTests
{
    private readonly Mock<IOrgUnitMfaRuleRepository> _repositoryMock;
    private readonly UpdateOrgUnitMfaRulesCommandHandler _handler;

    public UpdateOrgUnitMfaRulesCommandHandlerTests()
    {
        _repositoryMock = new Mock<IOrgUnitMfaRuleRepository>();
        _handler = new UpdateOrgUnitMfaRulesCommandHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithNewRules_ShouldAddNewRules()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var command = new UpdateOrgUnitMfaRulesCommand
        {
            TenantId = tenantId,
            Rules = new List<OrgUnitMfaRuleItem>
            {
                new OrgUnitMfaRuleItem { OrgUnitId = orgUnitId, MfaRequirement = (int)MfaRequirementLevel.AllUsers }
            }
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<OrgUnitMfaRule>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithExistingRules_ShouldUpdateExistingRules()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var existingRule = new OrgUnitMfaRule(Guid.NewGuid(), tenantId, orgUnitId, false);

        var command = new UpdateOrgUnitMfaRulesCommand
        {
            TenantId = tenantId,
            Rules = new List<OrgUnitMfaRuleItem>
            {
                new OrgUnitMfaRuleItem { OrgUnitId = orgUnitId, MfaRequirement = (int)MfaRequirementLevel.AllUsers }
            }
        };

        _repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule> { existingRule });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.UpdateAsync(existingRule, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<OrgUnitMfaRule>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

#endregion

#region RecordRiskEventCommandHandler Tests

public class RecordRiskEventCommandHandlerTests
{
    private readonly Mock<IRiskEventRepository> _repositoryMock;
    private readonly RecordRiskEventCommandHandler _handler;

    public RecordRiskEventCommandHandlerTests()
    {
        _repositoryMock = new Mock<IRiskEventRepository>();
        _handler = new RecordRiskEventCommandHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateRiskEvent()
    {
        // Arrange
        var command = new RecordRiskEventCommand
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            EventType = (int)RiskEventType.SuspiciousActivity,
            RiskLevel = (int)RiskLevel.Medium,
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            Location = "New York, US",
            Details = "Suspicious login attempt"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _repositoryMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e =>
                e.EventType == RiskEventType.SuspiciousActivity &&
                e.RiskLevel == RiskLevel.Medium),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(RiskEventType.NewDeviceLogin, RiskLevel.Low)]
    [InlineData(RiskEventType.GeoAnomaly, RiskLevel.Medium)]
    [InlineData(RiskEventType.MultipleFailedLogins, RiskLevel.High)]
    public async Task Handle_WithDifferentEventTypesAndLevels_ShouldRecordCorrectly(RiskEventType eventType, RiskLevel riskLevel)
    {
        // Arrange
        var command = new RecordRiskEventCommand
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            EventType = (int)eventType,
            RiskLevel = (int)riskLevel,
            IpAddress = "192.168.1.1"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.AddAsync(
            It.Is<RiskEvent>(e => e.EventType == eventType && e.RiskLevel == riskLevel),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion
