using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Commands;

public class CreateMfaChallengeCommandHandler : IRequestHandler<CreateMfaChallengeCommand, MfaChallengeResponse>
{
    private readonly IUserMfaMethodRepository _methodRepository;
    private readonly IMfaChallengeService _challengeService;
    private readonly IMfaService _mfaService;

    public CreateMfaChallengeCommandHandler(
        IUserMfaMethodRepository methodRepository,
        IMfaChallengeService challengeService,
        IMfaService mfaService)
    {
        _methodRepository = methodRepository;
        _challengeService = challengeService;
        _mfaService = mfaService;
    }

    public async Task<MfaChallengeResponse> Handle(CreateMfaChallengeCommand request, CancellationToken cancellationToken)
    {
        var methods = await _methodRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (!methods.Any())
            throw new InvalidOperationException("User has no MFA methods enrolled");

        var selectedMethod = request.PreferredMethodType.HasValue
            ? methods.FirstOrDefault(m => (int)m.MethodType == request.PreferredMethodType.Value)
            : methods.FirstOrDefault(m => m.IsDefault);

        selectedMethod ??= methods.First();

        var challenge = await _challengeService.CreateChallengeAsync(
            request.UserId,
            request.TenantId,
            selectedMethod.Id,
            selectedMethod.MethodType,
            cancellationToken
        );

        if (selectedMethod.MethodType == MfaMethodType.EmailOtp)
        {
            var code = _mfaService.GenerateEmailOtpCode();
            await _challengeService.SetChallengeCodeAsync(challenge.Id, code, cancellationToken);
        }

        string? maskedDestination = selectedMethod.MethodType == MfaMethodType.EmailOtp
            ? MaskEmail(request.UserEmail)
            : null;

        return new MfaChallengeResponse
        {
            ChallengeId = challenge.Id,
            MethodType = (int)challenge.MethodType,
            MaskedDestination = maskedDestination,
            ExpiresAt = challenge.ExpiresAt
        };
    }

    private string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return email;
        var local = parts[0];
        if (local.Length <= 2) return email;
        return $"{local[0]}***{local[^1]}@{parts[1]}";
    }
}
