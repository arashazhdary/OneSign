using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class UserRiskProfileRepositoryTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    #region GetByUserIdAsync Tests

    [Fact]
    public async Task GetByUserIdAsync_ExistingProfile_ReturnsProfile()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 75);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UserId.Should().Be(userId);
        result.TenantId.Should().Be(tenantId);
        result.RiskScore.Should().Be(75);
    }

    [Fact]
    public async Task GetByUserIdAsync_NonExistingProfile_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);

        // Act
        var result = await repository.GetByUserIdAsync(Guid.NewGuid(), Guid.NewGuid(), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WrongTenant_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var wrongTenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByUserIdAsync(wrongTenantId, userId, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WrongUser_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var wrongUserId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByUserIdAsync(tenantId, wrongUserId, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_MapsAllFieldsCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var lastLoginAt = DateTime.UtcNow.AddDays(-1);
        var calculatedAt = DateTime.UtcNow.AddHours(-1);
        var updatedAt = DateTime.UtcNow;

        var profile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            UserDisplayName = "John Doe",
            RiskScore = 85,
            RiskFactorsJson = "[{\"factor\":\"no_mfa\",\"score\":30}]",
            LastLoginAt = lastLoginAt,
            FailedLoginCount = 5,
            MfaEnabled = false,
            PrivilegedRolesCount = 3,
            ApplicationsCount = 10,
            CalculatedAt = calculatedAt,
            UpdatedAt = updatedAt
        };

        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UserDisplayName.Should().Be("John Doe");
        result.RiskScore.Should().Be(85);
        result.RiskFactorsJson.Should().Be("[{\"factor\":\"no_mfa\",\"score\":30}]");
        result.LastLoginAt.Should().BeCloseTo(lastLoginAt, TimeSpan.FromSeconds(1));
        result.FailedLoginCount.Should().Be(5);
        result.MfaEnabled.Should().BeFalse();
        result.PrivilegedRolesCount.Should().Be(3);
        result.ApplicationsCount.Should().Be(10);
    }

    #endregion

    #region GetHighRiskUsersAsync Tests

    [Fact]
    public async Task GetHighRiskUsersAsync_MultipleUsers_ReturnsHighRiskOnly()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var lowRiskProfile = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 30);
        var mediumRiskProfile = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 60);
        var highRiskProfile = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 80);

        await repository.AddAsync(lowRiskProfile, CancellationToken.None);
        await repository.AddAsync(mediumRiskProfile, CancellationToken.None);
        await repository.AddAsync(highRiskProfile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId, 70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].RiskScore.Should().Be(80);
    }

    [Fact]
    public async Task GetHighRiskUsersAsync_NoHighRiskUsers_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var lowRiskProfile = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 30);
        await repository.AddAsync(lowRiskProfile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId, 70, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public async Task GetHighRiskUsersAsync_ReturnsOrderedByRiskScoreDescending()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile1 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 75);
        var profile2 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 90);
        var profile3 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 80);

        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);
        await repository.AddAsync(profile3, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId, 70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(3);
        results[0].RiskScore.Should().Be(90);
        results[1].RiskScore.Should().Be(80);
        results[2].RiskScore.Should().Be(75);
    }

    [Fact]
    public async Task GetHighRiskUsersAsync_DifferentTenants_ReturnsOnlyRequestedTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var profile1 = CreateUserRiskProfile(tenantId1, Guid.NewGuid(), 85);
        var profile2 = CreateUserRiskProfile(tenantId2, Guid.NewGuid(), 90);

        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId1, 70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task GetHighRiskUsersAsync_ScoreEqualToThreshold_ReturnsUser()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 70);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId, 70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetHighRiskUsersAsync_ZeroThreshold_ReturnsAllUsers()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile1 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 0);
        var profile2 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 50);

        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskUsersAsync(tenantId, 0, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    #endregion

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_ValidProfile_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 65);

        // Act
        await repository.AddAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.Id.Should().Be(profile.Id);
    }

    [Fact]
    public async Task AddAsync_MultipleProfiles_AllCreatedSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile1 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 30);
        var profile2 = CreateUserRiskProfile(tenantId, Guid.NewGuid(), 70);

        // Act
        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);

        // Assert
        var results = await repository.GetHighRiskUsersAsync(tenantId, 0, CancellationToken.None);
        results.Should().HaveCount(2);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ExistingProfile_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Update the profile
        profile.RiskScore = 85;
        profile.MfaEnabled = true;
        profile.FailedLoginCount = 0;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(85);
        result.MfaEnabled.Should().BeTrue();
        result.FailedLoginCount.Should().Be(0);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingProfile_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);

        var profile = CreateUserRiskProfile(Guid.NewGuid(), Guid.NewGuid(), 50);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.UpdateAsync(profile, CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task UpdateAsync_UpdateAllFields_AllFieldsUpdated()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Update all fields
        profile.RiskScore = 95;
        profile.RiskFactorsJson = "[{\"updated\":true}]";
        profile.LastLoginAt = DateTime.UtcNow;
        profile.FailedLoginCount = 10;
        profile.MfaEnabled = true;
        profile.PrivilegedRolesCount = 5;
        profile.ApplicationsCount = 20;
        profile.CalculatedAt = DateTime.UtcNow;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(95);
        result.RiskFactorsJson.Should().Be("[{\"updated\":true}]");
        result.FailedLoginCount.Should().Be(10);
        result.MfaEnabled.Should().BeTrue();
        result.PrivilegedRolesCount.Should().Be(5);
        result.ApplicationsCount.Should().Be(20);
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtToUtcNow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var profile = CreateUserRiskProfile(tenantId, userId, 50);
        profile.UpdatedAt = DateTime.UtcNow.AddDays(-1);
        await repository.AddAsync(profile, CancellationToken.None);

        var beforeUpdate = DateTime.UtcNow;

        // Act
        profile.RiskScore = 75;
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByUserIdAsync(tenantId, userId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
    }

    #endregion

    #region Helper Methods

    private static UserRiskProfile CreateUserRiskProfile(Guid tenantId, Guid userId, int riskScore)
    {
        return new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            UserDisplayName = $"User {userId.ToString().Substring(0, 8)}",
            RiskScore = riskScore,
            RiskFactorsJson = "[]",
            LastLoginAt = DateTime.UtcNow.AddDays(-1),
            FailedLoginCount = 0,
            MfaEnabled = riskScore < 50,
            PrivilegedRolesCount = riskScore > 70 ? 3 : 0,
            ApplicationsCount = 5,
            CalculatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
