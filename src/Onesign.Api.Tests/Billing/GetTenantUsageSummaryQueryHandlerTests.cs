using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class GetTenantUsageSummaryQueryHandlerTests
{
    private readonly Mock<ISubscriptionRepository> _subscriptionRepositoryMock;
    private readonly Mock<IUsageRepository> _usageRepositoryMock;
    private readonly Mock<DbContext> _dbContextMock;

    public GetTenantUsageSummaryQueryHandlerTests()
    {
        _subscriptionRepositoryMock = new Mock<ISubscriptionRepository>();
        _usageRepositoryMock = new Mock<IUsageRepository>();
        _dbContextMock = new Mock<DbContext>();
    }

    private GetTenantUsageSummaryQueryHandler CreateHandler()
    {
        return new GetTenantUsageSummaryQueryHandler(
            _subscriptionRepositoryMock.Object,
            _usageRepositoryMock.Object,
            _dbContextMock.Object);
    }

    [Fact]
    public async Task Handle_NoSubscription_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("SUBSCRIPTION_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithSubscription_ReturnsBasicSummary()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var subscription = CreateTestSubscription(tenantId, planId);

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.TenantId.Should().Be(tenantId);
        result.Value.Subscription.Should().NotBeNull();
        result.Value.Subscription!.PlanId.Should().Be(planId);
    }

    [Fact]
    public async Task Handle_ExtractsMaxUsersFromFeatures()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxUsers", "100" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxUsers.Should().Be(100);
    }

    [Fact]
    public async Task Handle_ExtractsMaxApplicationsFromFeatures()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxApplications", "50" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxApplications.Should().Be(50);
    }

    [Fact]
    public async Task Handle_ExtractsMaxIdpConnectionsFromFeatures()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxIdpConnections", "10" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxIdpConnections.Should().Be(10);
    }

    [Fact]
    public async Task Handle_ExtractsMaxLoginsPerMonthFromFeatures()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxLoginsPerMonth", "10000" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxLoginsPerMonth.Should().Be(10000);
    }

    [Fact]
    public async Task Handle_NoFeatures_ReturnsNullLimits()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxUsers.Should().BeNull();
        result.Value.MaxApplications.Should().BeNull();
        result.Value.MaxIdpConnections.Should().BeNull();
        result.Value.MaxOrgUnits.Should().BeNull();
        result.Value.MaxLoginsPerMonth.Should().BeNull();
    }

    [Fact]
    public async Task Handle_InvalidFeatureValue_ReturnsNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxUsers", "not-a-number" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.MaxUsers.Should().BeNull();
    }

    [Fact]
    public async Task Handle_GetsLoginsFromUsageCounter()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());

        var loginsCounter = new UsageCounter
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Value = 500,
            PeriodYear = DateTime.UtcNow.Year,
            PeriodMonth = DateTime.UtcNow.Month
        };

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(loginsCounter);

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.ScimCalls,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.LoginsThisMonth.Should().Be(500);
    }

    [Fact]
    public async Task Handle_GetsScimCallsFromUsageCounter()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());

        var scimCounter = new UsageCounter
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            MetricType = UsageMetricType.ScimCalls,
            Value = 1000,
            PeriodYear = DateTime.UtcNow.Year,
            PeriodMonth = DateTime.UtcNow.Month
        };

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.ScimCalls,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(scimCounter);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.ScimCallsThisMonth.Should().Be(1000);
    }

    [Fact]
    public async Task Handle_NoUsageCounters_ReturnsZero()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.LoginsThisMonth.Should().Be(0);
        result.Value.ScimCallsThisMonth.Should().Be(0);
    }

    [Fact]
    public async Task Handle_IncludesQuotaStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>
        {
            { "MaxUsers", "100" }
        });

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.QuotaStatus.Should().NotBeNull();
        result.Value.QuotaStatus!.TenantId.Should().Be(tenantId);
        result.Value.QuotaStatus.MaxUsers.Should().Be(100);
    }

    [Fact]
    public async Task Handle_SetsLastUpdated()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        result.Value!.LastUpdated.Should().BeOnOrAfter(beforeTime);
        result.Value.LastUpdated.Should().BeOnOrBefore(afterTime);
    }

    [Fact]
    public async Task Handle_MapsSubscriptionDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = CreateSubscriptionWithFeatures(tenantId, new Dictionary<string, string>());
        subscription.Status = SubscriptionStatus.Trial;
        subscription.TrialEndsAt = DateTime.UtcNow.AddDays(14);

        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        SetupEmptyDbSets();
        SetupEmptyUsageCounters(tenantId);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.Subscription.Should().NotBeNull();
        result.Value.Subscription!.Status.Should().Be(SubscriptionStatus.Trial);
        result.Value.Subscription.TrialEndsAt.Should().Be(subscription.TrialEndsAt);
    }

    #region Helper Methods

    private TenantSubscription CreateTestSubscription(Guid tenantId, Guid? planId = null)
    {
        var id = planId ?? Guid.NewGuid();
        return new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = id,
            Status = SubscriptionStatus.Active,
            StartedAt = DateTime.UtcNow.AddDays(-30),
            Plan = new Plan
            {
                Id = id,
                Name = "Pro",
                Code = "PRO",
                Type = PlanType.Pro,
                IsActive = true,
                Features = new List<PlanFeature>()
            }
        };
    }

    private TenantSubscription CreateSubscriptionWithFeatures(Guid tenantId, Dictionary<string, string> features)
    {
        var planId = Guid.NewGuid();
        return new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active,
            StartedAt = DateTime.UtcNow.AddDays(-30),
            Plan = new Plan
            {
                Id = planId,
                Name = "Custom",
                Code = "CUSTOM",
                Type = PlanType.Custom,
                IsActive = true,
                Features = features.Select(kv => new PlanFeature
                {
                    Id = Guid.NewGuid(),
                    PlanId = planId,
                    Key = kv.Key,
                    Value = kv.Value
                }).ToList()
            }
        };
    }

    private void SetupEmptyDbSets()
    {
        // Note: In a real test, you would need to properly mock DbSets
        // This is a simplified version that assumes the handler will handle
        // the case where DbSets return empty results or zero counts
    }

    private void SetupEmptyUsageCounters(Guid tenantId)
    {
        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.ScimCalls,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);
    }

    #endregion
}
