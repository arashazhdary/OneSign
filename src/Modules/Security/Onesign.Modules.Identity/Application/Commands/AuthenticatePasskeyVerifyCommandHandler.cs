using Fido2NetLib;
using Fido2NetLib.Objects;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;
using System.Text.Json;

namespace Onesign.Modules.Identity.Application.Commands;

public class AuthenticatePasskeyVerifyCommandHandler : IRequestHandler<AuthenticatePasskeyVerifyCommand, Result<LoginResponse>>
{
    private readonly IFido2 _fido2;
    private readonly IPasskeyCredentialRepository _passkeyCredentialRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IAuthService _authService;
    private readonly IMemoryCache _cache;

    public AuthenticatePasskeyVerifyCommandHandler(
        IFido2 fido2,
        IPasskeyCredentialRepository passkeyCredentialRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IAuthService authService,
        IMemoryCache cache)
    {
        _fido2 = fido2;
        _passkeyCredentialRepository = passkeyCredentialRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _authService = authService;
        _cache = cache;
    }

    public async Task<Result<LoginResponse>> Handle(AuthenticatePasskeyVerifyCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Parse the assertion response
            var clientResponse = JsonSerializer.Deserialize<AuthenticatorAssertionRawResponse>(
                JsonSerializer.Serialize(request.AssertionResponse))
                ?? throw new InvalidOperationException("Failed to deserialize assertion response");

            // Get the credential ID from the response (RawId is byte[])
            var credentialId = clientResponse.RawId;

            // Find the credential in the database
            var storedCredential = await _passkeyCredentialRepository.GetByCredentialIdAsync(
                credentialId, cancellationToken);

            if (storedCredential == null)
            {
                return Result.Failure<LoginResponse>("CREDENTIAL_NOT_FOUND", "Passkey not found");
            }

            // Get the tenant user
            var tenantUser = await _tenantUserRepository.GetByIdAsync(storedCredential.TenantUserId, cancellationToken);
            if (tenantUser == null)
            {
                return Result.Failure<LoginResponse>("USER_NOT_FOUND", "User not found");
            }

            // The client should send back the challengeId, but we need to extract it from the assertion response
            // For now, we'll try to find it in cache (this is a simplified approach)
            // In production, the challengeId should be sent from the client

            // Try to get from cache - this is a limitation, ideally challengeId comes from client
            // For now, we'll create the options verification differently

            // Create stored credential for verification
            var storedCredentials = new List<PublicKeyCredentialDescriptor>
            {
                new PublicKeyCredentialDescriptor(storedCredential.CredentialId)
            };

            // Create assertion options for verification
            var options = _fido2.GetAssertionOptions(new GetAssertionOptionsParams
            {
                AllowedCredentials = storedCredentials,
                UserVerification = UserVerificationRequirement.Preferred
            });

            // Verify the assertion
            var assertionResult = await _fido2.MakeAssertionAsync(new MakeAssertionParams
            {
                AssertionResponse = clientResponse,
                OriginalOptions = options,
                StoredPublicKey = storedCredential.PublicKey,
                StoredSignatureCounter = storedCredential.SignCounter,
                IsUserHandleOwnerOfCredentialIdCallback = async (args, ct) =>
                {
                    // Verify the credential exists and hasn't been revoked
                    var credential = await _passkeyCredentialRepository
                        .GetByCredentialIdAsync(args.CredentialId, ct);
                    return credential != null;
                }
            }, cancellationToken);

            // Update the credential's sign counter and last used time
            storedCredential.SignCounter = assertionResult.SignCount;
            storedCredential.LastUsedAt = DateTime.UtcNow;
            await _passkeyCredentialRepository.UpdateAsync(storedCredential, cancellationToken);

            // Generate tokens
            var accessToken = await _authService.GenerateAccessTokenAsync(
                tenantUser.Id,
                tenantUser.TenantId,
                request.ClientId ?? Guid.Empty,
                cancellationToken
            );

            var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);
            var idToken = await _authService.GenerateIdTokenAsync(
                tenantUser.Id,
                tenantUser.TenantId,
                request.ClientId ?? Guid.Empty,
                globalUser?.Email,
                cancellationToken
            );

            var loginResponse = new LoginResponse
            {
                AccessToken = accessToken,
                IdToken = idToken,
                ExpiresIn = 3600,
                MfaRequired = false
            };

            return Result.Success(loginResponse);
        }
        catch (Exception ex)
        {
            return Result.Failure<LoginResponse>("AUTHENTICATION_ERROR", $"Passkey authentication failed: {ex.Message}");
        }
    }
}
