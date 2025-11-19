using FluentAssertions;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;
using AuditEventEntity = Onesign.Modules.Observability.Infrastructure.EfCore.Entities.ObservabilityAuditEventEntity;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditEventEntityTests
{
    #region ToDomain Tests

    [Fact]
    public void ToDomain_WithAllPropertiesSet_MapsCorrectly()
    {
        // Arrange
        var entity = new AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-123",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user-456",
            ActorDisplayName = "John Doe",
            ActorType = "User",
            Action = "User.Login",
            TargetType = "Session",
            TargetId = "session-789",
            IpAddress = "192.168.1.100",
            UserAgent = "Mozilla/5.0",
            Country = "US",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{\"browser\":\"Chrome\"}"
        };

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.Id.Should().Be(entity.Id);
        domain.TenantId.Should().Be(entity.TenantId);
        domain.CorrelationId.Should().Be(entity.CorrelationId);
        domain.Category.Should().Be(entity.Category);
        domain.Severity.Should().Be(entity.Severity);
        domain.ActorId.Should().Be(entity.ActorId);
        domain.ActorDisplayName.Should().Be(entity.ActorDisplayName);
        domain.ActorType.Should().Be(entity.ActorType);
        domain.Action.Should().Be(entity.Action);
        domain.TargetType.Should().Be(entity.TargetType);
        domain.TargetId.Should().Be(entity.TargetId);
        domain.IpAddress.Should().Be(entity.IpAddress);
        domain.UserAgent.Should().Be(entity.UserAgent);
        domain.Country.Should().Be(entity.Country);
        domain.OccurredAt.Should().Be(entity.OccurredAt);
        domain.DataJson.Should().Be(entity.DataJson);
    }

    [Fact]
    public void ToDomain_WithNullTenantId_MapsNull()
    {
        // Arrange
        var entity = new AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            CorrelationId = "correlation",
            Category = AuditCategory.SystemConfiguration,
            Severity = AuditSeverity.Info,
            ActorId = "system",
            ActorDisplayName = "System",
            ActorType = "System",
            Action = "System.Startup",
            TargetType = "System",
            TargetId = "system",
            IpAddress = "0.0.0.0",
            UserAgent = "System",
            Country = null,
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.TenantId.Should().BeNull();
        domain.Country.Should().BeNull();
    }

    [Fact]
    public void ToDomain_WithEmptyStrings_PreservesEmptyStrings()
    {
        // Arrange
        var entity = new AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "",
            ActorDisplayName = "",
            ActorType = "",
            Action = "",
            TargetType = "",
            TargetId = "",
            IpAddress = "",
            UserAgent = "",
            OccurredAt = DateTime.UtcNow,
            DataJson = ""
        };

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.CorrelationId.Should().BeEmpty();
        domain.ActorId.Should().BeEmpty();
        domain.ActorDisplayName.Should().BeEmpty();
        domain.ActorType.Should().BeEmpty();
        domain.Action.Should().BeEmpty();
        domain.TargetType.Should().BeEmpty();
        domain.TargetId.Should().BeEmpty();
        domain.IpAddress.Should().BeEmpty();
        domain.UserAgent.Should().BeEmpty();
        domain.DataJson.Should().BeEmpty();
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.ApplicationManagement)]
    [InlineData(AuditCategory.Billing)]
    [InlineData(AuditCategory.Federation)]
    [InlineData(AuditCategory.Scim)]
    [InlineData(AuditCategory.OrganizationManagement)]
    [InlineData(AuditCategory.SystemConfiguration)]
    [InlineData(AuditCategory.AccessControl)]
    public void ToDomain_WithAllCategories_MapsCorrectly(AuditCategory category)
    {
        // Arrange
        var entity = CreateEntity();
        entity.Category = category;

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public void ToDomain_WithAllSeverities_MapsCorrectly(AuditSeverity severity)
    {
        // Arrange
        var entity = CreateEntity();
        entity.Severity = severity;

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.Severity.Should().Be(severity);
    }

    [Fact]
    public void ToDomain_WithSpecialCharacters_PreservesCharacters()
    {
        // Arrange
        var entity = new AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-!@#$%^&*()",
            Category = AuditCategory.UserManagement,
            Severity = AuditSeverity.Info,
            ActorId = "user@example.com",
            ActorDisplayName = "John O'Brien",
            ActorType = "User",
            Action = "User.Update",
            TargetType = "User Profile",
            TargetId = "target/123",
            IpAddress = "2001:0db8:85a3::8a2e:0370:7334",
            UserAgent = "Mozilla/5.0 (compatible; \"Test\")",
            Country = "US",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{\"message\":\"Hello\\nWorld\"}"
        };

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.CorrelationId.Should().Be("correlation-!@#$%^&*()");
        domain.ActorDisplayName.Should().Be("John O'Brien");
        domain.IpAddress.Should().Be("2001:0db8:85a3::8a2e:0370:7334");
    }

    [Fact]
    public void ToDomain_PreservesExactDateTime()
    {
        // Arrange
        var occurredAt = new DateTime(2020, 6, 15, 10, 30, 45, 123, DateTimeKind.Utc);
        var entity = CreateEntity();
        entity.OccurredAt = occurredAt;

        // Act
        var domain = entity.ToDomain();

        // Assert
        domain.OccurredAt.Should().Be(occurredAt);
    }

    #endregion

    #region FromDomain Tests

    [Fact]
    public void FromDomain_WithAllPropertiesSet_MapsCorrectly()
    {
        // Arrange
        var domain = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
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
            OccurredAt = DateTime.UtcNow,
            DataJson = "{\"forced\":true}"
        };

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.Id.Should().Be(domain.Id);
        entity.TenantId.Should().Be(domain.TenantId);
        entity.CorrelationId.Should().Be(domain.CorrelationId);
        entity.Category.Should().Be(domain.Category);
        entity.Severity.Should().Be(domain.Severity);
        entity.ActorId.Should().Be(domain.ActorId);
        entity.ActorDisplayName.Should().Be(domain.ActorDisplayName);
        entity.ActorType.Should().Be(domain.ActorType);
        entity.Action.Should().Be(domain.Action);
        entity.TargetType.Should().Be(domain.TargetType);
        entity.TargetId.Should().Be(domain.TargetId);
        entity.IpAddress.Should().Be(domain.IpAddress);
        entity.UserAgent.Should().Be(domain.UserAgent);
        entity.Country.Should().Be(domain.Country);
        entity.OccurredAt.Should().Be(domain.OccurredAt);
        entity.DataJson.Should().Be(domain.DataJson);
    }

    [Fact]
    public void FromDomain_WithNullTenantId_MapsNull()
    {
        // Arrange
        var domain = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            CorrelationId = "correlation",
            Category = AuditCategory.SystemConfiguration,
            Severity = AuditSeverity.Info,
            ActorId = "system",
            ActorDisplayName = "System",
            ActorType = "System",
            Action = "System.Startup",
            TargetType = "System",
            TargetId = "system",
            IpAddress = "0.0.0.0",
            UserAgent = "System",
            Country = null,
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.TenantId.Should().BeNull();
        entity.Country.Should().BeNull();
    }

    [Fact]
    public void FromDomain_WithEmptyStrings_PreservesEmptyStrings()
    {
        // Arrange
        var domain = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "",
            ActorDisplayName = "",
            ActorType = "",
            Action = "",
            TargetType = "",
            TargetId = "",
            IpAddress = "",
            UserAgent = "",
            OccurredAt = DateTime.UtcNow,
            DataJson = ""
        };

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.CorrelationId.Should().BeEmpty();
        entity.ActorId.Should().BeEmpty();
        entity.ActorDisplayName.Should().BeEmpty();
        entity.ActorType.Should().BeEmpty();
        entity.Action.Should().BeEmpty();
        entity.TargetType.Should().BeEmpty();
        entity.TargetId.Should().BeEmpty();
        entity.IpAddress.Should().BeEmpty();
        entity.UserAgent.Should().BeEmpty();
        entity.DataJson.Should().BeEmpty();
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.ApplicationManagement)]
    [InlineData(AuditCategory.Billing)]
    [InlineData(AuditCategory.Federation)]
    [InlineData(AuditCategory.Scim)]
    [InlineData(AuditCategory.OrganizationManagement)]
    [InlineData(AuditCategory.SystemConfiguration)]
    [InlineData(AuditCategory.AccessControl)]
    public void FromDomain_WithAllCategories_MapsCorrectly(AuditCategory category)
    {
        // Arrange
        var domain = CreateDomain();
        domain.Category = category;

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public void FromDomain_WithAllSeverities_MapsCorrectly(AuditSeverity severity)
    {
        // Arrange
        var domain = CreateDomain();
        domain.Severity = severity;

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.Severity.Should().Be(severity);
    }

    [Fact]
    public void FromDomain_WithSpecialCharacters_PreservesCharacters()
    {
        // Arrange
        var domain = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-!@#$%^&*()",
            Category = AuditCategory.UserManagement,
            Severity = AuditSeverity.Info,
            ActorId = "user@example.com",
            ActorDisplayName = "John O'Brien",
            ActorType = "User",
            Action = "User.Update",
            TargetType = "User Profile",
            TargetId = "target/123",
            IpAddress = "2001:0db8:85a3::8a2e:0370:7334",
            UserAgent = "Mozilla/5.0 (compatible; \"Test\")",
            Country = "US",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{\"message\":\"Hello\\nWorld\"}"
        };

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.CorrelationId.Should().Be("correlation-!@#$%^&*()");
        entity.ActorDisplayName.Should().Be("John O'Brien");
        entity.IpAddress.Should().Be("2001:0db8:85a3::8a2e:0370:7334");
    }

    [Fact]
    public void FromDomain_PreservesExactDateTime()
    {
        // Arrange
        var occurredAt = new DateTime(2020, 6, 15, 10, 30, 45, 123, DateTimeKind.Utc);
        var domain = CreateDomain();
        domain.OccurredAt = occurredAt;

        // Act
        var entity = AuditEventEntity.FromDomain(domain);

        // Assert
        entity.OccurredAt.Should().Be(occurredAt);
    }

    #endregion

    #region Round-trip Tests

    [Fact]
    public void RoundTrip_DomainToEntityToDomain_PreservesAllProperties()
    {
        // Arrange
        var original = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-round-trip",
            Category = AuditCategory.Billing,
            Severity = AuditSeverity.Warning,
            ActorId = "billing-service",
            ActorDisplayName = "Billing Service",
            ActorType = "Service",
            Action = "Invoice.Generated",
            TargetType = "Invoice",
            TargetId = "invoice-123",
            IpAddress = "10.0.0.50",
            UserAgent = "BillingService/2.0",
            Country = "DE",
            OccurredAt = DateTime.UtcNow.AddHours(-1),
            DataJson = "{\"amount\":500,\"currency\":\"EUR\"}"
        };

        // Act
        var entity = AuditEventEntity.FromDomain(original);
        var result = entity.ToDomain();

        // Assert
        result.Id.Should().Be(original.Id);
        result.TenantId.Should().Be(original.TenantId);
        result.CorrelationId.Should().Be(original.CorrelationId);
        result.Category.Should().Be(original.Category);
        result.Severity.Should().Be(original.Severity);
        result.ActorId.Should().Be(original.ActorId);
        result.ActorDisplayName.Should().Be(original.ActorDisplayName);
        result.ActorType.Should().Be(original.ActorType);
        result.Action.Should().Be(original.Action);
        result.TargetType.Should().Be(original.TargetType);
        result.TargetId.Should().Be(original.TargetId);
        result.IpAddress.Should().Be(original.IpAddress);
        result.UserAgent.Should().Be(original.UserAgent);
        result.Country.Should().Be(original.Country);
        result.OccurredAt.Should().Be(original.OccurredAt);
        result.DataJson.Should().Be(original.DataJson);
    }

    [Fact]
    public void RoundTrip_WithNullValues_PreservesNulls()
    {
        // Arrange
        var original = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            CorrelationId = "correlation",
            Category = AuditCategory.SystemConfiguration,
            Severity = AuditSeverity.Info,
            ActorId = "system",
            ActorDisplayName = "System",
            ActorType = "System",
            Action = "Config.Changed",
            TargetType = "Config",
            TargetId = "config-key",
            IpAddress = "127.0.0.1",
            UserAgent = "System",
            Country = null,
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };

        // Act
        var entity = AuditEventEntity.FromDomain(original);
        var result = entity.ToDomain();

        // Assert
        result.TenantId.Should().BeNull();
        result.Country.Should().BeNull();
    }

    #endregion

    #region Helper Methods

    private static AuditEventEntity CreateEntity()
    {
        return new AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user",
            ActorDisplayName = "User",
            ActorType = "User",
            Action = "Test",
            TargetType = "Target",
            TargetId = "target",
            IpAddress = "127.0.0.1",
            UserAgent = "Test",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };
    }

    private static AuditEvent CreateDomain()
    {
        return new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user",
            ActorDisplayName = "User",
            ActorType = "User",
            Action = "Test",
            TargetType = "Target",
            TargetId = "target",
            IpAddress = "127.0.0.1",
            UserAgent = "Test",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };
    }

    #endregion
}
