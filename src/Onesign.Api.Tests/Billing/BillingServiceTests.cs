using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;

namespace Onesign.Api.Tests.Billing;

public class BillingServiceTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task CreatePlan_ValidPlan_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new PlanRepository(context);

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Enterprise",
            Description = "Full-featured enterprise plan",
            Price = 299.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 1000,
            MaxApplications = 100,
            Features = "SSO,MFA,SCIM,Custom Branding",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(plan, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Enterprise", result.Name);
        Assert.Equal(299.99m, result.Price);
    }

    [Fact]
    public async Task GetActivePlans_ReturnsOnlyActive()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new PlanRepository(context);

        var activePlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Active Plan",
            Description = "Active",
            Price = 99.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 100,
            MaxApplications = 10,
            Features = "Basic",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inactivePlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Inactive Plan",
            Description = "Inactive",
            Price = 49.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 50,
            MaxApplications = 5,
            Features = "Basic",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(activePlan, CancellationToken.None);
        await repository.AddAsync(inactivePlan, CancellationToken.None);

        // Act
        var plans = await repository.GetActivePlansAsync(CancellationToken.None);

        // Assert
        Assert.NotNull(plans);
        Assert.Single(plans);
        Assert.Equal("Active Plan", plans.First().Name);
    }

    [Fact]
    public async Task CreateSubscription_ValidSubscription_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var subscriptionRepository = new SubscriptionRepository(context);
        var planRepository = new PlanRepository(context);
        var tenantId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Pro",
            Description = "Professional plan",
            Price = 99.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 100,
            MaxApplications = 10,
            Features = "SSO,MFA",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await planRepository.AddAsync(plan, CancellationToken.None);

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = plan.Id,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await subscriptionRepository.AddAsync(subscription, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(tenantId, result.TenantId);
        Assert.Equal(SubscriptionStatus.Active, result.Status);
    }

    [Fact]
    public async Task GetTenantSubscription_ReturnsActiveSubscription()
    {
        // Arrange
        using var context = CreateContext();
        var subscriptionRepository = new SubscriptionRepository(context);
        var planRepository = new PlanRepository(context);
        var tenantId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Basic",
            Description = "Basic plan",
            Price = 29.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 10,
            MaxApplications = 3,
            Features = "Basic",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await planRepository.AddAsync(plan, CancellationToken.None);

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = plan.Id,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            CreatedAt = DateTime.UtcNow
        };

        await subscriptionRepository.AddAsync(subscription, CancellationToken.None);

        // Act
        var result = await subscriptionRepository.GetActiveByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(tenantId, result.TenantId);
        Assert.Equal(plan.Id, result.PlanId);
    }

    [Fact]
    public async Task CancelSubscription_ValidSubscription_CancelsSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var subscriptionRepository = new SubscriptionRepository(context);
        var planRepository = new PlanRepository(context);
        var tenantId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Pro",
            Description = "Pro plan",
            Price = 99.99m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 100,
            MaxApplications = 10,
            Features = "Pro",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await planRepository.AddAsync(plan, CancellationToken.None);

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = plan.Id,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            CreatedAt = DateTime.UtcNow
        };

        await subscriptionRepository.AddAsync(subscription, CancellationToken.None);

        // Act
        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.CancelledAt = DateTime.UtcNow;
        await subscriptionRepository.UpdateAsync(subscription, CancellationToken.None);

        var result = await subscriptionRepository.GetByIdAsync(subscription.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(SubscriptionStatus.Cancelled, result.Status);
        Assert.NotNull(result.CancelledAt);
    }

    [Fact]
    public async Task GetExpiredSubscriptions_ReturnsExpired()
    {
        // Arrange
        using var context = CreateContext();
        var subscriptionRepository = new SubscriptionRepository(context);
        var planRepository = new PlanRepository(context);

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Description = "Test",
            Price = 10m,
            BillingCycle = BillingCycle.Monthly,
            MaxUsers = 5,
            MaxApplications = 1,
            Features = "Test",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await planRepository.AddAsync(plan, CancellationToken.None);

        // Create expired subscription
        var expiredSubscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PlanId = plan.Id,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow.AddMonths(-2),
            EndDate = DateTime.UtcNow.AddDays(-1), // Expired
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        // Create active subscription
        var activeSubscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PlanId = plan.Id,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1), // Not expired
            CreatedAt = DateTime.UtcNow
        };

        await subscriptionRepository.AddAsync(expiredSubscription, CancellationToken.None);
        await subscriptionRepository.AddAsync(activeSubscription, CancellationToken.None);

        // Act
        var expiredSubscriptions = await subscriptionRepository.GetExpiredSubscriptionsAsync(CancellationToken.None);

        // Assert
        Assert.NotNull(expiredSubscriptions);
        Assert.Single(expiredSubscriptions);
        Assert.True(expiredSubscriptions.First().EndDate < DateTime.UtcNow);
    }
}
