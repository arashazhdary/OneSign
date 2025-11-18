using FluentAssertions;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class UserRiskProfileEntityTests
{
    [Fact]
    public void UserRiskProfileEntity_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.UserId.Should().Be(Guid.Empty);
        entity.UserDisplayName.Should().Be(string.Empty);
        entity.RiskScore.Should().Be(0);
        entity.RiskFactorsJson.Should().Be("[]");
        entity.LastLoginAt.Should().BeNull();
        entity.FailedLoginCount.Should().Be(0);
        entity.MfaEnabled.Should().BeFalse();
        entity.PrivilegedRolesCount.Should().Be(0);
        entity.ApplicationsCount.Should().Be(0);
    }

    [Fact]
    public void UserRiskProfileEntity_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var lastLoginAt = DateTime.UtcNow.AddDays(-1);
        var calculatedAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new UserRiskProfileEntity
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
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.UserId.Should().Be(userId);
        entity.UserDisplayName.Should().Be("John Doe");
        entity.RiskScore.Should().Be(75);
        entity.RiskFactorsJson.Should().Be("[{\"factor\":\"no_mfa\",\"score\":30}]");
        entity.LastLoginAt.Should().Be(lastLoginAt);
        entity.FailedLoginCount.Should().Be(5);
        entity.MfaEnabled.Should().BeFalse();
        entity.PrivilegedRolesCount.Should().Be(3);
        entity.ApplicationsCount.Should().Be(10);
        entity.CalculatedAt.Should().Be(calculatedAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void UserRiskProfileEntity_RiskScoreRange_ShouldBeAssignable(int score)
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { RiskScore = score };

        // Assert
        entity.RiskScore.Should().Be(score);
    }

    [Fact]
    public void UserRiskProfileEntity_MfaEnabled_ShouldBeTrue()
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { MfaEnabled = true };

        // Assert
        entity.MfaEnabled.Should().BeTrue();
    }

    [Fact]
    public void UserRiskProfileEntity_MfaDisabled_ShouldBeFalse()
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { MfaEnabled = false };

        // Assert
        entity.MfaEnabled.Should().BeFalse();
    }

    [Fact]
    public void UserRiskProfileEntity_NullLastLoginAt_ShouldBeAllowed()
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { LastLoginAt = null };

        // Assert
        entity.LastLoginAt.Should().BeNull();
    }

    [Fact]
    public void UserRiskProfileEntity_ComplexRiskFactorsJson_ShouldBeStored()
    {
        // Arrange
        var complexJson = "[{\"factor\":\"no_mfa\",\"score\":30},{\"factor\":\"excessive_privileges\",\"score\":25}]";

        // Act
        var entity = new UserRiskProfileEntity { RiskFactorsJson = complexJson };

        // Assert
        entity.RiskFactorsJson.Should().Be(complexJson);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(100)]
    public void UserRiskProfileEntity_FailedLoginCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { FailedLoginCount = count };

        // Assert
        entity.FailedLoginCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void UserRiskProfileEntity_PrivilegedRolesCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { PrivilegedRolesCount = count };

        // Assert
        entity.PrivilegedRolesCount.Should().Be(count);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(50)]
    [InlineData(100)]
    public void UserRiskProfileEntity_ApplicationsCount_ShouldBeAssignable(int count)
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { ApplicationsCount = count };

        // Assert
        entity.ApplicationsCount.Should().Be(count);
    }

    [Fact]
    public void UserRiskProfileEntity_TimestampFields_ShouldBeDifferent()
    {
        // Arrange
        var calculatedAt = DateTime.UtcNow.AddHours(-1);
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new UserRiskProfileEntity
        {
            CalculatedAt = calculatedAt,
            UpdatedAt = updatedAt
        };

        // Assert
        entity.CalculatedAt.Should().BeBefore(entity.UpdatedAt);
    }

    [Fact]
    public void UserRiskProfileEntity_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange
        var entity1 = new UserRiskProfileEntity
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RiskScore = 30
        };

        var entity2 = new UserRiskProfileEntity
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RiskScore = 70
        };

        // Assert
        entity1.Id.Should().NotBe(entity2.Id);
        entity1.UserId.Should().NotBe(entity2.UserId);
        entity1.RiskScore.Should().NotBe(entity2.RiskScore);
    }

    [Fact]
    public void UserRiskProfileEntity_EmptyDisplayName_ShouldBeAllowed()
    {
        // Arrange & Act
        var entity = new UserRiskProfileEntity { UserDisplayName = string.Empty };

        // Assert
        entity.UserDisplayName.Should().BeEmpty();
    }

    [Fact]
    public void UserRiskProfileEntity_LongDisplayName_ShouldBeStored()
    {
        // Arrange
        var longName = new string('A', 500);

        // Act
        var entity = new UserRiskProfileEntity { UserDisplayName = longName };

        // Assert
        entity.UserDisplayName.Should().HaveLength(500);
    }
}
