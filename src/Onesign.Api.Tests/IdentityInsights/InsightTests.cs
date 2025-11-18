using FluentAssertions;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class InsightTests
{
    [Fact]
    public void Insight_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var insight = new Insight();

        // Assert
        insight.Id.Should().Be(Guid.Empty);
        insight.TenantId.Should().Be(Guid.Empty);
        insight.ScopeType.Should().Be(string.Empty);
        insight.ScopeId.Should().BeNull();
        insight.Title.Should().Be(string.Empty);
        insight.MessageKey.Should().Be(string.Empty);
        insight.DataJson.Should().Be("{}");
        insight.ResolvedAt.Should().BeNull();
        insight.ResolvedBy.Should().BeNull();
    }

    [Fact]
    public void Insight_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var resolvedBy = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var resolvedAt = DateTime.UtcNow.AddHours(1);

        // Act
        var insight = new Insight
        {
            Id = id,
            TenantId = tenantId,
            Type = InsightType.HighRiskUser,
            Severity = InsightSeverity.Critical,
            ScopeType = "User",
            ScopeId = scopeId,
            Title = "High Risk User Detected",
            MessageKey = "insights.high_risk_user",
            DataJson = "{\"userId\":\"123\",\"score\":95}",
            Status = InsightStatus.Open,
            CreatedAt = createdAt,
            ResolvedAt = resolvedAt,
            ResolvedBy = resolvedBy
        };

        // Assert
        insight.Id.Should().Be(id);
        insight.TenantId.Should().Be(tenantId);
        insight.Type.Should().Be(InsightType.HighRiskUser);
        insight.Severity.Should().Be(InsightSeverity.Critical);
        insight.ScopeType.Should().Be("User");
        insight.ScopeId.Should().Be(scopeId);
        insight.Title.Should().Be("High Risk User Detected");
        insight.MessageKey.Should().Be("insights.high_risk_user");
        insight.DataJson.Should().Be("{\"userId\":\"123\",\"score\":95}");
        insight.Status.Should().Be(InsightStatus.Open);
        insight.CreatedAt.Should().Be(createdAt);
        insight.ResolvedAt.Should().Be(resolvedAt);
        insight.ResolvedBy.Should().Be(resolvedBy);
    }

    [Theory]
    [InlineData(InsightType.HighRiskUser)]
    [InlineData(InsightType.ZombieAccount)]
    [InlineData(InsightType.ExcessivePrivileges)]
    [InlineData(InsightType.TenantHighRisk)]
    [InlineData(InsightType.SuspiciousLogin)]
    [InlineData(InsightType.MfaNotEnabled)]
    public void Insight_AllInsightTypes_ShouldBeAssignable(InsightType type)
    {
        // Arrange & Act
        var insight = new Insight { Type = type };

        // Assert
        insight.Type.Should().Be(type);
    }

    [Theory]
    [InlineData(InsightSeverity.Info)]
    [InlineData(InsightSeverity.Low)]
    [InlineData(InsightSeverity.Medium)]
    [InlineData(InsightSeverity.High)]
    [InlineData(InsightSeverity.Critical)]
    public void Insight_AllSeverityLevels_ShouldBeAssignable(InsightSeverity severity)
    {
        // Arrange & Act
        var insight = new Insight { Severity = severity };

        // Assert
        insight.Severity.Should().Be(severity);
    }

    [Theory]
    [InlineData(InsightStatus.Open)]
    [InlineData(InsightStatus.Resolved)]
    [InlineData(InsightStatus.Dismissed)]
    public void Insight_AllStatusValues_ShouldBeAssignable(InsightStatus status)
    {
        // Arrange & Act
        var insight = new Insight { Status = status };

        // Assert
        insight.Status.Should().Be(status);
    }

    [Fact]
    public void Insight_NullScopeId_ShouldBeAllowed()
    {
        // Arrange & Act
        var insight = new Insight
        {
            ScopeType = "Tenant",
            ScopeId = null
        };

        // Assert
        insight.ScopeId.Should().BeNull();
    }

    [Theory]
    [InlineData("User")]
    [InlineData("Tenant")]
    [InlineData("App")]
    public void Insight_DifferentScopeTypes_ShouldBeAssignable(string scopeType)
    {
        // Arrange & Act
        var insight = new Insight { ScopeType = scopeType };

        // Assert
        insight.ScopeType.Should().Be(scopeType);
    }

    [Fact]
    public void Insight_ComplexDataJson_ShouldBeStored()
    {
        // Arrange
        var complexJson = "{\"factors\":[{\"name\":\"no_mfa\",\"weight\":30},{\"name\":\"failed_logins\",\"weight\":25}],\"totalScore\":85}";

        // Act
        var insight = new Insight { DataJson = complexJson };

        // Assert
        insight.DataJson.Should().Be(complexJson);
    }

    [Fact]
    public void Insight_ResolvedState_ShouldHaveResolvedAtAndResolvedBy()
    {
        // Arrange
        var resolvedAt = DateTime.UtcNow;
        var resolvedBy = Guid.NewGuid();

        // Act
        var insight = new Insight
        {
            Status = InsightStatus.Resolved,
            ResolvedAt = resolvedAt,
            ResolvedBy = resolvedBy
        };

        // Assert
        insight.Status.Should().Be(InsightStatus.Resolved);
        insight.ResolvedAt.Should().Be(resolvedAt);
        insight.ResolvedBy.Should().Be(resolvedBy);
    }

    [Fact]
    public void Insight_OpenStatus_ShouldNotRequireResolvedFields()
    {
        // Arrange & Act
        var insight = new Insight
        {
            Status = InsightStatus.Open,
            ResolvedAt = null,
            ResolvedBy = null
        };

        // Assert
        insight.Status.Should().Be(InsightStatus.Open);
        insight.ResolvedAt.Should().BeNull();
        insight.ResolvedBy.Should().BeNull();
    }

    [Fact]
    public void Insight_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var insight1 = new Insight
        {
            Id = Guid.NewGuid(),
            Title = "Insight 1"
        };

        var insight2 = new Insight
        {
            Id = Guid.NewGuid(),
            Title = "Insight 2"
        };

        // Assert
        insight1.Id.Should().NotBe(insight2.Id);
        insight1.Title.Should().NotBe(insight2.Title);
    }
}
