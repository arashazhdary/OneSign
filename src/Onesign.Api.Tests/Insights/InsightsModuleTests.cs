using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Insights;

public class InsightsModuleTests
{
    #region TenantDailyUsageSnapshot Entity Tests

    [Fact]
    public void TenantDailyUsageSnapshot_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var snapshot = new TenantDailyUsageSnapshot();

        // Assert
        snapshot.Id.Should().Be(Guid.Empty);
        snapshot.TenantId.Should().Be(Guid.Empty);
        snapshot.Date.Should().Be(default);
        snapshot.TotalUsers.Should().Be(0);
        snapshot.ActiveUsers.Should().Be(0);
        snapshot.MfaEnabledUsers.Should().Be(0);
        snapshot.TotalApplications.Should().Be(0);
        snapshot.ApplicationsWithSSOEnabled.Should().Be(0);
        snapshot.TotalSignInCount.Should().Be(0);
        snapshot.FailedSignInCount.Should().Be(0);
        snapshot.HighRiskSignInCount.Should().Be(0);
        snapshot.AccessRequestCount.Should().Be(0);
        snapshot.AccessRequestApprovedCount.Should().Be(0);
        snapshot.LifecycleEventsCount.Should().Be(0);
        snapshot.EmergencyAccessCount.Should().Be(0);
        snapshot.CreatedAt.Should().Be(default);
    }

    [Fact]
    public void TenantDailyUsageSnapshot_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var createdAt = DateTime.UtcNow;

        // Act
        var snapshot = new TenantDailyUsageSnapshot
        {
            Id = id,
            TenantId = tenantId,
            Date = date,
            TotalUsers = 500,
            ActiveUsers = 350,
            MfaEnabledUsers = 300,
            TotalApplications = 25,
            ApplicationsWithSSOEnabled = 20,
            TotalSignInCount = 2500,
            FailedSignInCount = 50,
            HighRiskSignInCount = 5,
            AccessRequestCount = 30,
            AccessRequestApprovedCount = 25,
            LifecycleEventsCount = 15,
            EmergencyAccessCount = 2,
            CreatedAt = createdAt
        };

        // Assert
        snapshot.Id.Should().Be(id);
        snapshot.TenantId.Should().Be(tenantId);
        snapshot.Date.Should().Be(date);
        snapshot.TotalUsers.Should().Be(500);
        snapshot.ActiveUsers.Should().Be(350);
        snapshot.MfaEnabledUsers.Should().Be(300);
        snapshot.TotalApplications.Should().Be(25);
        snapshot.ApplicationsWithSSOEnabled.Should().Be(20);
        snapshot.TotalSignInCount.Should().Be(2500);
        snapshot.FailedSignInCount.Should().Be(50);
        snapshot.HighRiskSignInCount.Should().Be(5);
        snapshot.AccessRequestCount.Should().Be(30);
        snapshot.AccessRequestApprovedCount.Should().Be(25);
        snapshot.LifecycleEventsCount.Should().Be(15);
        snapshot.EmergencyAccessCount.Should().Be(2);
        snapshot.CreatedAt.Should().Be(createdAt);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(100, 50)]
    [InlineData(1000, 999)]
    [InlineData(int.MaxValue, int.MaxValue)]
    public void TenantDailyUsageSnapshot_UserCounts_ShouldAcceptVariousValues(int total, int active)
    {
        // Arrange & Act
        var snapshot = new TenantDailyUsageSnapshot
        {
            TotalUsers = total,
            ActiveUsers = active
        };

        // Assert
        snapshot.TotalUsers.Should().Be(total);
        snapshot.ActiveUsers.Should().Be(active);
    }

    #endregion

    #region ApplicationDailyUsageSnapshot Entity Tests

    [Fact]
    public void ApplicationDailyUsageSnapshot_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var snapshot = new ApplicationDailyUsageSnapshot();

        // Assert
        snapshot.Id.Should().Be(Guid.Empty);
        snapshot.TenantId.Should().Be(Guid.Empty);
        snapshot.ApplicationId.Should().Be(Guid.Empty);
        snapshot.Date.Should().Be(default);
        snapshot.UniqueUsers.Should().Be(0);
        snapshot.SignInCount.Should().Be(0);
        snapshot.FailedSignInCount.Should().Be(0);
        snapshot.HighRiskSignInCount.Should().Be(0);
        snapshot.CreatedAt.Should().Be(default);
    }

    [Fact]
    public void ApplicationDailyUsageSnapshot_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var createdAt = DateTime.UtcNow;

        // Act
        var snapshot = new ApplicationDailyUsageSnapshot
        {
            Id = id,
            TenantId = tenantId,
            ApplicationId = applicationId,
            Date = date,
            UniqueUsers = 150,
            SignInCount = 500,
            FailedSignInCount = 25,
            HighRiskSignInCount = 3,
            CreatedAt = createdAt
        };

        // Assert
        snapshot.Id.Should().Be(id);
        snapshot.TenantId.Should().Be(tenantId);
        snapshot.ApplicationId.Should().Be(applicationId);
        snapshot.Date.Should().Be(date);
        snapshot.UniqueUsers.Should().Be(150);
        snapshot.SignInCount.Should().Be(500);
        snapshot.FailedSignInCount.Should().Be(25);
        snapshot.HighRiskSignInCount.Should().Be(3);
        snapshot.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void ApplicationDailyUsageSnapshot_MultipleApplications_ShouldBeIndependent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var app1Id = Guid.NewGuid();
        var app2Id = Guid.NewGuid();

        // Act
        var snapshot1 = new ApplicationDailyUsageSnapshot
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ApplicationId = app1Id,
            SignInCount = 100
        };

        var snapshot2 = new ApplicationDailyUsageSnapshot
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ApplicationId = app2Id,
            SignInCount = 200
        };

        // Assert
        snapshot1.ApplicationId.Should().NotBe(snapshot2.ApplicationId);
        snapshot1.SignInCount.Should().NotBe(snapshot2.SignInCount);
        snapshot1.TenantId.Should().Be(snapshot2.TenantId);
    }

    #endregion

    #region UserSecurityPosture Entity Tests

    [Fact]
    public void UserSecurityPosture_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var posture = new UserSecurityPosture();

        // Assert
        posture.Id.Should().Be(Guid.Empty);
        posture.TenantId.Should().Be(Guid.Empty);
        posture.UserId.Should().Be(Guid.Empty);
        posture.LastSignInAt.Should().BeNull();
        posture.MfaEnabled.Should().BeFalse();
        posture.EnabledAppsCount.Should().Be(0);
        posture.UsedAppsLast30DaysCount.Should().Be(0);
        posture.HighRiskEventsLast30Days.Should().Be(0);
        posture.IsAnonymized.Should().BeFalse();
        posture.UpdatedAt.Should().Be(default);
    }

    [Fact]
    public void UserSecurityPosture_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var lastSignIn = DateTime.UtcNow.AddDays(-1);
        var updatedAt = DateTime.UtcNow;

        // Act
        var posture = new UserSecurityPosture
        {
            Id = id,
            TenantId = tenantId,
            UserId = userId,
            LastSignInAt = lastSignIn,
            MfaEnabled = true,
            EnabledAppsCount = 10,
            UsedAppsLast30DaysCount = 7,
            HighRiskEventsLast30Days = 2,
            IsAnonymized = false,
            UpdatedAt = updatedAt
        };

        // Assert
        posture.Id.Should().Be(id);
        posture.TenantId.Should().Be(tenantId);
        posture.UserId.Should().Be(userId);
        posture.LastSignInAt.Should().Be(lastSignIn);
        posture.MfaEnabled.Should().BeTrue();
        posture.EnabledAppsCount.Should().Be(10);
        posture.UsedAppsLast30DaysCount.Should().Be(7);
        posture.HighRiskEventsLast30Days.Should().Be(2);
        posture.IsAnonymized.Should().BeFalse();
        posture.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void UserSecurityPosture_NullLastSignIn_ShouldIndicateNeverSignedIn()
    {
        // Arrange & Act
        var posture = new UserSecurityPosture
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            LastSignInAt = null
        };

        // Assert
        posture.LastSignInAt.Should().BeNull();
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void UserSecurityPosture_MfaEnabled_ShouldToggle(bool enabled)
    {
        // Arrange & Act
        var posture = new UserSecurityPosture { MfaEnabled = enabled };

        // Assert
        posture.MfaEnabled.Should().Be(enabled);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void UserSecurityPosture_IsAnonymized_ShouldToggle(bool anonymized)
    {
        // Arrange & Act
        var posture = new UserSecurityPosture { IsAnonymized = anonymized };

        // Assert
        posture.IsAnonymized.Should().Be(anonymized);
    }

    #endregion

    #region ReportSubscription Entity Tests

    [Fact]
    public void ReportSubscription_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var subscription = new ReportSubscription();

        // Assert
        subscription.Id.Should().Be(Guid.Empty);
        subscription.ScopeType.Should().Be(default);
        subscription.ScopeId.Should().BeNull();
        subscription.ReportType.Should().Be(default);
        subscription.CronOrFrequency.Should().BeEmpty();
        subscription.EmailRecipients.Should().BeEmpty();
        subscription.IsActive.Should().BeFalse();
        subscription.CreatedAt.Should().Be(default);
        subscription.CreatedByUserId.Should().Be(Guid.Empty);
        subscription.UpdatedAt.Should().BeNull();
        subscription.UpdatedByUserId.Should().BeNull();
        subscription.LastSentAt.Should().BeNull();
    }

    [Fact]
    public void ReportSubscription_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var createdBy = Guid.NewGuid();
        var updatedBy = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-7);
        var updatedAt = DateTime.UtcNow.AddDays(-1);
        var lastSent = DateTime.UtcNow;

        // Act
        var subscription = new ReportSubscription
        {
            Id = id,
            ScopeType = ScopeType.Tenant,
            ScopeId = scopeId,
            ReportType = ReportType.TenantSecuritySummary,
            CronOrFrequency = "0 8 * * 1",
            EmailRecipients = "admin@example.com;security@example.com",
            IsActive = true,
            CreatedAt = createdAt,
            CreatedByUserId = createdBy,
            UpdatedAt = updatedAt,
            UpdatedByUserId = updatedBy,
            LastSentAt = lastSent
        };

        // Assert
        subscription.Id.Should().Be(id);
        subscription.ScopeType.Should().Be(ScopeType.Tenant);
        subscription.ScopeId.Should().Be(scopeId);
        subscription.ReportType.Should().Be(ReportType.TenantSecuritySummary);
        subscription.CronOrFrequency.Should().Be("0 8 * * 1");
        subscription.EmailRecipients.Should().Be("admin@example.com;security@example.com");
        subscription.IsActive.Should().BeTrue();
        subscription.CreatedAt.Should().Be(createdAt);
        subscription.CreatedByUserId.Should().Be(createdBy);
        subscription.UpdatedAt.Should().Be(updatedAt);
        subscription.UpdatedByUserId.Should().Be(updatedBy);
        subscription.LastSentAt.Should().Be(lastSent);
    }

    [Fact]
    public void ReportSubscription_GlobalScope_ShouldHaveNullScopeId()
    {
        // Arrange & Act
        var subscription = new ReportSubscription
        {
            ScopeType = ScopeType.Global,
            ScopeId = null
        };

        // Assert
        subscription.ScopeType.Should().Be(ScopeType.Global);
        subscription.ScopeId.Should().BeNull();
    }

    #endregion

    #region Enum Tests

    [Theory]
    [InlineData(ScopeType.Tenant, 1)]
    [InlineData(ScopeType.Global, 2)]
    public void ScopeType_Values_ShouldHaveCorrectIntValues(ScopeType scopeType, int expectedValue)
    {
        // Assert
        ((int)scopeType).Should().Be(expectedValue);
    }

    [Fact]
    public void ScopeType_AllValues_ShouldBeDefined()
    {
        // Arrange & Act
        var values = Enum.GetValues<ScopeType>();

        // Assert
        values.Should().HaveCount(2);
        values.Should().Contain(ScopeType.Tenant);
        values.Should().Contain(ScopeType.Global);
    }

    [Theory]
    [InlineData(ReportType.TenantSecuritySummary, 1)]
    [InlineData(ReportType.TenantUsageSummary, 2)]
    [InlineData(ReportType.GlobalTenantsOverview, 3)]
    [InlineData(ReportType.UserSecurityPosture, 4)]
    public void ReportType_Values_ShouldHaveCorrectIntValues(ReportType reportType, int expectedValue)
    {
        // Assert
        ((int)reportType).Should().Be(expectedValue);
    }

    [Fact]
    public void ReportType_AllValues_ShouldBeDefined()
    {
        // Arrange & Act
        var values = Enum.GetValues<ReportType>();

        // Assert
        values.Should().HaveCount(4);
        values.Should().Contain(ReportType.TenantSecuritySummary);
        values.Should().Contain(ReportType.TenantUsageSummary);
        values.Should().Contain(ReportType.GlobalTenantsOverview);
        values.Should().Contain(ReportType.UserSecurityPosture);
    }

    [Theory]
    [InlineData(ReportFrequency.Daily, 1)]
    [InlineData(ReportFrequency.Weekly, 2)]
    [InlineData(ReportFrequency.Monthly, 3)]
    public void ReportFrequency_Values_ShouldHaveCorrectIntValues(ReportFrequency frequency, int expectedValue)
    {
        // Assert
        ((int)frequency).Should().Be(expectedValue);
    }

    [Fact]
    public void ReportFrequency_AllValues_ShouldBeDefined()
    {
        // Arrange & Act
        var values = Enum.GetValues<ReportFrequency>();

        // Assert
        values.Should().HaveCount(3);
        values.Should().Contain(ReportFrequency.Daily);
        values.Should().Contain(ReportFrequency.Weekly);
        values.Should().Contain(ReportFrequency.Monthly);
    }

    #endregion

    #region EF Entity Tests

    [Fact]
    public void TenantDailyUsageSnapshotEntity_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var entity = new TenantDailyUsageSnapshotEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.TotalUsers.Should().Be(0);
        entity.ActiveUsers.Should().Be(0);
        entity.MfaEnabledUsers.Should().Be(0);
    }

    [Fact]
    public void ApplicationDailyUsageSnapshotEntity_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var entity = new ApplicationDailyUsageSnapshotEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.ApplicationId.Should().Be(Guid.Empty);
        entity.UniqueUsers.Should().Be(0);
        entity.SignInCount.Should().Be(0);
    }

    [Fact]
    public void UserSecurityPostureEntity_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var entity = new UserSecurityPostureEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.UserId.Should().Be(Guid.Empty);
        entity.MfaEnabled.Should().BeFalse();
        entity.IsAnonymized.Should().BeFalse();
    }

    [Fact]
    public void ReportSubscriptionEntity_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var entity = new ReportSubscriptionEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.ScopeType.Should().Be(0);
        entity.ReportType.Should().Be(0);
        entity.CronOrFrequency.Should().BeEmpty();
        entity.EmailRecipients.Should().BeEmpty();
        entity.IsActive.Should().BeFalse();
    }

    [Fact]
    public void ReportSubscriptionEntity_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var createdBy = Guid.NewGuid();

        // Act
        var entity = new ReportSubscriptionEntity
        {
            Id = id,
            ScopeType = (int)ScopeType.Tenant,
            ScopeId = scopeId,
            ReportType = (int)ReportType.TenantSecuritySummary,
            CronOrFrequency = "Daily",
            EmailRecipients = "test@example.com",
            IsActive = true,
            CreatedByUserId = createdBy
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.ScopeType.Should().Be(1);
        entity.ScopeId.Should().Be(scopeId);
        entity.ReportType.Should().Be(1);
        entity.CronOrFrequency.Should().Be("Daily");
        entity.EmailRecipients.Should().Be("test@example.com");
        entity.IsActive.Should().BeTrue();
        entity.CreatedByUserId.Should().Be(createdBy);
    }

    #endregion

    #region Repository Mock Tests - TenantDailyUsageSnapshotRepository

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_GetByIdAsync_ShouldReturnSnapshot()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var expectedId = Guid.NewGuid();
        var expectedSnapshot = new TenantDailyUsageSnapshot
        {
            Id = expectedId,
            TenantId = Guid.NewGuid(),
            TotalUsers = 100
        };

        mockRepo.Setup(r => r.GetByIdAsync(expectedId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSnapshot);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(expectedId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(expectedId);
        result.TotalUsers.Should().Be(100);
        mockRepo.Verify(r => r.GetByIdAsync(expectedId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_GetByIdAsync_ShouldReturnNullWhenNotFound()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var nonExistentId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantDailyUsageSnapshot?)null);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_GetByTenantAndDateAsync_ShouldReturnSnapshot()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var tenantId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var expectedSnapshot = new TenantDailyUsageSnapshot
        {
            TenantId = tenantId,
            Date = date
        };

        mockRepo.Setup(r => r.GetByTenantAndDateAsync(tenantId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSnapshot);

        // Act
        var result = await mockRepo.Object.GetByTenantAndDateAsync(tenantId, date);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.Date.Should().Be(date);
    }

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_GetByTenantAndDateRangeAsync_ShouldReturnSnapshots()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var tenantId = Guid.NewGuid();
        var fromDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        var toDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var expectedSnapshots = new List<TenantDailyUsageSnapshot>
        {
            new() { TenantId = tenantId, Date = fromDate },
            new() { TenantId = tenantId, Date = toDate }
        };

        mockRepo.Setup(r => r.GetByTenantAndDateRangeAsync(tenantId, fromDate, toDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSnapshots);

        // Act
        var result = await mockRepo.Object.GetByTenantAndDateRangeAsync(tenantId, fromDate, toDate);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(s => s.TenantId.Should().Be(tenantId));
    }

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_AddAsync_ShouldCallRepositoryMethod()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var snapshot = new TenantDailyUsageSnapshot
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        mockRepo.Setup(r => r.AddAsync(snapshot, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(snapshot);

        // Assert
        mockRepo.Verify(r => r.AddAsync(snapshot, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TenantDailyUsageSnapshotRepository_DeleteOlderThanAsync_ShouldCallRepositoryMethod()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-90));

        mockRepo.Setup(r => r.DeleteOlderThanAsync(cutoffDate, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteOlderThanAsync(cutoffDate);

        // Assert
        mockRepo.Verify(r => r.DeleteOlderThanAsync(cutoffDate, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Repository Mock Tests - ApplicationDailyUsageSnapshotRepository

    [Fact]
    public async Task ApplicationDailyUsageSnapshotRepository_GetTopApplicationsByUsageAsync_ShouldReturnTopApps()
    {
        // Arrange
        var mockRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var tenantId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var expectedSnapshots = new List<ApplicationDailyUsageSnapshot>
        {
            new() { SignInCount = 500 },
            new() { SignInCount = 400 },
            new() { SignInCount = 300 }
        };

        mockRepo.Setup(r => r.GetTopApplicationsByUsageAsync(tenantId, date, 3, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSnapshots);

        // Act
        var result = await mockRepo.Object.GetTopApplicationsByUsageAsync(tenantId, date, 3);

        // Assert
        result.Should().HaveCount(3);
        result.First().SignInCount.Should().Be(500);
    }

    [Fact]
    public async Task ApplicationDailyUsageSnapshotRepository_GetByApplicationAndDateAsync_ShouldReturnSnapshot()
    {
        // Arrange
        var mockRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var expectedSnapshot = new ApplicationDailyUsageSnapshot
        {
            TenantId = tenantId,
            ApplicationId = appId,
            Date = date
        };

        mockRepo.Setup(r => r.GetByApplicationAndDateAsync(tenantId, appId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSnapshot);

        // Act
        var result = await mockRepo.Object.GetByApplicationAndDateAsync(tenantId, appId, date);

        // Assert
        result.Should().NotBeNull();
        result!.ApplicationId.Should().Be(appId);
    }

    #endregion

    #region Repository Mock Tests - UserSecurityPostureRepository

    [Fact]
    public async Task UserSecurityPostureRepository_GetHighRiskUsersAsync_ShouldReturnHighRiskUsers()
    {
        // Arrange
        var mockRepo = new Mock<IUserSecurityPostureRepository>();
        var tenantId = Guid.NewGuid();
        var expectedUsers = new List<UserSecurityPosture>
        {
            new() { HighRiskEventsLast30Days = 10 },
            new() { HighRiskEventsLast30Days = 8 }
        };

        mockRepo.Setup(r => r.GetHighRiskUsersAsync(tenantId, 5, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedUsers);

        // Act
        var result = await mockRepo.Object.GetHighRiskUsersAsync(tenantId, 5, 10);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(u => u.HighRiskEventsLast30Days.Should().BeGreaterThanOrEqualTo(5));
    }

    [Fact]
    public async Task UserSecurityPostureRepository_GetUsersWithoutMfaAsync_ShouldReturnUsersWithoutMfa()
    {
        // Arrange
        var mockRepo = new Mock<IUserSecurityPostureRepository>();
        var tenantId = Guid.NewGuid();
        var expectedUsers = new List<UserSecurityPosture>
        {
            new() { MfaEnabled = false },
            new() { MfaEnabled = false }
        };

        mockRepo.Setup(r => r.GetUsersWithoutMfaAsync(tenantId, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedUsers);

        // Act
        var result = await mockRepo.Object.GetUsersWithoutMfaAsync(tenantId, 10);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(u => u.MfaEnabled.Should().BeFalse());
    }

    [Fact]
    public async Task UserSecurityPostureRepository_GetInactiveUsersAsync_ShouldReturnInactiveUsers()
    {
        // Arrange
        var mockRepo = new Mock<IUserSecurityPostureRepository>();
        var tenantId = Guid.NewGuid();
        var oldDate = DateTime.UtcNow.AddDays(-60);
        var expectedUsers = new List<UserSecurityPosture>
        {
            new() { LastSignInAt = oldDate },
            new() { LastSignInAt = null }
        };

        mockRepo.Setup(r => r.GetInactiveUsersAsync(tenantId, 30, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedUsers);

        // Act
        var result = await mockRepo.Object.GetInactiveUsersAsync(tenantId, 30, 10);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task UserSecurityPostureRepository_UpsertAsync_ShouldCallRepositoryMethod()
    {
        // Arrange
        var mockRepo = new Mock<IUserSecurityPostureRepository>();
        var posture = new UserSecurityPosture
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        mockRepo.Setup(r => r.UpsertAsync(posture, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpsertAsync(posture);

        // Assert
        mockRepo.Verify(r => r.UpsertAsync(posture, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UserSecurityPostureRepository_GetTotalCountAsync_ShouldReturnCount()
    {
        // Arrange
        var mockRepo = new Mock<IUserSecurityPostureRepository>();
        var tenantId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetTotalCountAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(150);

        // Act
        var result = await mockRepo.Object.GetTotalCountAsync(tenantId);

        // Assert
        result.Should().Be(150);
    }

    #endregion

    #region Repository Mock Tests - ReportSubscriptionRepository

    [Fact]
    public async Task ReportSubscriptionRepository_GetActiveSubscriptionsAsync_ShouldReturnActiveSubscriptions()
    {
        // Arrange
        var mockRepo = new Mock<IReportSubscriptionRepository>();
        var expectedSubscriptions = new List<ReportSubscription>
        {
            new() { IsActive = true },
            new() { IsActive = true }
        };

        mockRepo.Setup(r => r.GetActiveSubscriptionsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSubscriptions);

        // Act
        var result = await mockRepo.Object.GetActiveSubscriptionsAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(s => s.IsActive.Should().BeTrue());
    }

    [Fact]
    public async Task ReportSubscriptionRepository_GetByScopeAsync_ShouldReturnScopedSubscriptions()
    {
        // Arrange
        var mockRepo = new Mock<IReportSubscriptionRepository>();
        var scopeId = Guid.NewGuid();
        var expectedSubscriptions = new List<ReportSubscription>
        {
            new() { ScopeType = ScopeType.Tenant, ScopeId = scopeId }
        };

        mockRepo.Setup(r => r.GetByScopeAsync(ScopeType.Tenant, scopeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSubscriptions);

        // Act
        var result = await mockRepo.Object.GetByScopeAsync(ScopeType.Tenant, scopeId);

        // Assert
        result.Should().HaveCount(1);
        result.First().ScopeId.Should().Be(scopeId);
    }

    [Fact]
    public async Task ReportSubscriptionRepository_GetByReportTypeAsync_ShouldReturnSubscriptionsByType()
    {
        // Arrange
        var mockRepo = new Mock<IReportSubscriptionRepository>();
        var expectedSubscriptions = new List<ReportSubscription>
        {
            new() { ReportType = ReportType.TenantSecuritySummary }
        };

        mockRepo.Setup(r => r.GetByReportTypeAsync(ReportType.TenantSecuritySummary, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSubscriptions);

        // Act
        var result = await mockRepo.Object.GetByReportTypeAsync(ReportType.TenantSecuritySummary);

        // Assert
        result.Should().HaveCount(1);
        result.First().ReportType.Should().Be(ReportType.TenantSecuritySummary);
    }

    #endregion

    #region InsightsAggregationService Tests

    [Fact]
    public async Task InsightsAggregationService_GenerateDailySnapshotsAsync_WithTenantId_ShouldGenerateSnapshots()
    {
        // Arrange
        var mockTenantRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var mockAppRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var mockUserRepo = new Mock<IUserSecurityPostureRepository>();
        var mockLogger = new Mock<ILogger<InsightsAggregationService>>();

        var service = new InsightsAggregationService(
            mockTenantRepo.Object,
            mockAppRepo.Object,
            mockUserRepo.Object,
            mockLogger.Object);

        var tenantId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);

        mockTenantRepo.Setup(r => r.GetByTenantAndDateAsync(tenantId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantDailyUsageSnapshot?)null);

        mockTenantRepo.Setup(r => r.AddAsync(It.IsAny<TenantDailyUsageSnapshot>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        mockAppRepo.Setup(r => r.GetByApplicationAndDateAsync(tenantId, It.IsAny<Guid>(), date, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApplicationDailyUsageSnapshot?)null);

        mockAppRepo.Setup(r => r.AddAsync(It.IsAny<ApplicationDailyUsageSnapshot>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        mockUserRepo.Setup(r => r.UpsertAsync(It.IsAny<UserSecurityPosture>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await service.GenerateDailySnapshotsAsync(date, tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.TenantSnapshotsGenerated.Should().Be(1);
        result.ApplicationSnapshotsGenerated.Should().BeGreaterThan(0);
        result.UserPosturesUpdated.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task InsightsAggregationService_GenerateDailySnapshotsAsync_WithExistingSnapshot_ShouldUpdate()
    {
        // Arrange
        var mockTenantRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var mockAppRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var mockUserRepo = new Mock<IUserSecurityPostureRepository>();
        var mockLogger = new Mock<ILogger<InsightsAggregationService>>();

        var service = new InsightsAggregationService(
            mockTenantRepo.Object,
            mockAppRepo.Object,
            mockUserRepo.Object,
            mockLogger.Object);

        var tenantId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow);
        var existingSnapshot = new TenantDailyUsageSnapshot
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Date = date,
            TotalUsers = 100
        };

        mockTenantRepo.Setup(r => r.GetByTenantAndDateAsync(tenantId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSnapshot);

        mockTenantRepo.Setup(r => r.UpdateAsync(It.IsAny<TenantDailyUsageSnapshot>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        mockAppRepo.Setup(r => r.GetByApplicationAndDateAsync(tenantId, It.IsAny<Guid>(), date, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApplicationDailyUsageSnapshot?)null);

        mockAppRepo.Setup(r => r.AddAsync(It.IsAny<ApplicationDailyUsageSnapshot>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        mockUserRepo.Setup(r => r.UpsertAsync(It.IsAny<UserSecurityPosture>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await service.GenerateDailySnapshotsAsync(date, tenantId);

        // Assert
        result.Success.Should().BeTrue();
        mockTenantRepo.Verify(r => r.UpdateAsync(It.IsAny<TenantDailyUsageSnapshot>(), It.IsAny<CancellationToken>()), Times.Once);
        mockTenantRepo.Verify(r => r.AddAsync(It.IsAny<TenantDailyUsageSnapshot>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task InsightsAggregationService_CleanupOldSnapshotsAsync_ShouldDeleteOldData()
    {
        // Arrange
        var mockTenantRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var mockAppRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var mockUserRepo = new Mock<IUserSecurityPostureRepository>();
        var mockLogger = new Mock<ILogger<InsightsAggregationService>>();

        var service = new InsightsAggregationService(
            mockTenantRepo.Object,
            mockAppRepo.Object,
            mockUserRepo.Object,
            mockLogger.Object);

        mockTenantRepo.Setup(r => r.DeleteOlderThanAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        mockAppRepo.Setup(r => r.DeleteOlderThanAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await service.CleanupOldSnapshotsAsync(90);

        // Assert
        mockTenantRepo.Verify(r => r.DeleteOlderThanAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()), Times.Once);
        mockAppRepo.Verify(r => r.DeleteOlderThanAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task InsightsAggregationService_GenerateDailySnapshotsAsync_WithoutTenantId_ShouldReturnEmptyResult()
    {
        // Arrange
        var mockTenantRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var mockAppRepo = new Mock<IApplicationDailyUsageSnapshotRepository>();
        var mockUserRepo = new Mock<IUserSecurityPostureRepository>();
        var mockLogger = new Mock<ILogger<InsightsAggregationService>>();

        var service = new InsightsAggregationService(
            mockTenantRepo.Object,
            mockAppRepo.Object,
            mockUserRepo.Object,
            mockLogger.Object);

        var date = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = await service.GenerateDailySnapshotsAsync(date, null);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.TenantSnapshotsGenerated.Should().Be(0);
    }

    #endregion

    #region GenerateSnapshotResult Tests

    [Fact]
    public void GenerateSnapshotResult_DefaultValues_ShouldBeInitialized()
    {
        // Arrange & Act
        var result = new GenerateSnapshotResult();

        // Assert
        result.Success.Should().BeFalse();
        result.TenantSnapshotsGenerated.Should().Be(0);
        result.ApplicationSnapshotsGenerated.Should().Be(0);
        result.UserPosturesUpdated.Should().Be(0);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void GenerateSnapshotResult_SetProperties_ShouldRetainValues()
    {
        // Arrange & Act
        var result = new GenerateSnapshotResult
        {
            Success = true,
            TenantSnapshotsGenerated = 5,
            ApplicationSnapshotsGenerated = 25,
            UserPosturesUpdated = 100,
            ErrorMessage = null
        };

        // Assert
        result.Success.Should().BeTrue();
        result.TenantSnapshotsGenerated.Should().Be(5);
        result.ApplicationSnapshotsGenerated.Should().Be(25);
        result.UserPosturesUpdated.Should().Be(100);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void GenerateSnapshotResult_WithError_ShouldHaveErrorMessage()
    {
        // Arrange & Act
        var result = new GenerateSnapshotResult
        {
            Success = false,
            ErrorMessage = "Database connection failed"
        };

        // Assert
        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Be("Database connection failed");
    }

    #endregion

    #region Edge Cases and Error Handling Tests

    [Fact]
    public void TenantDailyUsageSnapshot_NegativeValues_ShouldBeAllowed()
    {
        // Arrange & Act
        var snapshot = new TenantDailyUsageSnapshot
        {
            TotalUsers = -1,
            ActiveUsers = -1
        };

        // Assert
        snapshot.TotalUsers.Should().Be(-1);
        snapshot.ActiveUsers.Should().Be(-1);
    }

    [Fact]
    public void ReportSubscription_EmptyEmailRecipients_ShouldBeAllowed()
    {
        // Arrange & Act
        var subscription = new ReportSubscription
        {
            EmailRecipients = string.Empty
        };

        // Assert
        subscription.EmailRecipients.Should().BeEmpty();
    }

    [Fact]
    public void UserSecurityPosture_ZeroCounts_ShouldBeValid()
    {
        // Arrange & Act
        var posture = new UserSecurityPosture
        {
            EnabledAppsCount = 0,
            UsedAppsLast30DaysCount = 0,
            HighRiskEventsLast30Days = 0
        };

        // Assert
        posture.EnabledAppsCount.Should().Be(0);
        posture.UsedAppsLast30DaysCount.Should().Be(0);
        posture.HighRiskEventsLast30Days.Should().Be(0);
    }

    [Theory]
    [InlineData("2024-01-01")]
    [InlineData("2024-12-31")]
    [InlineData("2025-06-15")]
    public void TenantDailyUsageSnapshot_VariousDates_ShouldBeAccepted(string dateString)
    {
        // Arrange
        var date = DateOnly.Parse(dateString);

        // Act
        var snapshot = new TenantDailyUsageSnapshot { Date = date };

        // Assert
        snapshot.Date.Should().Be(date);
    }

    [Fact]
    public async Task Repository_CancellationToken_ShouldBePassed()
    {
        // Arrange
        var mockRepo = new Mock<ITenantDailyUsageSnapshotRepository>();
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var id = Guid.NewGuid();

        mockRepo.Setup(r => r.GetByIdAsync(id, token))
            .ReturnsAsync((TenantDailyUsageSnapshot?)null);

        // Act
        await mockRepo.Object.GetByIdAsync(id, token);

        // Assert
        mockRepo.Verify(r => r.GetByIdAsync(id, token), Times.Once);
    }

    [Fact]
    public void ReportSubscription_MultipleEmailRecipients_ShouldBeStoredAsSemicolonSeparated()
    {
        // Arrange
        var recipients = "user1@example.com;user2@example.com;user3@example.com";

        // Act
        var subscription = new ReportSubscription
        {
            EmailRecipients = recipients
        };

        // Assert
        subscription.EmailRecipients.Should().Contain(";");
        subscription.EmailRecipients.Split(';').Should().HaveCount(3);
    }

    [Fact]
    public void ApplicationDailyUsageSnapshot_MaxValues_ShouldBeSupported()
    {
        // Arrange & Act
        var snapshot = new ApplicationDailyUsageSnapshot
        {
            UniqueUsers = int.MaxValue,
            SignInCount = int.MaxValue,
            FailedSignInCount = int.MaxValue,
            HighRiskSignInCount = int.MaxValue
        };

        // Assert
        snapshot.UniqueUsers.Should().Be(int.MaxValue);
        snapshot.SignInCount.Should().Be(int.MaxValue);
    }

    #endregion
}
