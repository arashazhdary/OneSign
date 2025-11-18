using FluentAssertions;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class JitProvisioningLogEntityTests
{
    [Fact]
    public void Constructor_CreatesLogWithDefaultValues()
    {
        // Act
        var log = new JitProvisioningLog();

        // Assert
        log.Id.Should().Be(Guid.Empty);
        log.TenantId.Should().Be(Guid.Empty);
        log.SamlProviderId.Should().BeNull();
        log.OidcFederationProviderId.Should().BeNull();
        log.UserId.Should().BeEmpty();
        log.ExternalUserId.Should().BeEmpty();
        log.ErrorMessage.Should().BeNull();
        log.ProvisionedDataJson.Should().BeNull();
    }

    [Fact]
    public void SetProperties_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var samlProviderId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var provisionedData = "{\"email\":\"user@example.com\",\"name\":\"John Doe\"}";

        // Act
        var log = new JitProvisioningLog
        {
            Id = id,
            TenantId = tenantId,
            SamlProviderId = samlProviderId,
            OidcFederationProviderId = null,
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Success,
            ErrorMessage = null,
            ProvisionedDataJson = provisionedData,
            CreatedAt = createdAt
        };

        // Assert
        log.Id.Should().Be(id);
        log.TenantId.Should().Be(tenantId);
        log.SamlProviderId.Should().Be(samlProviderId);
        log.OidcFederationProviderId.Should().BeNull();
        log.UserId.Should().Be("user-123");
        log.ExternalUserId.Should().Be("external-456");
        log.Status.Should().Be(JitProvisioningStatus.Success);
        log.ErrorMessage.Should().BeNull();
        log.ProvisionedDataJson.Should().Be(provisionedData);
        log.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void SetProperties_OidcProviderIdCanBeSet()
    {
        // Arrange
        var oidcProviderId = Guid.NewGuid();

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = null,
            OidcFederationProviderId = oidcProviderId,
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Success,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log.SamlProviderId.Should().BeNull();
        log.OidcFederationProviderId.Should().Be(oidcProviderId);
    }

    [Fact]
    public void AllJitProvisioningStatuses_CanBeAssigned()
    {
        // Arrange & Act & Assert
        var successLog = new JitProvisioningLog { Status = JitProvisioningStatus.Success };
        successLog.Status.Should().Be(JitProvisioningStatus.Success);

        var failedLog = new JitProvisioningLog { Status = JitProvisioningStatus.Failed };
        failedLog.Status.Should().Be(JitProvisioningStatus.Failed);

        var skippedLog = new JitProvisioningLog { Status = JitProvisioningStatus.Skipped };
        skippedLog.Status.Should().Be(JitProvisioningStatus.Skipped);
    }

    [Fact]
    public void FailedStatus_CanHaveErrorMessage()
    {
        // Arrange
        var errorMessage = "User already exists in the system";

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Failed,
            ErrorMessage = errorMessage,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log.Status.Should().Be(JitProvisioningStatus.Failed);
        log.ErrorMessage.Should().Be(errorMessage);
    }

    [Fact]
    public void SkippedStatus_CanHaveErrorMessage()
    {
        // Arrange
        var skipReason = "User already provisioned";

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Skipped,
            ErrorMessage = skipReason,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log.Status.Should().Be(JitProvisioningStatus.Skipped);
        log.ErrorMessage.Should().Be(skipReason);
    }

    [Fact]
    public void ProvisionedDataJson_CanStoreComplexJson()
    {
        // Arrange
        var complexJson = @"{
            ""email"": ""user@example.com"",
            ""name"": ""John Doe"",
            ""roles"": [""admin"", ""user""],
            ""attributes"": {
                ""department"": ""Engineering"",
                ""location"": ""New York""
            }
        }";

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Success,
            ProvisionedDataJson = complexJson,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log.ProvisionedDataJson.Should().Be(complexJson);
        log.ProvisionedDataJson.Should().Contain("email");
        log.ProvisionedDataJson.Should().Contain("roles");
    }

    [Fact]
    public void SamlAndOidcProviderIds_AreMutuallyExclusive()
    {
        // Arrange - SAML provider
        var samlLog = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            OidcFederationProviderId = null,
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Success,
            CreatedAt = DateTime.UtcNow
        };

        // Act - OIDC provider
        var oidcLog = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = null,
            OidcFederationProviderId = Guid.NewGuid(),
            UserId = "user-456",
            ExternalUserId = "external-789",
            Status = JitProvisioningStatus.Success,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        samlLog.SamlProviderId.Should().NotBeNull();
        samlLog.OidcFederationProviderId.Should().BeNull();
        oidcLog.SamlProviderId.Should().BeNull();
        oidcLog.OidcFederationProviderId.Should().NotBeNull();
    }

    [Fact]
    public void MultipleLogs_HaveIndependentState()
    {
        // Arrange
        var log1 = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            UserId = "user-1",
            ExternalUserId = "external-1",
            Status = JitProvisioningStatus.Success,
            CreatedAt = DateTime.UtcNow
        };

        var log2 = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            UserId = "user-2",
            ExternalUserId = "external-2",
            Status = JitProvisioningStatus.Failed,
            ErrorMessage = "Error occurred",
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log1.Id.Should().NotBe(log2.Id);
        log1.Status.Should().Be(JitProvisioningStatus.Success);
        log2.Status.Should().Be(JitProvisioningStatus.Failed);
        log1.ErrorMessage.Should().BeNull();
        log2.ErrorMessage.Should().NotBeNull();
    }

    [Fact]
    public void ExternalUserId_CanBeLong()
    {
        // Arrange
        var longExternalId = "urn:oid:2.16.840.1.113730.3.1.203:unique-identifier-from-external-idp-1234567890";

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            UserId = "user-123",
            ExternalUserId = longExternalId,
            Status = JitProvisioningStatus.Success,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        log.ExternalUserId.Should().Be(longExternalId);
    }

    [Fact]
    public void CreatedAt_StoresCorrectTimestamp()
    {
        // Arrange
        var timestamp = DateTime.UtcNow;

        // Act
        var log = new JitProvisioningLog
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            UserId = "user-123",
            ExternalUserId = "external-456",
            Status = JitProvisioningStatus.Success,
            CreatedAt = timestamp
        };

        // Assert
        log.CreatedAt.Should().Be(timestamp);
    }
}
