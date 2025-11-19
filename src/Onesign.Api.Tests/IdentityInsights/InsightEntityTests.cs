using FluentAssertions;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class InsightEntityTests
{
    [Fact]
    public void InsightEntity_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var entity = new InsightEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.Type.Should().Be(0);
        entity.Severity.Should().Be(0);
        entity.ScopeType.Should().Be(string.Empty);
        entity.ScopeId.Should().BeNull();
        entity.Title.Should().Be(string.Empty);
        entity.MessageKey.Should().Be(string.Empty);
        entity.DataJson.Should().Be("{}");
        entity.Status.Should().Be(0);
        entity.ResolvedAt.Should().BeNull();
        entity.ResolvedBy.Should().BeNull();
    }

    [Fact]
    public void InsightEntity_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var resolvedBy = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var resolvedAt = DateTime.UtcNow.AddHours(1);

        // Act
        var entity = new InsightEntity
        {
            Id = id,
            TenantId = tenantId,
            Type = 1, // HighRiskUser
            Severity = 4, // High
            ScopeType = "User",
            ScopeId = scopeId,
            Title = "High Risk User Detected",
            MessageKey = "insights.high_risk_user",
            DataJson = "{\"userId\":\"123\",\"score\":95}",
            Status = 1, // Open
            CreatedAt = createdAt,
            ResolvedAt = resolvedAt,
            ResolvedBy = resolvedBy
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.Type.Should().Be(1);
        entity.Severity.Should().Be(4);
        entity.ScopeType.Should().Be("User");
        entity.ScopeId.Should().Be(scopeId);
        entity.Title.Should().Be("High Risk User Detected");
        entity.MessageKey.Should().Be("insights.high_risk_user");
        entity.DataJson.Should().Be("{\"userId\":\"123\",\"score\":95}");
        entity.Status.Should().Be(1);
        entity.CreatedAt.Should().Be(createdAt);
        entity.ResolvedAt.Should().Be(resolvedAt);
        entity.ResolvedBy.Should().Be(resolvedBy);
    }

    [Theory]
    [InlineData(1)] // HighRiskUser
    [InlineData(2)] // ZombieAccount
    [InlineData(3)] // ExcessivePrivileges
    [InlineData(4)] // TenantHighRisk
    [InlineData(5)] // SuspiciousLogin
    [InlineData(6)] // MfaNotEnabled
    public void InsightEntity_TypeValues_ShouldBeAssignable(int type)
    {
        // Arrange & Act
        var entity = new InsightEntity { Type = type };

        // Assert
        entity.Type.Should().Be(type);
    }

    [Theory]
    [InlineData(1)] // Info
    [InlineData(2)] // Low
    [InlineData(3)] // Medium
    [InlineData(4)] // High
    [InlineData(5)] // Critical
    public void InsightEntity_SeverityValues_ShouldBeAssignable(int severity)
    {
        // Arrange & Act
        var entity = new InsightEntity { Severity = severity };

        // Assert
        entity.Severity.Should().Be(severity);
    }

    [Theory]
    [InlineData(1)] // Open
    [InlineData(2)] // Resolved
    [InlineData(3)] // Dismissed
    public void InsightEntity_StatusValues_ShouldBeAssignable(int status)
    {
        // Arrange & Act
        var entity = new InsightEntity { Status = status };

        // Assert
        entity.Status.Should().Be(status);
    }

    [Fact]
    public void InsightEntity_NullScopeId_ShouldBeAllowed()
    {
        // Arrange & Act
        var entity = new InsightEntity { ScopeId = null };

        // Assert
        entity.ScopeId.Should().BeNull();
    }

    [Fact]
    public void InsightEntity_NullResolvedAt_ShouldBeAllowed()
    {
        // Arrange & Act
        var entity = new InsightEntity { ResolvedAt = null };

        // Assert
        entity.ResolvedAt.Should().BeNull();
    }

    [Fact]
    public void InsightEntity_NullResolvedBy_ShouldBeAllowed()
    {
        // Arrange & Act
        var entity = new InsightEntity { ResolvedBy = null };

        // Assert
        entity.ResolvedBy.Should().BeNull();
    }

    [Theory]
    [InlineData("User")]
    [InlineData("Tenant")]
    [InlineData("App")]
    public void InsightEntity_ScopeTypes_ShouldBeAssignable(string scopeType)
    {
        // Arrange & Act
        var entity = new InsightEntity { ScopeType = scopeType };

        // Assert
        entity.ScopeType.Should().Be(scopeType);
    }

    [Fact]
    public void InsightEntity_ComplexDataJson_ShouldBeStored()
    {
        // Arrange
        var complexJson = "{\"factors\":[{\"name\":\"no_mfa\",\"weight\":30}],\"totalScore\":85}";

        // Act
        var entity = new InsightEntity { DataJson = complexJson };

        // Assert
        entity.DataJson.Should().Be(complexJson);
    }

    [Fact]
    public void InsightEntity_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var entity1 = new InsightEntity
        {
            Id = Guid.NewGuid(),
            Title = "Entity 1"
        };

        var entity2 = new InsightEntity
        {
            Id = Guid.NewGuid(),
            Title = "Entity 2"
        };

        // Assert
        entity1.Id.Should().NotBe(entity2.Id);
        entity1.Title.Should().NotBe(entity2.Title);
    }
}
