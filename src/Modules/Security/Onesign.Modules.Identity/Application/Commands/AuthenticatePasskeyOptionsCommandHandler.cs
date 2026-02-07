using Fido2NetLib;
using Fido2NetLib.Objects;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class AuthenticatePasskeyOptionsCommandHandler : IRequestHandler<AuthenticatePasskeyOptionsCommand, Result<object>>
{
    private readonly IFido2 _fido2;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IPasskeyCredentialRepository _passkeyCredentialRepository;
    private readonly IMemoryCache _cache;

    public AuthenticatePasskeyOptionsCommandHandler(
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

    public async Task<Result<object>> Handle(AuthenticatePasskeyOptionsCommand request, CancellationToken cancellationToken)
    {
        List<PublicKeyCredentialDescriptor> allowedCredentials;
        string cacheKey;

        if (!string.IsNullOrEmpty(request.Email))
        {
            // Email-based authentication
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

            // Get user's credentials
            var credentials = await _passkeyCredentialRepository.GetByTenantUserIdAsync(tenantUser.Id, cancellationToken);
            allowedCredentials = credentials
                .Select(c => new PublicKeyCredentialDescriptor(c.CredentialId))
                .ToList();

            if (!allowedCredentials.Any())
            {
                return Result.Failure<object>("NO_CREDENTIALS", "No passkeys registered for this user");
            }

            cacheKey = $"passkey_authentication_{request.Email}_{request.TenantId}";
        }
        else
        {
            // Usernameless authentication (resident keys)
            allowedCredentials = new List<PublicKeyCredentialDescriptor>();
            cacheKey = $"passkey_authentication_usernameless_{request.TenantId}_{Guid.NewGuid()}";
        }

        // Create assertion options
        var options = _fido2.GetAssertionOptions(new GetAssertionOptionsParams
        {
            AllowedCredentials = allowedCredentials,
            UserVerification = UserVerificationRequirement.Preferred,
        });

        // Cache the options for verification later (5 minute expiration)
        _cache.Set(cacheKey, options.ToJson(), TimeSpan.FromMinutes(5));

        // Return options with cache key for client to send back
        return Result.Success<object>(new
        {
            options,
            challengeId = cacheKey
        });
    }
}
