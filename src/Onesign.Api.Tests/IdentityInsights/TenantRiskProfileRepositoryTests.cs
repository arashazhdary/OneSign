using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class TenantRiskProfileRepositoryTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    #region GetByTenantIdAsync Tests

    [Fact]
    public async Task GetByTenantIdAsync_ExistingProfile_ReturnsProfile()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 65);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.RiskScore.Should().Be(65);
    }

    [Fact]
    public async Task GetByTenantIdAsync_NonExistingProfile_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        // Act
        var result = await repository.GetByTenantIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTenantIdAsync_MapsAllFieldsCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();
        var calculatedAt = DateTime.UtcNow;

        var profile = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RiskScore = 70,
            UsersCount = 100,
            HighRiskUsersCount = 15,
            MfaEnrollmentRate = 75.5m,
            PrivilegedUsersCount = 10,
            FailedLoginRate = 5.25m,
            OpenGovernanceFindingsCount = 25,
            CalculatedAt = calculatedAt
        };

        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(70);
        result.UsersCount.Should().Be(100);
        result.HighRiskUsersCount.Should().Be(15);
        result.MfaEnrollmentRate.Should().Be(75.5m);
        result.PrivilegedUsersCount.Should().Be(10);
        result.FailedLoginRate.Should().Be(5.25m);
        result.OpenGovernanceFindingsCount.Should().Be(25);
    }

    #endregion

    #region GetHighRiskTenantsAsync Tests

    [Fact]
    public async Task GetHighRiskTenantsAsync_MultipleTenants_ReturnsHighRiskOnly()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var lowRiskProfile = CreateTenantRiskProfile(Guid.NewGuid(), 30);
        var mediumRiskProfile = CreateTenantRiskProfile(Guid.NewGuid(), 60);
        var highRiskProfile = CreateTenantRiskProfile(Guid.NewGuid(), 80);

        await repository.AddAsync(lowRiskProfile, CancellationToken.None);
        await repository.AddAsync(mediumRiskProfile, CancellationToken.None);
        await repository.AddAsync(highRiskProfile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].RiskScore.Should().Be(80);
    }

    [Fact]
    public async Task GetHighRiskTenantsAsync_NoHighRiskTenants_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var lowRiskProfile = CreateTenantRiskProfile(Guid.NewGuid(), 30);
        await repository.AddAsync(lowRiskProfile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(70, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public async Task GetHighRiskTenantsAsync_ReturnsOrderedByRiskScoreDescending()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile1 = CreateTenantRiskProfile(Guid.NewGuid(), 75);
        var profile2 = CreateTenantRiskProfile(Guid.NewGuid(), 90);
        var profile3 = CreateTenantRiskProfile(Guid.NewGuid(), 80);

        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);
        await repository.AddAsync(profile3, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(3);
        results[0].RiskScore.Should().Be(90);
        results[1].RiskScore.Should().Be(80);
        results[2].RiskScore.Should().Be(75);
    }

    [Fact]
    public async Task GetHighRiskTenantsAsync_ScoreEqualToThreshold_ReturnsTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile = CreateTenantRiskProfile(Guid.NewGuid(), 70);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(70, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetHighRiskTenantsAsync_ZeroThreshold_ReturnsAllTenants()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile1 = CreateTenantRiskProfile(Guid.NewGuid(), 0);
        var profile2 = CreateTenantRiskProfile(Guid.NewGuid(), 50);

        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(0, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetHighRiskTenantsAsync_HighThreshold_ReturnsEmpty()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile = CreateTenantRiskProfile(Guid.NewGuid(), 90);
        await repository.AddAsync(profile, CancellationToken.None);

        // Act
        var results = await repository.GetHighRiskTenantsAsync(100, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    #endregion

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_ValidProfile_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 65);

        // Act
        await repository.AddAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.Id.Should().Be(profile.Id);
    }

    [Fact]
    public async Task AddAsync_MultipleProfiles_AllCreatedSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile1 = CreateTenantRiskProfile(Guid.NewGuid(), 30);
        var profile2 = CreateTenantRiskProfile(Guid.NewGuid(), 70);

        // Act
        await repository.AddAsync(profile1, CancellationToken.None);
        await repository.AddAsync(profile2, CancellationToken.None);

        // Assert
        var results = await repository.GetHighRiskTenantsAsync(0, CancellationToken.None);
        results.Should().HaveCount(2);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ExistingProfile_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Update the profile
        profile.RiskScore = 85;
        profile.MfaEnrollmentRate = 90.0m;
        profile.HighRiskUsersCount = 5;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(85);
        result.MfaEnrollmentRate.Should().Be(90.0m);
        result.HighRiskUsersCount.Should().Be(5);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingProfile_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);

        var profile = CreateTenantRiskProfile(Guid.NewGuid(), 50);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.UpdateAsync(profile, CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task UpdateAsync_UpdateAllFields_AllFieldsUpdated()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        // Update all fields
        profile.RiskScore = 95;
        profile.UsersCount = 200;
        profile.HighRiskUsersCount = 40;
        profile.MfaEnrollmentRate = 50.0m;
        profile.PrivilegedUsersCount = 20;
        profile.FailedLoginRate = 10.5m;
        profile.OpenGovernanceFindingsCount = 50;
        profile.CalculatedAt = DateTime.UtcNow;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.RiskScore.Should().Be(95);
        result.UsersCount.Should().Be(200);
        result.HighRiskUsersCount.Should().Be(40);
        result.MfaEnrollmentRate.Should().Be(50.0m);
        result.PrivilegedUsersCount.Should().Be(20);
        result.FailedLoginRate.Should().Be(10.5m);
        result.OpenGovernanceFindingsCount.Should().Be(50);
    }

    [Fact]
    public async Task UpdateAsync_UpdateCalculatedAt_ShouldPersist()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 50);
        profile.CalculatedAt = DateTime.UtcNow.AddDays(-1);
        await repository.AddAsync(profile, CancellationToken.None);

        var newCalculatedAt = DateTime.UtcNow;
        profile.CalculatedAt = newCalculatedAt;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.CalculatedAt.Should().BeCloseTo(newCalculatedAt, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task UpdateAsync_DecimalPrecision_ShouldBePreserved()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new TenantRiskProfileRepository(context);
        var tenantId = Guid.NewGuid();

        var profile = CreateTenantRiskProfile(tenantId, 50);
        await repository.AddAsync(profile, CancellationToken.None);

        profile.MfaEnrollmentRate = 75.55m;
        profile.FailedLoginRate = 5.25m;

        // Act
        await repository.UpdateAsync(profile, CancellationToken.None);

        // Assert
        var result = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        result.Should().NotBeNull();
        result!.MfaEnrollmentRate.Should().Be(75.55m);
        result.FailedLoginRate.Should().Be(5.25m);
    }

    #endregion

    #region Helper Methods

    private static TenantRiskProfile CreateTenantRiskProfile(Guid tenantId, int riskScore)
    {
        return new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RiskScore = riskScore,
            UsersCount = 100,
            HighRiskUsersCount = riskScore > 70 ? 20 : 5,
            MfaEnrollmentRate = riskScore < 50 ? 80.0m : 40.0m,
            PrivilegedUsersCount = 10,
            FailedLoginRate = riskScore > 70 ? 10.0m : 2.0m,
            OpenGovernanceFindingsCount = riskScore > 70 ? 30 : 5,
            CalculatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
