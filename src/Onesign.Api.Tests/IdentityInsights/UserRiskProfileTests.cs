using FluentAssertions;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class UserRiskProfileTests
{
    [Fact]
    public void UserRiskProfile_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var profile = new UserRiskProfile();

        // Assert
        profile.Id.Should().Be(Guid.Empty);
        profile.TenantId.Should().Be(Guid.Empty);
        profile.UserId.Should().Be(Guid.Empty);
        profile.UserDisplayName.Should().Be(string.Empty);
        profile.RiskScore.Should().Be(0);
        profile.RiskFactorsJson.Should().Be("[]");
        profile.LastLoginAt.Should().BeNull();
        profile.FailedLoginCount.Should().Be(0);
        profile.MfaEnabled.Should().BeFalse();
        profile.PrivilegedRolesCount.Should().Be(0);
        profile.ApplicationsCount.Should().Be(0);
    }

    [Fact]
    public void UserRiskProfile_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var lastLoginAt = DateTime.UtcNow.AddDays(-1);
        var calculatedAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow;

        // Act
        var profile = new UserRiskProfile
        {
            Id = id,
            TenantId = tenantId,
            UserId = userId,
            UserDisplayName = "John Doe",
            RiskScore = 75,
            RiskFactorsJson = "[{\"factor\":\"no_mfa\",\"score\":30}]",
            LastLoginAt = lastLoginAt,
            FailedLoginCount = 5,
            MfaEnabled = false,
            PrivilegedRolesCount = 3,
            ApplicationsCount = 10,
            CalculatedAt = calculatedAt,
            UpdatedAt = updatedAt
        };

        // Assert
        profile.Id.Should().Be(id);
        profile.TenantId.Should().Be(tenantId);
        profile.UserId.Should().Be(userId);
        profile.UserDisplayName.Should().Be("John Doe");
        profile.RiskScore.Should().Be(75);
        profile.RiskFactorsJson.Should().Be("[{\"factor\":\"no_mfa\",\"score\":30}]");
        profile.LastLoginAt.Should().Be(lastLoginAt);
        profile.FailedLoginCount.Should().Be(5);
        profile.MfaEnabled.Should().BeFalse();
        profile.PrivilegedRolesCount.Should().Be(3);
        profile.ApplicationsCount.Should().Be(10);
        profile.CalculatedAt.Should().Be(calculatedAt);
        profile.UpdatedAt.Should().Be(updatedAt);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void UserRiskProfile_RiskScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var profile = new UserRiskProfile { RiskScore = score };

        // Assert
        profile.RiskScore.Should().Be(score);
    }

    [Fact]
    public void UserRiskProfile_MfaEnabled_ShouldBeTrue()
    {
        // Arrange & Act
        var profile = new UserRiskProfile { MfaEnabled = true };

        // Assert
        profile.MfaEnabled.Should().BeTrue();
    }

    [Fact]
    public void UserRiskProfile_MfaDisabled_ShouldBeFalse()
    {
        // Arrange & Act
        var profile = new UserRiskProfile { MfaEnabled = false };

        // Assert
        profile.MfaEnabled.Should().BeFalse();
    }

    [Fact]
    public void UserRiskProfile_NullLastLoginAt_ShouldBeAllowed()
    {
        // Arrange & Act
        var profile = new UserRiskProfile { LastLoginAt = null };

        // Assert
        profile.LastLoginAt.Should().BeNull();
    }

    [Fact]
    public void UserRiskProfile_ComplexRiskFactorsJson_ShouldBeStored()
    {
        // Arrange
        var complexJson = "[{\"factor\":\"no_mfa\",\"score\":30},{\"factor\":\"excessive_privileges\",\"score\":25},{\"factor\":\"inactive_account\",\"score\":20}]";

        // Act
        var profile = new UserRiskProfile { RiskFactorsJson = complexJson };

        // Assert
        profile.RiskFactorsJson.Should().Be(complexJson);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(100)]
    public void UserRiskProfile_FailedLoginCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new UserRiskProfile { FailedLoginCount = count };

        // Assert
        profile.FailedLoginCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void UserRiskProfile_PrivilegedRolesCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new UserRiskProfile { PrivilegedRolesCount = count };

        // Assert
        profile.PrivilegedRolesCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    [InlineData(100)]
    public void UserRiskProfile_ApplicationsCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var profile = new UserRiskProfile { ApplicationsCount = count };

        // Assert
        profile.ApplicationsCount.Should().Be(count);
    }

    [Fact]
    public void UserRiskProfile_LowRiskUser_ShouldHaveLowScore()
    {
        // Arrange & Act
        var profile = new UserRiskProfile
        {
            RiskScore = 15,
            MfaEnabled = true,
            FailedLoginCount = 0,
            PrivilegedRolesCount = 0
        };

        // Assert
        profile.RiskScore.Should().BeLessThanOrEqualTo(30);
        profile.MfaEnabled.Should().BeTrue();
    }

    [Fact]
    public void UserRiskProfile_HighRiskUser_ShouldHaveHighScore()
    {
        // Arrange & Act
        var profile = new UserRiskProfile
        {
            RiskScore = 85,
            MfaEnabled = false,
            FailedLoginCount = 10,
            PrivilegedRolesCount = 5
        };

        // Assert
        profile.RiskScore.Should().BeGreaterThanOrEqualTo(70);
        profile.MfaEnabled.Should().BeFalse();
    }

    [Fact]
    public void UserRiskProfile_TimestampFields_ShouldBeDifferent()
    {
        // Arrange
        var calculatedAt = DateTime.UtcNow.AddHours(-1);
        var updatedAt = DateTime.UtcNow;

        // Act
        var profile = new UserRiskProfile
        {
            CalculatedAt = calculatedAt,
            UpdatedAt = updatedAt
        };

        // Assert
        profile.CalculatedAt.Should().BeBefore(profile.UpdatedAt);
    }

    [Fact]
    public void UserRiskProfile_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var profile1 = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RiskScore = 30
        };

        var profile2 = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RiskScore = 70
        };

        // Assert
        profile1.Id.Should().NotBe(profile2.Id);
        profile1.UserId.Should().NotBe(profile2.UserId);
        profile1.RiskScore.Should().NotBe(profile2.RiskScore);
    }

    [Fact]
    public void UserRiskProfile_EmptyDisplayName_ShouldBeAllowed()
    {
        // Arrange & Act
        var profile = new UserRiskProfile { UserDisplayName = string.Empty };

        // Assert
        profile.UserDisplayName.Should().BeEmpty();
    }

    [Fact]
    public void UserRiskProfile_LongDisplayName_ShouldBeStored()
    {
        // Arrange
        var longName = new string('A', 500);

        // Act
        var profile = new UserRiskProfile { UserDisplayName = longName };

        // Assert
        profile.UserDisplayName.Should().HaveLength(500);
    }
}
