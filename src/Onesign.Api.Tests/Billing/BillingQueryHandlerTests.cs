using FluentAssertions;
using MediatR;
using Moq;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class GetPlansQueryHandlerTests
{
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly GetPlansQueryHandler _handler;

    public GetPlansQueryHandlerTests()
    {
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new GetPlansQueryHandler(_planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsAllPlans()
    {
        // Arrange
        var plans = new List<Plan>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Free",
                Code = "FREE",
                Type = PlanType.Free,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                Features = new List<PlanFeature>()
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Code = "PRO",
                Type = PlanType.Pro,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                Features = new List<PlanFeature>
                {
                    new() { Id = Guid.NewGuid(), Key = "MaxUsers", Value = "100", LimitType = LimitType.Hard }
                }
            }
        };

        var query = new GetPlansQuery();

        _planRepositoryMock.Setup(x => x.GetAllAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plans);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().Contain(p => p.Name == "Free");
        result.Value.Should().Contain(p => p.Name == "Pro");
    }

    [Fact]
    public async Task Handle_FilterByActive_ReturnsOnlyActive()
    {
        // Arrange
        var activePlans = new List<Plan>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Active Plan",
                Code = "ACT",
                Type = PlanType.Pro,
                IsActive = true,
                Features = new List<PlanFeature>()
            }
        };

        var query = new GetPlansQuery { IsActive = true };

        _planRepositoryMock.Setup(x => x.GetAllAsync(true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activePlans);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().AllSatisfy(p => p.IsActive.Should().BeTrue());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptySuccess()
    {
        // Arrange
        var query = new GetPlansQuery();

        _planRepositoryMock.Setup(x => x.GetAllAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Plan>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_MapsFeatures_Correctly()
    {
        // Arrange
        var plans = new List<Plan>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Enterprise",
                Code = "ENT",
                Type = PlanType.Enterprise,
                IsActive = true,
                Features = new List<PlanFeature>
                {
                    new() { Id = Guid.NewGuid(), Key = "MaxUsers", Value = "1000", LimitType = LimitType.Hard },
                    new() { Id = Guid.NewGuid(), Key = "SsoEnabled", Value = "true" }
                }
            }
        };

        var query = new GetPlansQuery();

        _planRepositoryMock.Setup(x => x.GetAllAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plans);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.First().Features.Should().HaveCount(2);
        result.Value.First().Features.Should().Contain(f => f.Key == "MaxUsers" && f.Value == "1000");
    }
}

public class GetPlanByIdQueryHandlerTests
{
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly GetPlanByIdQueryHandler _handler;

    public GetPlanByIdQueryHandlerTests()
    {
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new GetPlanByIdQueryHandler(_planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingPlan_ReturnsPlan()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var plan = new Plan
        {
            Id = planId,
            Name = "Enterprise",
            Code = "ENT",
            Type = PlanType.Enterprise,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            Features = new List<PlanFeature>
            {
                new() { Id = Guid.NewGuid(), Key = "MaxUsers", Value = "1000", LimitType = LimitType.Hard }
            }
        };

        var query = new GetPlanByIdQuery { Id = planId };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(planId);
        result.Value.Name.Should().Be("Enterprise");
        result.Value.Code.Should().Be("ENT");
        result.Value.Type.Should().Be(PlanType.Enterprise);
        result.Value.Features.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_PlanNotFound_ReturnsFailure()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var query = new GetPlanByIdQuery { Id = planId };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_NOT_FOUND");
        result.ErrorMessage.Should().Contain(planId.ToString());
    }
}

public class GetTenantSubscriptionQueryHandlerTests
{
    private readonly Mock<ISubscriptionRepository> _subscriptionRepositoryMock;
    private readonly GetTenantSubscriptionQueryHandler _handler;

    public GetTenantSubscriptionQueryHandlerTests()
    {
        _subscriptionRepositoryMock = new Mock<ISubscriptionRepository>();
        _handler = new GetTenantSubscriptionQueryHandler(_subscriptionRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingSubscription_ReturnsSubscription()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active,
            StartedAt = DateTime.UtcNow.AddDays(-30),
            CurrentPeriodEndsAt = DateTime.UtcNow.AddDays(1),
            Plan = new Plan
            {
                Id = planId,
                Name = "Pro",
                Code = "PRO",
                Type = PlanType.Pro,
                IsActive = true,
                Features = new List<PlanFeature>
                {
                    new() { Id = Guid.NewGuid(), Key = "MaxUsers", Value = "100", LimitType = LimitType.Hard }
                }
            }
        };

        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.TenantId.Should().Be(tenantId);
        result.Value.PlanId.Should().Be(planId);
        result.Value.PlanName.Should().Be("Pro");
        result.Value.PlanType.Should().Be(PlanType.Pro);
        result.Value.Status.Should().Be(SubscriptionStatus.Active);
        result.Value.Plan.Should().NotBeNull();
        result.Value.Plan!.Features.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_SubscriptionNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("SUBSCRIPTION_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_TrialSubscription_SetsIsTrialCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Trial,
            StartedAt = DateTime.UtcNow.AddDays(-7),
            TrialEndsAt = DateTime.UtcNow.AddDays(7),
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Pro Trial",
                Type = PlanType.Pro,
                Features = new List<PlanFeature>()
            }
        };

        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsTrial.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_SubscriptionWithoutPlan_HandlesNullPlan()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active,
            StartedAt = DateTime.UtcNow.AddDays(-30),
            Plan = null
        };

        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.PlanName.Should().BeNull();
        result.Value.PlanType.Should().BeNull();
        result.Value.Plan.Should().BeNull();
    }
}

public class GetTenantQuotaStatusQueryHandlerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly GetTenantQuotaStatusQueryHandler _handler;

    public GetTenantQuotaStatusQueryHandlerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _handler = new GetTenantQuotaStatusQueryHandler(_mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_ValidTenant_ReturnsQuotaStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var quotaStatus = new TenantQuotaStatusDto
        {
            TenantId = tenantId,
            UserCount = 50,
            MaxUsers = 100,
            UserUsagePercent = 50,
            IsNearUserLimit = false,
            IsOverUserLimit = false
        };

        var usageSummary = new TenantUsageSummaryDto
        {
            TenantId = tenantId,
            QuotaStatus = quotaStatus
        };

        var query = new GetTenantQuotaStatusQuery { TenantId = tenantId };

        _mediatorMock.Setup(x => x.Send(It.IsAny<GetTenantUsageSummaryQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(usageSummary));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.TenantId.Should().Be(tenantId);
        result.Value.UserCount.Should().Be(50);
        result.Value.MaxUsers.Should().Be(100);
    }

    [Fact]
    public async Task Handle_UsageSummaryFails_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantQuotaStatusQuery { TenantId = tenantId };

        _mediatorMock.Setup(x => x.Send(It.IsAny<GetTenantUsageSummaryQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure<TenantUsageSummaryDto>("SUBSCRIPTION_NOT_FOUND", "Tenant does not have a subscription"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("SUBSCRIPTION_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_NullQuotaStatus_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var usageSummary = new TenantUsageSummaryDto
        {
            TenantId = tenantId,
            QuotaStatus = null
        };

        var query = new GetTenantQuotaStatusQuery { TenantId = tenantId };

        _mediatorMock.Setup(x => x.Send(It.IsAny<GetTenantUsageSummaryQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(usageSummary));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("QUOTA_STATUS_ERROR");
    }

    [Fact]
    public async Task Handle_PassesCorrectTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantQuotaStatusQuery { TenantId = tenantId };

        GetTenantUsageSummaryQuery? capturedQuery = null;
        _mediatorMock.Setup(x => x.Send(It.IsAny<GetTenantUsageSummaryQuery>(), It.IsAny<CancellationToken>()))
            .Callback<IRequest<Result<TenantUsageSummaryDto>>, CancellationToken>((q, _) => capturedQuery = (GetTenantUsageSummaryQuery)q)
            .ReturnsAsync(Result.Success(new TenantUsageSummaryDto
            {
                TenantId = tenantId,
                QuotaStatus = new TenantQuotaStatusDto { TenantId = tenantId }
            }));

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        capturedQuery.Should().NotBeNull();
        capturedQuery!.TenantId.Should().Be(tenantId);
    }
}
