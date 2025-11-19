using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class MfaChallengeService : IMfaChallengeService
{
    private readonly IMfaChallengeRepository _mfaChallengeRepository;
    private readonly IUserMfaMethodRepository _userMfaMethodRepository;
    private readonly IMfaService _mfaService;

    public MfaChallengeService(
        IMfaChallengeRepository mfaChallengeRepository,
        IUserMfaMethodRepository userMfaMethodRepository,
        IMfaService mfaService)
    {
        _mfaChallengeRepository = mfaChallengeRepository ?? throw new ArgumentNullException(nameof(mfaChallengeRepository));
        _userMfaMethodRepository = userMfaMethodRepository ?? throw new ArgumentNullException(nameof(userMfaMethodRepository));
        _mfaService = mfaService ?? throw new ArgumentNullException(nameof(mfaService));
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

            // TODO: Send the OTP code via email or SMS
            // This should be handled by a notification service that's injected
            // For now, we'll just store the hash
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
        var challenge = new MfaChallenge(
            id: Guid.NewGuid(),
            tenantUserId: tenantUserId,
            methodType: methodType,
            codeHash: string.Empty,
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
}
