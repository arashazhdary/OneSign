using FluentAssertions;
using Moq;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class AssignSubscriptionToTenantCommandHandlerTests
{
    private readonly Mock<ISubscriptionRepository> _subscriptionRepositoryMock;
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly AssignSubscriptionToTenantCommandHandler _handler;

    public AssignSubscriptionToTenantCommandHandlerTests()
    {
        _subscriptionRepositoryMock = new Mock<ISubscriptionRepository>();
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new AssignSubscriptionToTenantCommandHandler(
            _subscriptionRepositoryMock.Object,
            _planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesSubscription()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = planId,
            Name = "Enterprise",
            Code = "ENT",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active,
            CurrentPeriodEndsAt = DateTime.UtcNow.AddMonths(1)
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.TenantId.Should().Be(tenantId);
        result.Value.PlanId.Should().Be(planId);
        result.Value.PlanName.Should().Be("Enterprise");
        result.Value.PlanType.Should().Be(PlanType.Enterprise);
        result.Value.Status.Should().Be(SubscriptionStatus.Active);

        _subscriptionRepositoryMock.Verify(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PlanNotFound_ReturnsFailure()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = Guid.NewGuid(),
            PlanId = planId,
            Status = SubscriptionStatus.Active
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_NOT_FOUND");
        result.ErrorMessage.Should().Contain(planId.ToString());

        _subscriptionRepositoryMock.Verify(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_TenantAlreadyHasSubscription_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro
        };

        var existingSubscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = Guid.NewGuid()
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSubscription);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("SUBSCRIPTION_EXISTS");

        _subscriptionRepositoryMock.Verify(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_TrialSubscription_SetsTrialEndsAt()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var trialEndDate = DateTime.UtcNow.AddDays(14);

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro,
            IsActive = true
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Trial,
            TrialEndsAt = trialEndDate
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        TenantSubscription? capturedSubscription = null;
        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .Callback<TenantSubscription, CancellationToken>((sub, _) => capturedSubscription = sub)
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedSubscription!.TrialEndsAt.Should().Be(trialEndDate);
        capturedSubscription.Status.Should().Be(SubscriptionStatus.Trial);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueSubscriptionId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        TenantSubscription? capturedSubscription = null;
        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .Callback<TenantSubscription, CancellationToken>((sub, _) => capturedSubscription = sub)
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedSubscription!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_SetsStartedAtAndCreatedAt()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        TenantSubscription? capturedSubscription = null;
        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .Callback<TenantSubscription, CancellationToken>((sub, _) => capturedSubscription = sub)
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        capturedSubscription!.StartedAt.Should().BeOnOrAfter(beforeTime);
        capturedSubscription.StartedAt.Should().BeOnOrBefore(afterTime);
        capturedSubscription.CreatedAt.Should().BeOnOrAfter(beforeTime);
        capturedSubscription.CreatedAt.Should().BeOnOrBefore(afterTime);
    }

    [Theory]
    [InlineData(SubscriptionStatus.Trial)]
    [InlineData(SubscriptionStatus.Active)]
    [InlineData(SubscriptionStatus.PastDue)]
    [InlineData(SubscriptionStatus.Suspended)]
    [InlineData(SubscriptionStatus.Canceled)]
    public async Task Handle_AllSubscriptionStatuses_CreatesSuccessfully(SubscriptionStatus status)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = status
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(status);
    }

    [Fact]
    public async Task Handle_WithCurrentPeriodEndsAt_SetsValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var periodEndDate = DateTime.UtcNow.AddMonths(1);

        var plan = new Plan
        {
            Id = planId,
            Name = "Pro",
            Type = PlanType.Pro
        };

        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active,
            CurrentPeriodEndsAt = periodEndDate
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        TenantSubscription? capturedSubscription = null;
        _subscriptionRepositoryMock.Setup(x => x.AddAsync(It.IsAny<TenantSubscription>(), It.IsAny<CancellationToken>()))
            .Callback<TenantSubscription, CancellationToken>((sub, _) => capturedSubscription = sub)
            .ReturnsAsync((TenantSubscription sub, CancellationToken _) => sub);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedSubscription!.CurrentPeriodEndsAt.Should().Be(periodEndDate);
    }
}
