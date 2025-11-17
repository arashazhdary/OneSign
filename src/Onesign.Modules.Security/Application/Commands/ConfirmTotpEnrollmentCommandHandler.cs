using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Commands;

public class ConfirmTotpEnrollmentCommandHandler : IRequestHandler<ConfirmTotpEnrollmentCommand, UserMfaMethodDto>
{
    private readonly IUserMfaMethodRepository _repository;
    private readonly IMfaService _mfaService;

    public ConfirmTotpEnrollmentCommandHandler(
        IUserMfaMethodRepository repository,
        IMfaService mfaService)
    {
        _repository = repository;
        _mfaService = mfaService;
    }

    public async Task<UserMfaMethodDto> Handle(ConfirmTotpEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var isValid = _mfaService.VerifyTotpCode(request.Secret, request.Code);
        if (!isValid)
            throw new InvalidOperationException("Invalid TOTP code");

        var encryptedSecret = _mfaService.EncryptSecret(request.Secret);

        var existingMethods = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);
        var isDefault = !existingMethods.Any();

        var method = UserMfaMethod.Create(
            request.UserId,
            request.TenantId,
            MfaMethodType.Totp,
            encryptedSecret,
            isDefault
        );

        await _repository.AddAsync(method, cancellationToken);

        return new UserMfaMethodDto
        {
            Id = method.Id,
            MethodType = (int)method.MethodType,
            IsDefault = method.IsDefault,
            CreatedAt = method.CreatedAt
        };
    }
}
