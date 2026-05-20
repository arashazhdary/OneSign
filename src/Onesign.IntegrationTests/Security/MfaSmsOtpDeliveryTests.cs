using FluentAssertions;
using Moq;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Shared.Email;
using Onesign.Shared.Sms;

namespace Onesign.IntegrationTests.Security;

public class MfaSmsOtpDeliveryTests
{
    [Fact]
    public async Task CreateChallenge_SmsOtp_CallsSmsService()
    {
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var phone = "+15551234567";

        var tenantUserRepo = new Mock<ITenantUserRepository>();
        tenantUserRepo
            .Setup(r => r.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantUser
            {
                Id = tenantUserId,
                GlobalUserId = globalUserId,
                TenantId = Guid.NewGuid(),
            });

        var globalUserRepo = new Mock<IGlobalUserRepository>();
        globalUserRepo
            .Setup(r => r.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GlobalUser
            {
                Id = globalUserId,
                Email = "user@example.com",
                PhoneNumber = phone,
            });

        var mfaService = new Mock<IMfaService>();
        mfaService.Setup(m => m.GenerateOtpCode()).Returns("654321");
        mfaService.Setup(m => m.HashCode("654321")).Returns("hashed-code");

        var smsService = new Mock<ISmsService>();
        smsService
            .Setup(s => s.SendSmsAsync(phone, It.Is<string>(m => m.Contains("654321")), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var challengeRepo = new Mock<IMfaChallengeRepository>();
        challengeRepo
            .Setup(r => r.AddAsync(It.IsAny<MfaChallenge>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var emailService = new Mock<IEmailService>();

        var service = new MfaChallengeService(
            challengeRepo.Object,
            new Mock<IUserMfaMethodRepository>().Object,
            mfaService.Object,
            tenantUserRepo.Object,
            globalUserRepo.Object,
            emailService.Object,
            smsService.Object,
            Microsoft.Extensions.Logging.Abstractions.NullLogger<MfaChallengeService>.Instance);

        await service.CreateChallengeAsync(
            tenantUserId,
            Guid.NewGuid(),
            Guid.NewGuid(),
            MfaMethodType.SmsOtp,
            CancellationToken.None);

        smsService.Verify(
            s => s.SendSmsAsync(phone, It.Is<string>(m => m.Contains("654321")), It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
