using FluentAssertions;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class TenantRiskProfileTests
{
    [Fact]
    public void TenantRiskProfile_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var profile = new TenantRiskProfile();

        // Assert
        profile.Id.Should().Be(Guid.Empty);
        profile.TenantId.Should().Be(Guid.Empty);
        profile.RiskScore.Should().Be(0);
        profile.UsersCount.Should().Be(0);
        profile.HighRiskUsersCount.Should().Be(0);
        profile.MfaEnrollmentRate.Should().Be(0);
        profile.PrivilegedUsersCount.Should().Be(0);
        profile.FailedLoginRate.Should().Be(0);
        profile.OpenGovernanceFindingsCount.Should().Be(0);
    }

    [Fact]
    public void TenantRiskProfile_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var calculatedAt = DateTime.UtcNow;

        // Act
        var profile = new TenantRiskProfile
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
        profile.Id.Should().Be(id);
        profile.TenantId.Should().Be(tenantId);
        profile.RiskScore.Should().Be(65);
        profile.UsersCount.Should().Be(100);
        profile.HighRiskUsersCount.Should().Be(15);
        profile.MfaEnrollmentRate.Should().Be(75.5m);
        profile.PrivilegedUsersCount.Should().Be(10);
        profile.FailedLoginRate.Should().Be(5.25m);
        profile.OpenGovernanceFindingsCount.Should().Be(25);
        profile.CalculatedAt.Should().Be(calculatedAt);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void TenantRiskProfile_RiskScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { RiskScore = score };

        // Assert
        profile.RiskScore.Should().Be(score);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(100)]
    [InlineData(1000)]
    [InlineData(10000)]
    public void TenantRiskProfile_UsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { UsersCount = count };

        // Assert
        profile.UsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    public void TenantRiskProfile_HighRiskUsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { HighRiskUsersCount = count };

        // Assert
        profile.HighRiskUsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25.5)]
    [InlineData(50.0)]
    [InlineData(75.75)]
    [InlineData(100)]
    public void TenantRiskProfile_MfaEnrollmentRate_ShouldBeAssignable(decimal rate)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { MfaEnrollmentRate = rate };

        // Assert
        profile.MfaEnrollmentRate.Should().Be(rate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(50)]
    public void TenantRiskProfile_PrivilegedUsersCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { PrivilegedUsersCount = count };

        // Assert
        profile.PrivilegedUsersCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1.5)]
    [InlineData(5.25)]
    [InlineData(10.0)]
    [InlineData(25.75)]
    public void TenantRiskProfile_FailedLoginRate_ShouldBeAssignable(decimal rate)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { FailedLoginRate = rate };

        // Assert
        profile.FailedLoginRate.Should().Be(rate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    [InlineData(100)]
    public void TenantRiskProfile_OpenGovernanceFindingsCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { OpenGovernanceFindingsCount = count };

        // Assert
        profile.OpenGovernanceFindingsCount.Should().Be(count);
    }

    [Fact]
    public void TenantRiskProfile_LowRiskTenant_ShouldHaveLowScore()
    {
        // Arrange & Act
        var profile = new TenantRiskProfile
        {
            RiskScore = 20,
            UsersCount = 100,
            HighRiskUsersCount = 2,
            MfaEnrollmentRate = 95.0m,
            PrivilegedUsersCount = 3,
            FailedLoginRate = 1.5m,
            OpenGovernanceFindingsCount = 5
        };

        // Assert
        profile.RiskScore.Should().BeLessThanOrEqualTo(30);
        profile.MfaEnrollmentRate.Should().BeGreaterThan(90);
    }

    [Fact]
    public void TenantRiskProfile_HighRiskTenant_ShouldHaveHighScore()
    {
        // Arrange & Act
        var profile = new TenantRiskProfile
        {
            RiskScore = 85,
            UsersCount = 100,
            HighRiskUsersCount = 30,
            MfaEnrollmentRate = 25.0m,
            PrivilegedUsersCount = 20,
            FailedLoginRate = 15.5m,
            OpenGovernanceFindingsCount = 50
        };

        // Assert
        profile.RiskScore.Should().BeGreaterThanOrEqualTo(70);
        profile.MfaEnrollmentRate.Should().BeLessThan(50);
    }

    [Fact]
    public void TenantRiskProfile_HighRiskUsersCount_ShouldNotExceedUsersCount()
    {
        // Arrange
        var usersCount = 100;
        var highRiskUsersCount = 30;

        // Act
        var profile = new TenantRiskProfile
        {
            UsersCount = usersCount,
            HighRiskUsersCount = highRiskUsersCount
        };

        // Assert
        profile.HighRiskUsersCount.Should().BeLessThanOrEqualTo(profile.UsersCount);
    }

    [Fact]
    public void TenantRiskProfile_PrivilegedUsersCount_ShouldNotExceedUsersCount()
    {
        // Arrange
        var usersCount = 100;
        var privilegedUsersCount = 10;

        // Act
        var profile = new TenantRiskProfile
        {
            UsersCount = usersCount,
            PrivilegedUsersCount = privilegedUsersCount
        };

        // Assert
        profile.PrivilegedUsersCount.Should().BeLessThanOrEqualTo(profile.UsersCount);
    }

    [Fact]
    public void TenantRiskProfile_DecimalPrecision_ShouldBePreserved()
    {
        // Arrange
        var mfaRate = 75.55m;
        var failedLoginRate = 5.25m;

        // Act
        var profile = new TenantRiskProfile
        {
            MfaEnrollmentRate = mfaRate,
            FailedLoginRate = failedLoginRate
        };

        // Assert
        profile.MfaEnrollmentRate.Should().Be(75.55m);
        profile.FailedLoginRate.Should().Be(5.25m);
    }

    [Fact]
    public void TenantRiskProfile_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var profile1 = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RiskScore = 30
        };

        var profile2 = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RiskScore = 70
        };

        // Assert
        profile1.Id.Should().NotBe(profile2.Id);
        profile1.TenantId.Should().NotBe(profile2.TenantId);
        profile1.RiskScore.Should().NotBe(profile2.RiskScore);
    }

    [Fact]
    public void TenantRiskProfile_ZeroUsers_ShouldBeValid()
    {
        // Arrange & Act
        var profile = new TenantRiskProfile
        {
            UsersCount = 0,
            HighRiskUsersCount = 0,
            PrivilegedUsersCount = 0
        };

        // Assert
        profile.UsersCount.Should().Be(0);
        profile.HighRiskUsersCount.Should().Be(0);
        profile.PrivilegedUsersCount.Should().Be(0);
    }

    [Fact]
    public void TenantRiskProfile_MaxMfaEnrollmentRate_ShouldBe100()
    {
        // Arrange & Act
        var profile = new TenantRiskProfile { MfaEnrollmentRate = 100m };

        // Assert
        profile.MfaEnrollmentRate.Should().Be(100m);
    }

    [Fact]
    public void TenantRiskProfile_CalculatedAt_ShouldBeSet()
    {
        // Arrange
        var calculatedAt = DateTime.UtcNow;

        // Act
        var profile = new TenantRiskProfile { CalculatedAt = calculatedAt };

        // Assert
        profile.CalculatedAt.Should().Be(calculatedAt);
    }
}
