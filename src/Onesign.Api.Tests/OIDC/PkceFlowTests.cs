using Microsoft.Extensions.Configuration;
using Moq;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Shared.Security;
using Xunit;

namespace Onesign.Api.Tests.OIDC;

public class PkceFlowTests
{
    [Fact]
    public async Task GenerateAndValidateAuthorizationCode_ValidFlow_ReturnsCorrectData()
    {
        // Arrange
        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Jwt:SigningKey"]).Returns("test-signing-key-min-32-chars-long-for-hmac");
        var authCodeRepo = new Mock<IAuthorizationCodeRepository>();
        
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-code-challenge";
        
        Onesign.Modules.Identity.Domain.Entities.AuthorizationCode? savedCode = null;
        
        // Mock AddAsync to save the code
        authCodeRepo.Setup(r => r.AddAsync(It.IsAny<Onesign.Modules.Identity.Domain.Entities.AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Onesign.Modules.Identity.Domain.Entities.AuthorizationCode code, CancellationToken ct) =>
            {
                savedCode = code;
                return code;
            });

        // Mock GetByCodeAsync to retrieve the saved code
        authCodeRepo.Setup(r => r.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string code, CancellationToken ct) => 
                savedCode != null && savedCode.Code == code && !savedCode.IsUsed && savedCode.ExpiresAt > DateTime.UtcNow 
                    ? savedCode 
                    : null);

        // Mock UpdateAsync to mark code as used
        authCodeRepo.Setup(r => r.UpdateAsync(It.IsAny<Onesign.Modules.Identity.Domain.Entities.AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Callback((Onesign.Modules.Identity.Domain.Entities.AuthorizationCode code, CancellationToken ct) =>
            {
                if (savedCode != null && savedCode.Code == code.Code)
                {
                    savedCode.IsUsed = code.IsUsed;
                }
            })
            .Returns(Task.CompletedTask);
        
        var signingKeyProvider = new Mock<IJwtSigningKeyProvider>();
        signingKeyProvider.Setup(p => p.GetSigningKey()).Returns("test-signing-key-min-32-chars-long-for-hmac");
        var authService = new AuthService(signingKeyProvider.Object, authCodeRepo.Object);

        // Act - Generate authorization code
        var authCode = await authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Assert
        Assert.NotNull(authCode);
        Assert.NotEmpty(authCode);

        // Act - Validate authorization code
        var validationResult = await authService.ValidateAuthorizationCodeAsync(authCode);

        // Assert
        Assert.NotNull(validationResult);
        Assert.Equal(tenantUserId, validationResult.Value.TenantUserId);
        Assert.Equal(clientId, validationResult.Value.ClientId);
        Assert.Equal(redirectUri, validationResult.Value.RedirectUri);
        Assert.Equal(codeChallenge, validationResult.Value.CodeChallenge);
    }

    [Fact]
    public async Task ValidateAuthorizationCode_InvalidCode_ReturnsNull()
    {
        // Arrange
        var signingKeyProvider = new Mock<IJwtSigningKeyProvider>();
        signingKeyProvider.Setup(p => p.GetSigningKey()).Returns("test-signing-key-min-32-chars-long-for-hmac");
        var authCodeRepo = new Mock<IAuthorizationCodeRepository>();
        
        var authService = new AuthService(signingKeyProvider.Object, authCodeRepo.Object);

        // Act
        var result = await authService.ValidateAuthorizationCodeAsync("invalid-code");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ValidateAuthorizationCode_ExpiredCode_ReturnsNull()
    {
        // Arrange
        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Jwt:SigningKey"]).Returns("test-signing-key-min-32-chars-long-for-hmac");
        var authCodeRepo = new Mock<IAuthorizationCodeRepository>();
        
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-code-challenge";
        
        Onesign.Modules.Identity.Domain.Entities.AuthorizationCode? savedCode = null;
        
        // Mock AddAsync to save the code
        authCodeRepo.Setup(r => r.AddAsync(It.IsAny<Onesign.Modules.Identity.Domain.Entities.AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Onesign.Modules.Identity.Domain.Entities.AuthorizationCode code, CancellationToken ct) =>
            {
                savedCode = code;
                return code;
            });

        // Mock GetByCodeAsync to retrieve the saved code (checking IsUsed and ExpiresAt)
        authCodeRepo.Setup(r => r.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string code, CancellationToken ct) => 
                savedCode != null && savedCode.Code == code && !savedCode.IsUsed && savedCode.ExpiresAt > DateTime.UtcNow 
                    ? savedCode 
                    : null);

        // Mock UpdateAsync to mark code as used
        authCodeRepo.Setup(r => r.UpdateAsync(It.IsAny<Onesign.Modules.Identity.Domain.Entities.AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Callback((Onesign.Modules.Identity.Domain.Entities.AuthorizationCode code, CancellationToken ct) =>
            {
                if (savedCode != null && savedCode.Code == code.Code)
                {
                    savedCode.IsUsed = code.IsUsed;
                }
            })
            .Returns(Task.CompletedTask);
        
        var signingKeyProvider = new Mock<IJwtSigningKeyProvider>();
        signingKeyProvider.Setup(p => p.GetSigningKey()).Returns("test-signing-key-min-32-chars-long-for-hmac");
        var authService = new AuthService(signingKeyProvider.Object, authCodeRepo.Object);

        // Generate code
        var authCode = await authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Act - Validate code (should succeed first time)
        var firstResult = await authService.ValidateAuthorizationCodeAsync(authCode);
        Assert.NotNull(firstResult);

        // Act - Try to validate same code again (should fail - one-time use)
        var secondResult = await authService.ValidateAuthorizationCodeAsync(authCode);

        // Assert
        Assert.Null(secondResult); // Code should be consumed after first use
    }
}

