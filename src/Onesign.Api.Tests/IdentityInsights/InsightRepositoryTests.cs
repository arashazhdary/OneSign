using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class InsightRepositoryTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ExistingInsight_ReturnsInsight()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();
        var insightId = Guid.NewGuid();

        var insight = new Insight
        {
            Id = insightId,
            TenantId = tenantId,
            Type = InsightType.HighRiskUser,
            Severity = InsightSeverity.High,
            ScopeType = "User",
            ScopeId = Guid.NewGuid(),
            Title = "High Risk User Detected",
            MessageKey = "insights.high_risk_user",
            DataJson = "{}",
            Status = InsightStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(insight, CancellationToken.None);

        // Act
        var result = await repository.GetByIdAsync(insightId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(insightId);
        result.Title.Should().Be("High Risk User Detected");
        result.Type.Should().Be(InsightType.HighRiskUser);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingInsight_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);

        // Act
        var result = await repository.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetByTenantIdAsync Tests

    [Fact]
    public async Task GetByTenantIdAsync_MultipleInsights_ReturnsAllForTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight1 = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        var insight2 = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);

        await repository.AddAsync(insight1, CancellationToken.None);
        await repository.AddAsync(insight2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByTenantIdAsync_NoInsights_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);

        // Act
        var results = await repository.GetByTenantIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByTenantIdAsync_DifferentTenants_ReturnsOnlyRequestedTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var insight1 = CreateInsight(tenantId1, InsightType.HighRiskUser, InsightSeverity.High);
        var insight2 = CreateInsight(tenantId2, InsightType.ZombieAccount, InsightSeverity.Medium);

        await repository.AddAsync(insight1, CancellationToken.None);
        await repository.AddAsync(insight2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId1, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task GetByTenantIdAsync_ReturnsOrderedByCreatedAtDescending()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight1 = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        insight1.CreatedAt = DateTime.UtcNow.AddDays(-2);

        var insight2 = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);
        insight2.CreatedAt = DateTime.UtcNow.AddDays(-1);

        var insight3 = CreateInsight(tenantId, InsightType.MfaNotEnabled, InsightSeverity.Low);
        insight3.CreatedAt = DateTime.UtcNow;

        await repository.AddAsync(insight1, CancellationToken.None);
        await repository.AddAsync(insight2, CancellationToken.None);
        await repository.AddAsync(insight3, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(3);
        results[0].CreatedAt.Should().BeAfter(results[1].CreatedAt);
        results[1].CreatedAt.Should().BeAfter(results[2].CreatedAt);
    }

    #endregion

    #region GetByTenantAndStatusAsync Tests

    [Fact]
    public async Task GetByTenantAndStatusAsync_OpenStatus_ReturnsOnlyOpenInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var openInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        openInsight.Status = InsightStatus.Open;

        var resolvedInsight = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);
        resolvedInsight.Status = InsightStatus.Resolved;

        await repository.AddAsync(openInsight, CancellationToken.None);
        await repository.AddAsync(resolvedInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantAndStatusAsync(tenantId, InsightStatus.Open, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Status.Should().Be(InsightStatus.Open);
    }

    [Fact]
    public async Task GetByTenantAndStatusAsync_ResolvedStatus_ReturnsOnlyResolvedInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var openInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        openInsight.Status = InsightStatus.Open;

        var resolvedInsight = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);
        resolvedInsight.Status = InsightStatus.Resolved;

        await repository.AddAsync(openInsight, CancellationToken.None);
        await repository.AddAsync(resolvedInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantAndStatusAsync(tenantId, InsightStatus.Resolved, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Status.Should().Be(InsightStatus.Resolved);
    }

    [Fact]
    public async Task GetByTenantAndStatusAsync_DismissedStatus_ReturnsOnlyDismissedInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var dismissedInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        dismissedInsight.Status = InsightStatus.Dismissed;

        await repository.AddAsync(dismissedInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantAndStatusAsync(tenantId, InsightStatus.Dismissed, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Status.Should().Be(InsightStatus.Dismissed);
    }

    [Fact]
    public async Task GetByTenantAndStatusAsync_NoMatchingStatus_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var openInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        openInsight.Status = InsightStatus.Open;

        await repository.AddAsync(openInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantAndStatusAsync(tenantId, InsightStatus.Resolved, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    #endregion

    #region GetBySeverityAsync Tests

    [Fact]
    public async Task GetBySeverityAsync_HighSeverity_ReturnsOnlyHighSeverityInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var highSeverityInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        var lowSeverityInsight = CreateInsight(tenantId, InsightType.MfaNotEnabled, InsightSeverity.Low);

        await repository.AddAsync(highSeverityInsight, CancellationToken.None);
        await repository.AddAsync(lowSeverityInsight, CancellationToken.None);

        // Act
        var results = await repository.GetBySeverityAsync(tenantId, InsightSeverity.High, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Severity.Should().Be(InsightSeverity.High);
    }

    [Fact]
    public async Task GetBySeverityAsync_CriticalSeverity_ReturnsOnlyCriticalInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var criticalInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.Critical);
        var mediumInsight = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);

        await repository.AddAsync(criticalInsight, CancellationToken.None);
        await repository.AddAsync(mediumInsight, CancellationToken.None);

        // Act
        var results = await repository.GetBySeverityAsync(tenantId, InsightSeverity.Critical, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Severity.Should().Be(InsightSeverity.Critical);
    }

    [Fact]
    public async Task GetBySeverityAsync_NoMatchingSeverity_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var lowInsight = CreateInsight(tenantId, InsightType.MfaNotEnabled, InsightSeverity.Low);

        await repository.AddAsync(lowInsight, CancellationToken.None);

        // Act
        var results = await repository.GetBySeverityAsync(tenantId, InsightSeverity.Critical, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    #endregion

    #region GetByScopeAsync Tests

    [Fact]
    public async Task GetByScopeAsync_UserScope_ReturnsUserScopedInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var userInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        userInsight.ScopeType = "User";
        userInsight.ScopeId = userId;

        var tenantInsight = CreateInsight(tenantId, InsightType.TenantHighRisk, InsightSeverity.Medium);
        tenantInsight.ScopeType = "Tenant";

        await repository.AddAsync(userInsight, CancellationToken.None);
        await repository.AddAsync(tenantInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByScopeAsync(tenantId, "User", userId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].ScopeType.Should().Be("User");
        results[0].ScopeId.Should().Be(userId);
    }

    [Fact]
    public async Task GetByScopeAsync_TenantScope_ReturnsTenantScopedInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var tenantInsight = CreateInsight(tenantId, InsightType.TenantHighRisk, InsightSeverity.High);
        tenantInsight.ScopeType = "Tenant";

        await repository.AddAsync(tenantInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByScopeAsync(tenantId, "Tenant", null, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].ScopeType.Should().Be("Tenant");
    }

    [Fact]
    public async Task GetByScopeAsync_WithNullScopeId_ReturnsAllOfScopeType()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var userInsight1 = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        userInsight1.ScopeType = "User";
        userInsight1.ScopeId = Guid.NewGuid();

        var userInsight2 = CreateInsight(tenantId, InsightType.MfaNotEnabled, InsightSeverity.Low);
        userInsight2.ScopeType = "User";
        userInsight2.ScopeId = Guid.NewGuid();

        await repository.AddAsync(userInsight1, CancellationToken.None);
        await repository.AddAsync(userInsight2, CancellationToken.None);

        // Act
        var results = await repository.GetByScopeAsync(tenantId, "User", null, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByScopeAsync_NoMatchingScope_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var userInsight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        userInsight.ScopeType = "User";

        await repository.AddAsync(userInsight, CancellationToken.None);

        // Act
        var results = await repository.GetByScopeAsync(tenantId, "App", null, CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    #endregion

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_ValidInsight_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);

        // Act
        await repository.AddAsync(insight, CancellationToken.None);

        // Assert
        var result = await repository.GetByIdAsync(insight.Id, CancellationToken.None);
        result.Should().NotBeNull();
        result!.Id.Should().Be(insight.Id);
    }

    [Fact]
    public async Task AddAsync_MultipleInsights_AllCreatedSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight1 = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        var insight2 = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);

        // Act
        await repository.AddAsync(insight1, CancellationToken.None);
        await repository.AddAsync(insight2, CancellationToken.None);

        // Assert
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        results.Should().HaveCount(2);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ExistingInsight_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        insight.Status = InsightStatus.Open;

        await repository.AddAsync(insight, CancellationToken.None);

        // Update the insight
        insight.Status = InsightStatus.Resolved;
        insight.ResolvedAt = DateTime.UtcNow;
        insight.ResolvedBy = Guid.NewGuid();

        // Act
        await repository.UpdateAsync(insight, CancellationToken.None);

        // Assert
        var result = await repository.GetByIdAsync(insight.Id, CancellationToken.None);
        result.Should().NotBeNull();
        result!.Status.Should().Be(InsightStatus.Resolved);
        result.ResolvedAt.Should().NotBeNull();
        result.ResolvedBy.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_NonExistingInsight_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);

        var insight = CreateInsight(Guid.NewGuid(), InsightType.HighRiskUser, InsightSeverity.High);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.UpdateAsync(insight, CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task UpdateAsync_UpdateAllFields_AllFieldsUpdated()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        await repository.AddAsync(insight, CancellationToken.None);

        // Update all fields
        insight.Type = InsightType.ZombieAccount;
        insight.Severity = InsightSeverity.Critical;
        insight.ScopeType = "App";
        insight.ScopeId = Guid.NewGuid();
        insight.Title = "Updated Title";
        insight.MessageKey = "updated.key";
        insight.DataJson = "{\"updated\":true}";
        insight.Status = InsightStatus.Dismissed;
        insight.ResolvedAt = DateTime.UtcNow;
        insight.ResolvedBy = Guid.NewGuid();

        // Act
        await repository.UpdateAsync(insight, CancellationToken.None);

        // Assert
        var result = await repository.GetByIdAsync(insight.Id, CancellationToken.None);
        result.Should().NotBeNull();
        result!.Type.Should().Be(InsightType.ZombieAccount);
        result.Severity.Should().Be(InsightSeverity.Critical);
        result.ScopeType.Should().Be("App");
        result.Title.Should().Be("Updated Title");
        result.MessageKey.Should().Be("updated.key");
        result.DataJson.Should().Be("{\"updated\":true}");
        result.Status.Should().Be(InsightStatus.Dismissed);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ExistingInsight_DeletesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        await repository.AddAsync(insight, CancellationToken.None);

        // Act
        await repository.DeleteAsync(insight.Id, CancellationToken.None);

        // Assert
        var result = await repository.GetByIdAsync(insight.Id, CancellationToken.None);
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_NonExistingInsight_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.DeleteAsync(Guid.NewGuid(), CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task DeleteAsync_DoesNotAffectOtherInsights()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new InsightRepository(context);
        var tenantId = Guid.NewGuid();

        var insight1 = CreateInsight(tenantId, InsightType.HighRiskUser, InsightSeverity.High);
        var insight2 = CreateInsight(tenantId, InsightType.ZombieAccount, InsightSeverity.Medium);

        await repository.AddAsync(insight1, CancellationToken.None);
        await repository.AddAsync(insight2, CancellationToken.None);

        // Act
        await repository.DeleteAsync(insight1.Id, CancellationToken.None);

        // Assert
        var result = await repository.GetByIdAsync(insight2.Id, CancellationToken.None);
        result.Should().NotBeNull();
    }

    #endregion

    #region Helper Methods

    private static Insight CreateInsight(Guid tenantId, InsightType type, InsightSeverity severity)
    {
        return new Insight
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = type,
            Severity = severity,
            ScopeType = "User",
            ScopeId = Guid.NewGuid(),
            Title = $"{type} Insight",
            MessageKey = $"insights.{type.ToString().ToLower()}",
            DataJson = "{}",
            Status = InsightStatus.Open,
            CreatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
