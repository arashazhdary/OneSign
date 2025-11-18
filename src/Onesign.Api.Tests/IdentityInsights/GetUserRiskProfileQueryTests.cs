using FluentAssertions;
using Onesign.Modules.IdentityInsights.Application.Queries;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class GetUserRiskProfileQueryTests
{
    #region GetUserRiskProfileQuery Tests

    [Fact]
    public void GetUserRiskProfileQuery_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var query = new GetUserRiskProfileQuery();

        // Assert
        query.TenantId.Should().Be(Guid.Empty);
        query.UserId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void GetUserRiskProfileQuery_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Act
        var query = new GetUserRiskProfileQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
        query.UserId.Should().Be(userId);
    }

    [Fact]
    public void GetUserRiskProfileQuery_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var query1 = new GetUserRiskProfileQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        var query2 = new GetUserRiskProfileQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Assert
        query1.TenantId.Should().NotBe(query2.TenantId);
        query1.UserId.Should().NotBe(query2.UserId);
    }

    #endregion

    #region UserRiskProfileDto Tests

    [Fact]
    public void UserRiskProfileDto_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var dto = new UserRiskProfileDto();

        // Assert
        dto.UserId.Should().Be(Guid.Empty);
        dto.UserDisplayName.Should().Be(string.Empty);
        dto.RiskScore.Should().Be(0);
        dto.RiskFactors.Should().NotBeNull();
        dto.RiskFactors.Should().BeEmpty();
        dto.MfaEnabled.Should().BeFalse();
        dto.PrivilegedRolesCount.Should().Be(0);
    }

    [Fact]
    public void UserRiskProfileDto_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var dto = new UserRiskProfileDto
        {
            UserId = userId,
            UserDisplayName = "John Doe",
            RiskScore = 85,
            RiskFactors = new List<RiskFactorDto>
            {
                new() { Factor = "no_mfa", ImpactScore = 30 },
                new() { Factor = "excessive_privileges", ImpactScore = 25 }
            },
            MfaEnabled = false,
            PrivilegedRolesCount = 5
        };

        // Assert
        dto.UserId.Should().Be(userId);
        dto.UserDisplayName.Should().Be("John Doe");
        dto.RiskScore.Should().Be(85);
        dto.RiskFactors.Should().HaveCount(2);
        dto.MfaEnabled.Should().BeFalse();
        dto.PrivilegedRolesCount.Should().Be(5);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void UserRiskProfileDto_RiskScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var dto = new UserRiskProfileDto { RiskScore = score };

        // Assert
        dto.RiskScore.Should().Be(score);
    }

    [Fact]
    public void UserRiskProfileDto_MfaEnabled_ShouldBeTrue()
    {
        // Arrange & Act
        var dto = new UserRiskProfileDto { MfaEnabled = true };

        // Assert
        dto.MfaEnabled.Should().BeTrue();
    }

    [Fact]
    public void UserRiskProfileDto_EmptyRiskFactors_ShouldBeAllowed()
    {
        // Arrange & Act
        var dto = new UserRiskProfileDto { RiskFactors = new List<RiskFactorDto>() };

        // Assert
        dto.RiskFactors.Should().BeEmpty();
    }

    [Fact]
    public void UserRiskProfileDto_MultipleRiskFactors_ShouldBeStored()
    {
        // Arrange
        var factors = new List<RiskFactorDto>
        {
            new() { Factor = "no_mfa", ImpactScore = 30 },
            new() { Factor = "excessive_privileges", ImpactScore = 25 },
            new() { Factor = "inactive_account", ImpactScore = 20 }
        };

        // Act
        var dto = new UserRiskProfileDto { RiskFactors = factors };

        // Assert
        dto.RiskFactors.Should().HaveCount(3);
        dto.RiskFactors[0].Factor.Should().Be("no_mfa");
        dto.RiskFactors[1].Factor.Should().Be("excessive_privileges");
        dto.RiskFactors[2].Factor.Should().Be("inactive_account");
    }

    [Fact]
    public void UserRiskProfileDto_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var dto1 = new UserRiskProfileDto
        {
            UserId = Guid.NewGuid(),
            RiskScore = 30
        };

        var dto2 = new UserRiskProfileDto
        {
            UserId = Guid.NewGuid(),
            RiskScore = 70
        };

        // Assert
        dto1.UserId.Should().NotBe(dto2.UserId);
        dto1.RiskScore.Should().NotBe(dto2.RiskScore);
    }

    #endregion

    #region RiskFactorDto Tests

    [Fact]
    public void RiskFactorDto_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var dto = new RiskFactorDto();

        // Assert
        dto.Factor.Should().Be(string.Empty);
        dto.ImpactScore.Should().Be(0);
    }

    [Fact]
    public void RiskFactorDto_SetProperties_ShouldRetainValues()
    {
        // Arrange & Act
        var dto = new RiskFactorDto
        {
            Factor = "no_mfa",
            ImpactScore = 30
        };

        // Assert
        dto.Factor.Should().Be("no_mfa");
        dto.ImpactScore.Should().Be(30);
    }

    [Theory]
    [InlineData("no_mfa", 30)]
    [InlineData("excessive_privileges", 25)]
    [InlineData("inactive_account", 20)]
    [InlineData("failed_logins", 15)]
    [InlineData("suspicious_location", 10)]
    public void RiskFactorDto_CommonFactors_ShouldBeAssignable(string factor, int impactScore)
    {
        // Arrange & Act
        var dto = new RiskFactorDto
        {
            Factor = factor,
            ImpactScore = impactScore
        };

        // Assert
        dto.Factor.Should().Be(factor);
        dto.ImpactScore.Should().Be(impactScore);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(100)]
    public void RiskFactorDto_ImpactScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var dto = new RiskFactorDto { ImpactScore = score };

        // Assert
        dto.ImpactScore.Should().Be(score);
    }

    [Fact]
    public void RiskFactorDto_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var dto1 = new RiskFactorDto
        {
            Factor = "factor1",
            ImpactScore = 10
        };

        var dto2 = new RiskFactorDto
        {
            Factor = "factor2",
            ImpactScore = 20
        };

        // Assert
        dto1.Factor.Should().NotBe(dto2.Factor);
        dto1.ImpactScore.Should().NotBe(dto2.ImpactScore);
    }

    [Fact]
    public void RiskFactorDto_EmptyFactor_ShouldBeAllowed()
    {
        // Arrange & Act
        var dto = new RiskFactorDto { Factor = string.Empty };

        // Assert
        dto.Factor.Should().BeEmpty();
    }

    #endregion
}
