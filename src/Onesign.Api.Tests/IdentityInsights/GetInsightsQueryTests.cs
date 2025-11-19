using FluentAssertions;
using Onesign.Modules.IdentityInsights.Application.Queries;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class GetInsightsQueryTests
{
    #region GetInsightsQuery Tests

    [Fact]
    public void GetInsightsQuery_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var query = new GetInsightsQuery();

        // Assert
        query.TenantId.Should().Be(Guid.Empty);
        query.Type.Should().BeNull();
        query.Severity.Should().BeNull();
        query.Status.Should().BeNull();
    }

    [Fact]
    public void GetInsightsQuery_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var query = new GetInsightsQuery
        {
            TenantId = tenantId,
            Type = "HighRiskUser",
            Severity = "High",
            Status = "Open"
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
        query.Type.Should().Be("HighRiskUser");
        query.Severity.Should().Be("High");
        query.Status.Should().Be("Open");
    }

    [Fact]
    public void GetInsightsQuery_NullFilters_ShouldBeAllowed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var query = new GetInsightsQuery
        {
            TenantId = tenantId,
            Type = null,
            Severity = null,
            Status = null
        };

        // Assert
        query.Type.Should().BeNull();
        query.Severity.Should().BeNull();
        query.Status.Should().BeNull();
    }

    [Theory]
    [InlineData("HighRiskUser")]
    [InlineData("ZombieAccount")]
    [InlineData("ExcessivePrivileges")]
    [InlineData("TenantHighRisk")]
    [InlineData("SuspiciousLogin")]
    [InlineData("MfaNotEnabled")]
    public void GetInsightsQuery_AllInsightTypes_ShouldBeAssignable(string type)
    {
        // Arrange & Act
        var query = new GetInsightsQuery { Type = type };

        // Assert
        query.Type.Should().Be(type);
    }

    [Theory]
    [InlineData("Info")]
    [InlineData("Low")]
    [InlineData("Medium")]
    [InlineData("High")]
    [InlineData("Critical")]
    public void GetInsightsQuery_AllSeverityLevels_ShouldBeAssignable(string severity)
    {
        // Arrange & Act
        var query = new GetInsightsQuery { Severity = severity };

        // Assert
        query.Severity.Should().Be(severity);
    }

    [Theory]
    [InlineData("Open")]
    [InlineData("Resolved")]
    [InlineData("Dismissed")]
    public void GetInsightsQuery_AllStatusValues_ShouldBeAssignable(string status)
    {
        // Arrange & Act
        var query = new GetInsightsQuery { Status = status };

        // Assert
        query.Status.Should().Be(status);
    }

    #endregion

    #region InsightDto Tests

    [Fact]
    public void InsightDto_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var dto = new InsightDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.Type.Should().Be(string.Empty);
        dto.Severity.Should().Be(string.Empty);
        dto.ScopeType.Should().Be(string.Empty);
        dto.ScopeId.Should().BeNull();
        dto.Title.Should().Be(string.Empty);
        dto.Status.Should().Be(string.Empty);
    }

    [Fact]
    public void InsightDto_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        // Act
        var dto = new InsightDto
        {
            Id = id,
            Type = "HighRiskUser",
            Severity = "Critical",
            ScopeType = "User",
            ScopeId = scopeId,
            Title = "High Risk User Detected",
            Status = "Open",
            CreatedAt = createdAt
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.Type.Should().Be("HighRiskUser");
        dto.Severity.Should().Be("Critical");
        dto.ScopeType.Should().Be("User");
        dto.ScopeId.Should().Be(scopeId);
        dto.Title.Should().Be("High Risk User Detected");
        dto.Status.Should().Be("Open");
        dto.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void InsightDto_NullScopeId_ShouldBeAllowed()
    {
        // Arrange & Act
        var dto = new InsightDto
        {
            ScopeType = "Tenant",
            ScopeId = null
        };

        // Assert
        dto.ScopeId.Should().BeNull();
    }

    [Theory]
    [InlineData("User")]
    [InlineData("Tenant")]
    [InlineData("App")]
    public void InsightDto_DifferentScopeTypes_ShouldBeAssignable(string scopeType)
    {
        // Arrange & Act
        var dto = new InsightDto { ScopeType = scopeType };

        // Assert
        dto.ScopeType.Should().Be(scopeType);
    }

    [Fact]
    public void InsightDto_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var dto1 = new InsightDto
        {
            Id = Guid.NewGuid(),
            Title = "Insight 1"
        };

        var dto2 = new InsightDto
        {
            Id = Guid.NewGuid(),
            Title = "Insight 2"
        };

        // Assert
        dto1.Id.Should().NotBe(dto2.Id);
        dto1.Title.Should().NotBe(dto2.Title);
    }

    #endregion
}
