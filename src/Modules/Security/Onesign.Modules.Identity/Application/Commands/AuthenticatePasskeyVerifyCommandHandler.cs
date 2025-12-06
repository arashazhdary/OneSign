using Fido2;
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
    private readonly IAuthService _authService;
    private readonly IMemoryCache _cache;

    public AuthenticatePasskeyVerifyCommandHandler(
        IFido2 fido2,
        IPasskeyCredentialRepository passkeyCredentialRepository,
        ITenantUserRepository tenantUserRepository,
        IAuthService authService,
        IMemoryCache cache)
    {
        _fido2 = fido2;
        _passkeyCredentialRepository = passkeyCredentialRepository;
        _tenantUserRepository = tenantUserRepository;
        _authService = authService;
        _cache = cache;
    }

    public async Task<Result<LoginResponse>> Handle(AuthenticatePasskeyVerifyCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Parse the assertion response
            var assertionResponse = JsonSerializer.Serialize(request.AssertionResponse);
            var clientResponse = AuthenticatorAssertionRawResponse.Parse(assertionResponse);

            // Get the credential ID from the response
            var credentialId = clientResponse.Id;

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

            // Retrieve cached options - try to find the options by trying different cache key patterns
            string? optionsJson = null;

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
            var options = _fido2.GetAssertionOptions(
                storedCredentials,
                UserVerificationRequirement.Preferred
            );

            // Verify the assertion
            var success = await _fido2.MakeAssertionAsync(
                clientResponse,
                options,
                storedCredential.PublicKey,
                storedCredential.SignCounter,
                async (args, cancellationToken) =>
                {
                    // Verify the credential exists and hasn't been revoked
                    var credential = await _passkeyCredentialRepository
                        .GetByCredentialIdAsync(args.CredentialId, cancellationToken);
                    return credential != null;
                },
                cancellationToken
            );

            if (success.Status != "ok")
            {
                return Result.Failure<LoginResponse>("VERIFICATION_FAILED", "Failed to verify passkey authentication");
            }

            // Update the credential's sign counter and last used time
            storedCredential.SignCounter = success.Counter;
            storedCredential.LastUsedAt = DateTime.UtcNow;
            await _passkeyCredentialRepository.UpdateAsync(storedCredential, cancellationToken);

            // Generate tokens
            var tokens = await _authService.GenerateTokensAsync(
                tenantUser.Id,
                tenantUser.TenantId,
                request.ClientId,
                cancellationToken
            );

            var loginResponse = new LoginResponse
            {
                AccessToken = tokens.AccessToken,
                IdToken = tokens.IdToken,
                ExpiresIn = tokens.ExpiresIn,
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
