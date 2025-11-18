using FluentAssertions;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class TenantRiskProfileEntityTests
{
    [Fact]
    public void TenantRiskProfileEntity_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.RiskScore.Should().Be(0);
        entity.UsersCount.Should().Be(0);
        entity.HighRiskUsersCount.Should().Be(0);
        entity.MfaEnrollmentRate.Should().Be(0);
        entity.PrivilegedUsersCount.Should().Be(0);
        entity.FailedLoginRate.Should().Be(0);
        entity.OpenGovernanceFindingsCount.Should().Be(0);
    }

    [Fact]
    public void TenantRiskProfileEntity_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var calculatedAt = DateTime.UtcNow;

        // Act
        var entity = new TenantRiskProfileEntity
        {
            Id = id,
            TenantId = tenantId,
            RiskScore = 65,
            UsersCount = 100,
            HighRiskUsersCount = 15,
            MfaEnrollmentRate = 75.5m,
            PrivilegedUsersCount = 10,
            FailedLoginRate = 5.25m,
            OpenGovernanceFindingsCount = 25,
            CalculatedAt = calculatedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.RiskScore.Should().Be(65);
        entity.UsersCount.Should().Be(100);
        entity.HighRiskUsersCount.Should().Be(15);
        entity.MfaEnrollmentRate.Should().Be(75.5m);
        entity.PrivilegedUsersCount.Should().Be(10);
        entity.FailedLoginRate.Should().Be(5.25m);
        entity.OpenGovernanceFindingsCount.Should().Be(25);
        entity.CalculatedAt.Should().Be(calculatedAt);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void TenantRiskProfileEntity_RiskScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { RiskScore = score };

        // Assert
        entity.RiskScore.Should().Be(score);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(100)]
    [InlineData(1000)]
    [InlineData(10000)]
    public void TenantRiskProfileEntity_UsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { UsersCount = count };

        // Assert
        entity.UsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    public void TenantRiskProfileEntity_HighRiskUsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { HighRiskUsersCount = count };

        // Assert
        entity.HighRiskUsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25.5)]
    [InlineData(50.0)]
    [InlineData(75.75)]
    [InlineData(100)]
    public void TenantRiskProfileEntity_MfaEnrollmentRate_ShouldBeAssignable(decimal rate)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { MfaEnrollmentRate = rate };

        // Assert
        entity.MfaEnrollmentRate.Should().Be(rate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(50)]
    public void TenantRiskProfileEntity_PrivilegedUsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { PrivilegedUsersCount = count };

        // Assert
        entity.PrivilegedUsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1.5)]
    [InlineData(5.25)]
    [InlineData(10.0)]
    [InlineData(25.75)]
    public void TenantRiskProfileEntity_FailedLoginRate_ShouldBeAssignable(decimal rate)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { FailedLoginRate = rate };

        // Assert
        entity.FailedLoginRate.Should().Be(rate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    [InlineData(100)]
    public void TenantRiskProfileEntity_OpenGovernanceFindingsCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { OpenGovernanceFindingsCount = count };

        // Assert
        entity.OpenGovernanceFindingsCount.Should().Be(count);
    }

    [Fact]
    public void TenantRiskProfileEntity_DecimalPrecision_ShouldBePreserved()
    {
        // Arrange
        var mfaRate = 75.55m;
        var failedLoginRate = 5.25m;

        // Act
        var entity = new TenantRiskProfileEntity
        {
            MfaEnrollmentRate = mfaRate,
            FailedLoginRate = failedLoginRate
        };

        // Assert
        entity.MfaEnrollmentRate.Should().Be(75.55m);
        entity.FailedLoginRate.Should().Be(5.25m);
    }

    [Fact]
    public void TenantRiskProfileEntity_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var entity1 = new TenantRiskProfileEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RiskScore = 30
        };

        var entity2 = new TenantRiskProfileEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RiskScore = 70
        };

        // Assert
        entity1.Id.Should().NotBe(entity2.Id);
        entity1.TenantId.Should().NotBe(entity2.TenantId);
        entity1.RiskScore.Should().NotBe(entity2.RiskScore);
    }

    [Fact]
    public void TenantRiskProfileEntity_ZeroUsers_ShouldBeValid()
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity
        {
            UsersCount = 0,
            HighRiskUsersCount = 0,
            PrivilegedUsersCount = 0
        };

        // Assert
        entity.UsersCount.Should().Be(0);
        entity.HighRiskUsersCount.Should().Be(0);
        entity.PrivilegedUsersCount.Should().Be(0);
    }

    [Fact]
    public void TenantRiskProfileEntity_MaxMfaEnrollmentRate_ShouldBe100()
    {
        // Arrange & Act
        var entity = new TenantRiskProfileEntity { MfaEnrollmentRate = 100m };

        // Assert
        entity.MfaEnrollmentRate.Should().Be(100m);
    }

    [Fact]
    public void TenantRiskProfileEntity_CalculatedAt_ShouldBeSet()
    {
        // Arrange
        var calculatedAt = DateTime.UtcNow;

        // Act
        var entity = new TenantRiskProfileEntity { CalculatedAt = calculatedAt };

        // Assert
        entity.CalculatedAt.Should().Be(calculatedAt);
    }
}
