using Fido2NetLib;
using Fido2NetLib.Objects;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RegisterPasskeyOptionsCommandHandler : IRequestHandler<RegisterPasskeyOptionsCommand, Result<object>>
{
    private readonly IFido2 _fido2;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IPasskeyCredentialRepository _passkeyCredentialRepository;
    private readonly IMemoryCache _cache;

    public RegisterPasskeyOptionsCommandHandler(
        IFido2 fido2,
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IPasskeyCredentialRepository passkeyCredentialRepository,
        IMemoryCache cache)
    {
        _fido2 = fido2;
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _passkeyCredentialRepository = passkeyCredentialRepository;
        _cache = cache;
    }

    public async Task<Result<object>> Handle(RegisterPasskeyOptionsCommand request, CancellationToken cancellationToken)
    {
        var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (globalUser == null)
        {
            return Result.Failure<object>("USER_NOT_FOUND", "User not found");
        }

        var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
            globalUser.Id, request.TenantId, cancellationToken);
        if (tenantUser == null)
        {
            return Result.Failure<object>("USER_NOT_IN_TENANT", "User is not a member of this tenant");
        }

        // Get existing credentials for this user
        var existingCredentials = await _passkeyCredentialRepository.GetByTenantUserIdAsync(tenantUser.Id, cancellationToken);
        var excludeCredentials = existingCredentials
            .Select(c => new PublicKeyCredentialDescriptor(c.CredentialId))
            .ToList();

        // Create FIDO2 user
        var fido2User = new Fido2User
        {
            Name = globalUser.Email,
            Id = tenantUser.Id.ToByteArray(),
            DisplayName = globalUser.Email
        };

        // Create attestation options
        var authenticatorSelection = new AuthenticatorSelection
        {
            ResidentKey = ResidentKeyRequirement.Discouraged,
            UserVerification = UserVerificationRequirement.Preferred
        };

        var options = _fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = fido2User,
            ExcludeCredentials = excludeCredentials,
            AuthenticatorSelection = authenticatorSelection,
            AttestationPreference = AttestationConveyancePreference.None
        });

        // Cache the options for verification later (5 minute expiration)
        var cacheKey = $"passkey_registration_{request.Email}_{request.TenantId}";
        _cache.Set(cacheKey, options.ToJson(), TimeSpan.FromMinutes(5));

        return Result.Success<object>(options);
    }
}
