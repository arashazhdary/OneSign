using FluentAssertions;
using Moq;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class ChangeTenantPlanCommandHandlerTests
{
    private readonly Mock<ISubscriptionRepository> _subscriptionRepositoryMock;
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly ChangeTenantPlanCommandHandler _handler;

    public ChangeTenantPlanCommandHandlerTests()
    {
        _subscriptionRepositoryMock = new Mock<ISubscriptionRepository>();
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new ChangeTenantPlanCommandHandler(
            _subscriptionRepositoryMock.Object,
            _planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ChangesPlanSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var oldPlanId = Guid.NewGuid();
        var newPlanId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = oldPlanId,
            Status = SubscriptionStatus.Active,
            StartedAt = DateTime.UtcNow.AddDays(-30)
        };

        var newPlan = new Plan
        {
            Id = newPlanId,
            Name = "Enterprise",
            Code = "ENT",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlanId
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.PlanId.Should().Be(newPlanId);
        result.Value.PlanName.Should().Be("Enterprise");
        result.Value.PlanType.Should().Be(PlanType.Enterprise);

        _subscriptionRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SubscriptionNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = Guid.NewGuid()
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("SUBSCRIPTION_NOT_FOUND");

        _subscriptionRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PlanNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var newPlanId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlanId
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_NOT_FOUND");
        result.ErrorMessage.Should().Contain(newPlanId.ToString());

        _subscriptionRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_InactivePlan_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var newPlanId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active
        };

        var inactivePlan = new Plan
        {
            Id = newPlanId,
            Name = "Deprecated",
            Type = PlanType.Custom,
            IsActive = false
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlanId
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(inactivePlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_INACTIVE");

        _subscriptionRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var tenantId = Guid.NewGuid();
        var newPlanId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active
        };

        var newPlan = new Plan
        {
            Id = newPlanId,
            Name = "Enterprise",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlanId
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        subscription.UpdatedAt.Should().NotBeNull();
        subscription.UpdatedAt!.Value.Should().BeOnOrAfter(beforeTime);
        subscription.UpdatedAt.Value.Should().BeOnOrBefore(afterTime);
    }

    [Fact]
    public async Task Handle_PreservesExistingSubscriptionProperties()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscriptionId = Guid.NewGuid();
        var startedAt = DateTime.UtcNow.AddDays(-30);
        var trialEndsAt = DateTime.UtcNow.AddDays(-16);
        var periodEndsAt = DateTime.UtcNow.AddDays(1);

        var subscription = new TenantSubscription
        {
            Id = subscriptionId,
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active,
            StartedAt = startedAt,
            TrialEndsAt = trialEndsAt,
            CurrentPeriodEndsAt = periodEndsAt
        };

        var newPlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "New Plan",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlan.Id
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlan.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().Be(subscriptionId);
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.StartedAt.Should().Be(startedAt);
        result.Value.TrialEndsAt.Should().Be(trialEndsAt);
        result.Value.CurrentPeriodEndsAt.Should().Be(periodEndsAt);
    }

    [Theory]
    [InlineData(PlanType.Free)]
    [InlineData(PlanType.Pro)]
    [InlineData(PlanType.Enterprise)]
    [InlineData(PlanType.Custom)]
    public async Task Handle_AllPlanTypes_ChangesSuccessfully(PlanType planType)
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.Active
        };

        var newPlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = $"{planType} Plan",
            Type = planType,
            IsActive = true
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlan.Id
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlan.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.PlanType.Should().Be(planType);
    }

    [Fact]
    public async Task Handle_PreservesSubscriptionStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid(),
            Status = SubscriptionStatus.PastDue
        };

        var newPlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "New Plan",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = newPlan.Id
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        _planRepositoryMock.Setup(x => x.GetByIdAsync(newPlan.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(SubscriptionStatus.PastDue);
    }
}
