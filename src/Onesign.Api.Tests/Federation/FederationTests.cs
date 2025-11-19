using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Federation.Application.Commands;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;

namespace Onesign.Api.Tests.Federation;

#region CreateSamlProviderCommand Tests

public class CreateSamlProviderCommandTests
{
    [Fact]
    public void CreateSamlProviderCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateSamlProviderCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Enterprise SAML",
            EntityId = "https://idp.example.com/saml",
            SsoUrl = "https://idp.example.com/saml/sso",
            SloUrl = "https://idp.example.com/saml/slo",
            Certificate = "-----BEGIN CERTIFICATE-----...",
            NameIdFormat = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
            SignRequests = true,
            ValidateSignature = true
        };

        // Assert
        command.Name.Should().Be("Enterprise SAML");
        command.EntityId.Should().NotBeEmpty();
        command.SignRequests.Should().BeTrue();
    }
}

#endregion

#region UpdateSamlProviderCommand Tests

public class UpdateSamlProviderCommandTests
{
    [Fact]
    public void UpdateSamlProviderCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateSamlProviderCommand
        {
            TenantId = Guid.NewGuid(),
            ProviderId = Guid.NewGuid(),
            Name = "Updated SAML Provider",
            SsoUrl = "https://new-idp.example.com/saml/sso"
        };

        // Assert
        command.ProviderId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated SAML Provider");
    }
}

#endregion

#region CreateOidcProviderCommand Tests

public class CreateOidcProviderCommandTests
{
    [Fact]
    public void CreateOidcProviderCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateOidcProviderCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Azure AD",
            Issuer = "https://login.microsoftonline.com/tenant-id/v2.0",
            ClientId = "client-id-123",
            ClientSecret = "client-secret",
            AuthorizationEndpoint = "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize",
            TokenEndpoint = "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token",
            UserInfoEndpoint = "https://graph.microsoft.com/oidc/userinfo",
            Scopes = new List<string> { "openid", "profile", "email" }
        };

        // Assert
        command.Name.Should().Be("Azure AD");
        command.Scopes.Should().HaveCount(3);
    }
}

#endregion

#region CreateScimTokenCommand Tests

public class CreateScimTokenCommandTests
{
    [Fact]
    public void CreateScimTokenCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateScimTokenCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Azure AD SCIM Token",
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            AllowedOperations = new List<string> { "create", "update", "delete" }
        };

        // Assert
        command.Name.Should().Be("Azure AD SCIM Token");
        command.AllowedOperations.Should().HaveCount(3);
    }
}

#endregion

#region RevokeScimTokenCommand Tests

public class RevokeScimTokenCommandTests
{
    [Fact]
    public void RevokeScimTokenCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeScimTokenCommand
        {
            TenantId = Guid.NewGuid(),
            TokenId = Guid.NewGuid(),
            Reason = "Token compromised"
        };

        // Assert
        command.Reason.Should().Be("Token compromised");
    }
}

#endregion

#region GetFederationProvidersQuery Tests

public class GetFederationProvidersQueryTests
{
    [Fact]
    public void GetFederationProvidersQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetFederationProvidersQuery
        {
            TenantId = Guid.NewGuid(),
            Type = (int)FederationProviderType.SAML,
            IsEnabled = true
        };

        // Assert
        query.Type.Should().Be((int)FederationProviderType.SAML);
        query.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region GetScimTokensQuery Tests

public class GetScimTokensQueryTests
{
    [Fact]
    public void GetScimTokensQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery
        {
            TenantId = tenantId,
            IncludeRevoked = false
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region GetJitProvisioningLogsQuery Tests

public class GetJitProvisioningLogsQueryTests
{
    [Fact]
    public void GetJitProvisioningLogsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetJitProvisioningLogsQuery
        {
            TenantId = Guid.NewGuid(),
            ProviderId = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.ProviderId.Should().NotBeEmpty();
    }
}

#endregion

#region SamlProvider Entity Tests

public class SamlProviderEntityTests
{
    [Fact]
    public void SamlProvider_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var provider = new SamlProvider(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test SAML",
            "https://idp.example.com",
            "https://idp.example.com/sso",
            "certificate");

        // Assert
        provider.Name.Should().Be("Test SAML");
        provider.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void SamlProvider_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var provider = new SamlProvider(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "SAML",
            "entity",
            "sso",
            "cert");

        // Act
        provider.Disable();

        // Assert
        provider.IsEnabled.Should().BeFalse();
    }
}

#endregion

#region OidcFederationProvider Entity Tests

public class OidcFederationProviderEntityTests
{
    [Fact]
    public void OidcFederationProvider_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var provider = new OidcFederationProvider(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test OIDC",
            "https://issuer.example.com",
            "client-id",
            "client-secret");

        // Assert
        provider.Name.Should().Be("Test OIDC");
        provider.ClientId.Should().Be("client-id");
    }
}

#endregion

#region ScimToken Entity Tests

public class ScimTokenEntityTests
{
    [Fact]
    public void ScimToken_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var token = new ScimToken(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Token",
            "token_hash",
            DateTime.UtcNow.AddYears(1));

        // Assert
        token.Name.Should().Be("Test Token");
        token.IsActive.Should().BeTrue();
    }

    [Fact]
    public void ScimToken_Revoke_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var token = new ScimToken(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Token",
            "hash",
            DateTime.UtcNow.AddYears(1));

        // Act
        token.Revoke("Compromised");

        // Assert
        token.IsActive.Should().BeFalse();
        token.RevokedAt.Should().NotBeNull();
    }
}

#endregion

#region JitProvisioningLog Entity Tests

public class JitProvisioningLogEntityTests
{
    [Fact]
    public void JitProvisioningLog_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var log = new JitProvisioningLog(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            JitProvisioningAction.Create,
            true);

        // Assert
        log.Action.Should().Be(JitProvisioningAction.Create);
        log.Success.Should().BeTrue();
    }
}

#endregion

#region FederationProviderType Enum Tests

public class FederationProviderTypeEnumTests
{
    [Theory]
    [InlineData(FederationProviderType.SAML)]
    [InlineData(FederationProviderType.OIDC)]
    [InlineData(FederationProviderType.LDAP)]
    public void FederationProviderType_ShouldHaveCorrectValues(FederationProviderType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region JitProvisioningAction Enum Tests

public class JitProvisioningActionEnumTests
{
    [Theory]
    [InlineData(JitProvisioningAction.Create)]
    [InlineData(JitProvisioningAction.Update)]
    [InlineData(JitProvisioningAction.Link)]
    public void JitProvisioningAction_ShouldHaveCorrectValues(JitProvisioningAction action)
    {
        // Assert
        action.Should().BeDefined();
    }
}

#endregion
