using FluentAssertions;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditDomainTests
{
    #region AuditEvent Entity Tests

    [Fact]
    public void AuditEvent_DefaultValues_AreEmptyStrings()
    {
        // Arrange & Act
        var entity = new AuditEvent();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().BeNull();
        entity.CorrelationId.Should().BeEmpty();
        entity.ActorId.Should().BeEmpty();
        entity.ActorDisplayName.Should().BeEmpty();
        entity.ActorType.Should().BeEmpty();
        entity.Action.Should().BeEmpty();
        entity.TargetType.Should().BeEmpty();
        entity.TargetId.Should().BeEmpty();
        entity.IpAddress.Should().BeEmpty();
        entity.UserAgent.Should().BeEmpty();
        entity.Country.Should().BeNull();
        entity.DataJson.Should().BeEmpty();
    }

    [Fact]
    public void AuditEvent_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var occurredAt = DateTime.UtcNow;

        // Act
        var entity = new AuditEvent
        {
            Id = id,
            TenantId = tenantId,
            CorrelationId = "correlation-123",
            Category = AuditCategory.Security,
            Severity = AuditSeverity.Critical,
            ActorId = "admin-456",
            ActorDisplayName = "Admin User",
            ActorType = "Admin",
            Action = "Security.PasswordReset",
            TargetType = "User",
            TargetId = "user-789",
            IpAddress = "10.0.0.1",
            UserAgent = "AdminTool/1.0",
            Country = "UK",
            OccurredAt = occurredAt,
            DataJson = "{\"forced\":true}"
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.CorrelationId.Should().Be("correlation-123");
        entity.Category.Should().Be(AuditCategory.Security);
        entity.Severity.Should().Be(AuditSeverity.Critical);
        entity.ActorId.Should().Be("admin-456");
        entity.ActorDisplayName.Should().Be("Admin User");
        entity.ActorType.Should().Be("Admin");
        entity.Action.Should().Be("Security.PasswordReset");
        entity.TargetType.Should().Be("User");
        entity.TargetId.Should().Be("user-789");
        entity.IpAddress.Should().Be("10.0.0.1");
        entity.UserAgent.Should().Be("AdminTool/1.0");
        entity.Country.Should().Be("UK");
        entity.OccurredAt.Should().Be(occurredAt);
        entity.DataJson.Should().Be("{\"forced\":true}");
    }

    [Fact]
    public void AuditEvent_WithNullOptionalProperties_AcceptsNulls()
    {
        // Arrange & Act
        var entity = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            Country = null
        };

        // Assert
        entity.TenantId.Should().BeNull();
        entity.Country.Should().BeNull();
    }

    [Fact]
    public void AuditEvent_ActorTypeComment_SuggestsValidValues()
    {
        // Arrange & Act
        var userEntity = new AuditEvent { ActorType = "User" };
        var serviceEntity = new AuditEvent { ActorType = "Service" };
        var systemEntity = new AuditEvent { ActorType = "System" };

        // Assert
        userEntity.ActorType.Should().Be("User");
        serviceEntity.ActorType.Should().Be("Service");
        systemEntity.ActorType.Should().Be("System");
    }

    [Fact]
    public void AuditEvent_ActionFormat_AcceptsDotNotation()
    {
        // Arrange & Act
        var entity1 = new AuditEvent { Action = "User.Login" };
        var entity2 = new AuditEvent { Action = "Mfa.Verify" };
        var entity3 = new AuditEvent { Action = "Security.PasswordReset" };

        // Assert
        entity1.Action.Should().Be("User.Login");
        entity2.Action.Should().Be("Mfa.Verify");
        entity3.Action.Should().Be("Security.PasswordReset");
    }

    [Fact]
    public void AuditEvent_DataJson_CanContainComplexJson()
    {
        // Arrange
        var complexJson = "{\"user\":{\"id\":123,\"name\":\"Test\"},\"changes\":[{\"field\":\"email\",\"old\":\"a@b.com\",\"new\":\"c@d.com\"}]}";

        // Act
        var entity = new AuditEvent { DataJson = complexJson };

        // Assert
        entity.DataJson.Should().Be(complexJson);
    }

    #endregion

    #region AuditCategory Enum Tests

    [Fact]
    public void AuditCategory_HasCorrectValues()
    {
        // Assert
        ((int)AuditCategory.Authentication).Should().Be(0);
        ((int)AuditCategory.Security).Should().Be(1);
        ((int)AuditCategory.UserManagement).Should().Be(2);
        ((int)AuditCategory.ApplicationManagement).Should().Be(3);
        ((int)AuditCategory.Billing).Should().Be(4);
        ((int)AuditCategory.Federation).Should().Be(5);
        ((int)AuditCategory.Scim).Should().Be(6);
        ((int)AuditCategory.OrganizationManagement).Should().Be(7);
        ((int)AuditCategory.SystemConfiguration).Should().Be(8);
        ((int)AuditCategory.AccessControl).Should().Be(9);
    }

    [Fact]
    public void AuditCategory_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<AuditCategory>();

        // Assert
        values.Should().HaveCount(10);
    }

    [Fact]
    public void AuditCategory_AllValuesAreDefined()
    {
        // Assert
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.Authentication).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.Security).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.UserManagement).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.ApplicationManagement).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.Billing).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.Federation).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.Scim).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.OrganizationManagement).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.SystemConfiguration).Should().BeTrue();
        Enum.IsDefined(typeof(AuditCategory), AuditCategory.AccessControl).Should().BeTrue();
    }

    [Theory]
    [InlineData("Authentication", AuditCategory.Authentication)]
    [InlineData("Security", AuditCategory.Security)]
    [InlineData("UserManagement", AuditCategory.UserManagement)]
    [InlineData("ApplicationManagement", AuditCategory.ApplicationManagement)]
    [InlineData("Billing", AuditCategory.Billing)]
    [InlineData("Federation", AuditCategory.Federation)]
    [InlineData("Scim", AuditCategory.Scim)]
    [InlineData("OrganizationManagement", AuditCategory.OrganizationManagement)]
    [InlineData("SystemConfiguration", AuditCategory.SystemConfiguration)]
    [InlineData("AccessControl", AuditCategory.AccessControl)]
    public void AuditCategory_ParsesFromString(string name, AuditCategory expected)
    {
        // Act
        var parsed = Enum.Parse<AuditCategory>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    #endregion

    #region AuditSeverity Enum Tests

    [Fact]
    public void AuditSeverity_HasCorrectValues()
    {
        // Assert
        ((int)AuditSeverity.Info).Should().Be(0);
        ((int)AuditSeverity.Warning).Should().Be(1);
        ((int)AuditSeverity.Error).Should().Be(2);
        ((int)AuditSeverity.Critical).Should().Be(3);
    }

    [Fact]
    public void AuditSeverity_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<AuditSeverity>();

        // Assert
        values.Should().HaveCount(4);
    }

    [Fact]
    public void AuditSeverity_AllValuesAreDefined()
    {
        // Assert
        Enum.IsDefined(typeof(AuditSeverity), AuditSeverity.Info).Should().BeTrue();
        Enum.IsDefined(typeof(AuditSeverity), AuditSeverity.Warning).Should().BeTrue();
        Enum.IsDefined(typeof(AuditSeverity), AuditSeverity.Error).Should().BeTrue();
        Enum.IsDefined(typeof(AuditSeverity), AuditSeverity.Critical).Should().BeTrue();
    }

    [Theory]
    [InlineData("Info", AuditSeverity.Info)]
    [InlineData("Warning", AuditSeverity.Warning)]
    [InlineData("Error", AuditSeverity.Error)]
    [InlineData("Critical", AuditSeverity.Critical)]
    public void AuditSeverity_ParsesFromString(string name, AuditSeverity expected)
    {
        // Act
        var parsed = Enum.Parse<AuditSeverity>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    [Fact]
    public void AuditSeverity_SeveritiesAreOrdered()
    {
        // Assert - Info < Warning < Error < Critical
        AuditSeverity.Info.Should().BeLessThan(AuditSeverity.Warning);
        AuditSeverity.Warning.Should().BeLessThan(AuditSeverity.Error);
        AuditSeverity.Error.Should().BeLessThan(AuditSeverity.Critical);
    }

    #endregion

    #region Other Enums Tests

    [Fact]
    public void LogStreamType_Exists()
    {
        // This test verifies the enum exists and can be used
        var values = Enum.GetValues<LogStreamType>();
        values.Should().NotBeEmpty();
    }

    [Fact]
    public void AlertChannelType_Exists()
    {
        // This test verifies the enum exists and can be used
        var values = Enum.GetValues<AlertChannelType>();
        values.Should().NotBeEmpty();
    }

    [Fact]
    public void AlertRuleType_Exists()
    {
        // This test verifies the enum exists and can be used
        var values = Enum.GetValues<AlertRuleType>();
        values.Should().NotBeEmpty();
    }

    #endregion
}
