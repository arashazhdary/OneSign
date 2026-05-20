using Microsoft.Extensions.Logging;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;
using Onesign.Shared.Email;
using Onesign.Shared.Sms;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class MfaChallengeService : IMfaChallengeService
{
    private readonly IMfaChallengeRepository _mfaChallengeRepository;
    private readonly IUserMfaMethodRepository _userMfaMethodRepository;
    private readonly IMfaService _mfaService;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ILogger<MfaChallengeService> _logger;

    public MfaChallengeService(
        IMfaChallengeRepository mfaChallengeRepository,
        IUserMfaMethodRepository userMfaMethodRepository,
        IMfaService mfaService,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IEmailService emailService,
        ISmsService smsService,
        ILogger<MfaChallengeService> logger)
    {
        _mfaChallengeRepository = mfaChallengeRepository ?? throw new ArgumentNullException(nameof(mfaChallengeRepository));
        _userMfaMethodRepository = userMfaMethodRepository ?? throw new ArgumentNullException(nameof(userMfaMethodRepository));
        _mfaService = mfaService ?? throw new ArgumentNullException(nameof(mfaService));
        _tenantUserRepository = tenantUserRepository ?? throw new ArgumentNullException(nameof(tenantUserRepository));
        _globalUserRepository = globalUserRepository ?? throw new ArgumentNullException(nameof(globalUserRepository));
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<MfaChallenge> CreateChallengeAsync(
        Guid tenantUserId,
        MfaMethodType methodType,
        string deviceId,
        string ipAddress,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        if (string.IsNullOrWhiteSpace(ipAddress))
            throw new ArgumentException("IpAddress cannot be null or empty", nameof(ipAddress));

        string codeHash;

        if (methodType == MfaMethodType.Totp)
        {
            // For TOTP, we don't store a code hash as verification happens against the user's secret
            codeHash = string.Empty;
        }
        else if (methodType == MfaMethodType.EmailOtp || methodType == MfaMethodType.SmsOtp)
        {
            // For OTP methods, generate a code and hash it
            var otpCode = _mfaService.GenerateOtpCode();
            codeHash = _mfaService.HashCode(otpCode);

            // Send the OTP code via email or SMS
            await SendOtpCodeAsync(tenantUserId, methodType, otpCode, cancellationToken);
        }
        else
        {
            throw new ArgumentException($"Unsupported MFA method type: {methodType}", nameof(methodType));
        }

        var challenge = new MfaChallenge(
            id: Guid.NewGuid(),
            tenantUserId: tenantUserId,
            methodType: methodType,
            codeHash: codeHash,
            expiresAt: DateTime.UtcNow.AddMinutes(5),
            deviceId: deviceId,
            ipAddress: ipAddress
        );

        await _mfaChallengeRepository.AddAsync(challenge, cancellationToken);

        return challenge;
    }

    public async Task<bool> ValidateAndConsumeChallengeAsync(
        Guid challengeId,
        string code,
        CancellationToken cancellationToken = default)
    {
        if (challengeId == Guid.Empty)
            throw new ArgumentException("ChallengeId cannot be empty", nameof(challengeId));

        if (string.IsNullOrWhiteSpace(code))
            return false;

        var challenge = await _mfaChallengeRepository.GetByIdAsync(challengeId, cancellationToken);

        if (challenge == null)
            return false;

        // Check if challenge is already consumed
        if (challenge.Consumed)
            return false;

        // Check if challenge is expired
        if (challenge.IsExpired())
            return false;

        bool isValid = false;

        if (challenge.MethodType == MfaMethodType.Totp)
        {
            // For TOTP, verify against the user's stored secret
            var userMfaMethod = await _userMfaMethodRepository.GetPrimaryByTenantUserIdAsync(
                challenge.TenantUserId,
                cancellationToken);

            if (userMfaMethod == null || userMfaMethod.MethodType != MfaMethodType.Totp)
            {
                // User doesn't have a TOTP method set up
                return false;
            }

            if (!userMfaMethod.IsVerified)
            {
                // MFA method is not verified yet
                return false;
            }

            // Verify the TOTP code against the user's secret
            // Note: In a real implementation, the secret should be decrypted first
            // For now, we assume SecretEncrypted contains the actual secret
            isValid = _mfaService.VerifyTotpCode(userMfaMethod.SecretEncrypted, code);
        }
        else if (challenge.MethodType == MfaMethodType.EmailOtp || challenge.MethodType == MfaMethodType.SmsOtp)
        {
            // For OTP methods, verify against the stored hash
            isValid = _mfaService.VerifyCodeHash(code, challenge.CodeHash);
        }
        else
        {
            // Unsupported method type
            return false;
        }

        if (isValid)
        {
            // Mark challenge as consumed
            challenge.MarkAsConsumed();
            await _mfaChallengeRepository.UpdateAsync(challenge, cancellationToken);
            return true;
        }

        return false;
    }

    public async Task<MfaChallenge> CreateChallengeAsync(
        Guid tenantUserId,
        Guid tenantId,
        Guid methodId,
        MfaMethodType methodType,
        CancellationToken cancellationToken = default)
    {
        var codeHash = string.Empty;

        if (methodType == MfaMethodType.EmailOtp || methodType == MfaMethodType.SmsOtp)
        {
            var otpCode = _mfaService.GenerateOtpCode();
            codeHash = _mfaService.HashCode(otpCode);
            await SendOtpCodeAsync(tenantUserId, methodType, otpCode, cancellationToken);
        }

        var challenge = new MfaChallenge(
            id: Guid.NewGuid(),
            tenantUserId: tenantUserId,
            methodType: methodType,
            codeHash: codeHash,
            expiresAt: DateTime.UtcNow.AddMinutes(5),
            deviceId: string.Empty,
            ipAddress: string.Empty
        )
        {
            TenantId = tenantId
        };

        await _mfaChallengeRepository.AddAsync(challenge, cancellationToken);
        return challenge;
    }

    public async Task<bool> VerifyChallengeAsync(
        Guid challengeId,
        string code,
        CancellationToken cancellationToken = default)
    {
        return await ValidateAndConsumeChallengeAsync(challengeId, code, cancellationToken);
    }

    public async Task<MfaChallenge?> GetChallengeAsync(
        Guid challengeId,
        CancellationToken cancellationToken = default)
    {
        return await _mfaChallengeRepository.GetByIdAsync(challengeId, cancellationToken);
    }

    public async Task SetChallengeCodeAsync(
        Guid challengeId,
        string code,
        CancellationToken cancellationToken = default)
    {
        var challenge = await _mfaChallengeRepository.GetByIdAsync(challengeId, cancellationToken);
        if (challenge != null)
        {
            var codeHash = _mfaService.HashCode(code);
            challenge.SetCodeHash(codeHash);
            await _mfaChallengeRepository.UpdateAsync(challenge, cancellationToken);
        }
    }

    private async Task SendOtpCodeAsync(
        Guid tenantUserId,
        MfaMethodType methodType,
        string otpCode,
        CancellationToken cancellationToken)
    {
        // Get user information to find their email/phone
        var tenantUser = await _tenantUserRepository.GetByIdAsync(tenantUserId, cancellationToken);
        if (tenantUser == null)
        {
            _logger.LogWarning("Cannot send OTP: TenantUser {TenantUserId} not found", tenantUserId);
            return;
        }

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);
        if (globalUser == null)
        {
            _logger.LogWarning("Cannot send OTP: GlobalUser {GlobalUserId} not found for TenantUser {TenantUserId}",
                tenantUser.GlobalUserId, tenantUserId);
            return;
        }

        if (methodType == MfaMethodType.EmailOtp)
        {
            if (string.IsNullOrWhiteSpace(globalUser.Email))
            {
                _logger.LogWarning("Cannot send Email OTP: User {UserId} has no email address", tenantUserId);
                return;
            }

            var subject = "Your OneSign Verification Code";
            var body = $"Your verification code is: {otpCode}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this message.";

            var sent = await _emailService.SendEmailAsync(
                globalUser.Email,
                subject,
                body,
                false,
                cancellationToken);

            if (sent)
            {
                _logger.LogInformation("Email OTP sent successfully to user {UserId}", tenantUserId);
            }
            else
            {
                _logger.LogWarning("Failed to send Email OTP to user {UserId}", tenantUserId);
            }
        }
        else if (methodType == MfaMethodType.SmsOtp)
        {
            if (string.IsNullOrWhiteSpace(globalUser.PhoneNumber))
            {
                _logger.LogWarning("Cannot send SMS OTP: User {UserId} has no phone number", tenantUserId);
                return;
            }

            var message = $"Your OneSign verification code is: {otpCode}. This code expires in 5 minutes.";

            var sent = await _smsService.SendSmsAsync(
                globalUser.PhoneNumber,
                message,
                cancellationToken);

            if (sent)
            {
                _logger.LogInformation("SMS OTP sent successfully to user {UserId}", tenantUserId);
            }
            else
            {
                _logger.LogWarning("Failed to send SMS OTP to user {UserId}", tenantUserId);
            }
        }
    }
}
