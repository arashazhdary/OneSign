using FluentAssertions;
using Moq;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class CreatePlanCommandHandlerTests
{
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly CreatePlanCommandHandler _handler;

    public CreatePlanCommandHandlerTests()
    {
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new CreatePlanCommandHandler(_planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidPlan_ReturnsSuccess()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Enterprise",
            Code = "ENT",
            Type = PlanType.Enterprise,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Key = "MaxUsers", Value = "1000", LimitType = LimitType.Hard },
                new() { Key = "MaxApplications", Value = "100", LimitType = LimitType.Hard }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Enterprise");
        result.Value.Code.Should().Be("ENT");
        result.Value.Type.Should().Be(PlanType.Enterprise);
        result.Value.IsActive.Should().BeTrue();
        result.Value.Features.Should().HaveCount(2);

        _planRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateCode_ReturnsFailure()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Enterprise",
            Code = "ENT",
            Type = PlanType.Enterprise,
            IsActive = true
        };

        var existingPlan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = "Existing",
            Code = "ENT"
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_CODE_EXISTS");
        result.ErrorMessage.Should().Contain("ENT");

        _planRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithFeatures_CreatesAllFeatures()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Pro",
            Code = "PRO",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Key = "MaxUsers", Value = "100", LimitType = LimitType.Hard },
                new() { Key = "MaxApplications", Value = "10", LimitType = LimitType.Soft },
                new() { Key = "MaxIdpConnections", Value = "5", LimitType = LimitType.Hard },
                new() { Key = "SsoEnabled", Value = "true" }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        Plan? capturedPlan = null;
        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .Callback<Plan, CancellationToken>((plan, _) => capturedPlan = plan)
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedPlan.Should().NotBeNull();
        capturedPlan!.Features.Should().HaveCount(4);
        capturedPlan.Features.Should().Contain(f => f.Key == "MaxUsers" && f.Value == "100");
        capturedPlan.Features.Should().Contain(f => f.Key == "SsoEnabled" && f.Value == "true");
    }

    [Fact]
    public async Task Handle_WithNoFeatures_CreatesEmptyFeatureList()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Free",
            Code = "FREE",
            Type = PlanType.Free,
            IsActive = true,
            Features = new List<PlanFeatureDto>()
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Features.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_InactivePlan_SetsIsActiveFalse()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Deprecated",
            Code = "DEP",
            Type = PlanType.Custom,
            IsActive = false
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsActive.Should().BeFalse();
    }

    [Theory]
    [InlineData(PlanType.Free)]
    [InlineData(PlanType.Pro)]
    [InlineData(PlanType.Enterprise)]
    [InlineData(PlanType.Custom)]
    public async Task Handle_AllPlanTypes_CreatesSuccessfully(PlanType planType)
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = $"{planType} Plan",
            Code = planType.ToString().ToUpper(),
            Type = planType,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Type.Should().Be(planType);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueIds()
    {
        // Arrange
        var command = new CreatePlanCommand
        {
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Key = "Feature1", Value = "Value1" }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        Plan? capturedPlan = null;
        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .Callback<Plan, CancellationToken>((plan, _) => capturedPlan = plan)
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedPlan.Should().NotBeNull();
        capturedPlan!.Id.Should().NotBe(Guid.Empty);
        capturedPlan.Features.First().Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtTimestamp()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var command = new CreatePlanCommand
        {
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        Plan? capturedPlan = null;
        _planRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()))
            .Callback<Plan, CancellationToken>((plan, _) => capturedPlan = plan)
            .ReturnsAsync((Plan plan, CancellationToken _) => plan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        capturedPlan!.CreatedAt.Should().BeOnOrAfter(beforeTime);
        capturedPlan.CreatedAt.Should().BeOnOrBefore(afterTime);
    }
}
