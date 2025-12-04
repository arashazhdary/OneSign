using Fido2NetLib;
using Fido2NetLib.Objects;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;
using System.Text.Json;

namespace Onesign.Modules.Identity.Application.Commands;

public class RegisterPasskeyVerifyCommandHandler : IRequestHandler<RegisterPasskeyVerifyCommand, Result<bool>>
{
    private readonly IFido2 _fido2;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IPasskeyCredentialRepository _passkeyCredentialRepository;
    private readonly IMemoryCache _cache;

    public RegisterPasskeyVerifyCommandHandler(
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

    public async Task<Result<bool>> Handle(RegisterPasskeyVerifyCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (globalUser == null)
            {
                return Result.Failure<bool>("USER_NOT_FOUND", "User not found");
            }

            var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
                globalUser.Id, request.TenantId, cancellationToken);
            if (tenantUser == null)
            {
                return Result.Failure<bool>("USER_NOT_IN_TENANT", "User is not a member of this tenant");
            }

            // Retrieve cached options
            var cacheKey = $"passkey_registration_{request.Email}_{request.TenantId}";
            if (!_cache.TryGetValue<string>(cacheKey, out var optionsJson) || string.IsNullOrEmpty(optionsJson))
            {
                return Result.Failure<bool>("OPTIONS_EXPIRED", "Registration options have expired. Please try again.");
            }

            var options = CredentialCreateOptions.FromJson(optionsJson);

            // Parse the attestation response
            var attestationResponse = JsonSerializer.Serialize(request.AttestationResponse);
            var attestation = AuthenticatorAttestationRawResponse.Parse(attestationResponse);

            // Verify the attestation
            var success = await _fido2.MakeNewCredentialAsync(
                attestation,
                options,
                async (args, cancellationToken) =>
                {
                    // Check if credential already exists
                    var existingCredential = await _passkeyCredentialRepository
                        .GetByCredentialIdAsync(args.CredentialId, cancellationToken);
                    return existingCredential == null;
                },
                cancellationToken
            );

            if (success.Result == null)
            {
                return Result.Failure<bool>("VERIFICATION_FAILED", "Failed to verify passkey registration");
            }

            // Store the credential
            var credential = new PasskeyCredential
            {
                Id = Guid.NewGuid(),
                TenantUserId = tenantUser.Id,
                CredentialId = success.Result.CredentialId,
                PublicKey = success.Result.PublicKey,
                SignCounter = success.Result.Counter,
                CredType = success.Result.CredType,
                AaGuid = success.Result.Aaguid,
                UserHandle = success.Result.User?.Id != null ? Convert.ToBase64String(success.Result.User.Id) : null,
                DeviceName = request.DeviceName,
                CreatedAt = DateTime.UtcNow,
                Transports = string.Join(",", attestation.Response.Transports ?? Array.Empty<AuthenticatorTransport>())
            };

            await _passkeyCredentialRepository.AddAsync(credential, cancellationToken);

            // Remove the cached options
            _cache.Remove(cacheKey);

            return Result.Success(true);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>("REGISTRATION_ERROR", $"Passkey registration failed: {ex.Message}");
        }
    }
}
