using FluentAssertions;
using Moq;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class UpdatePlanCommandHandlerTests
{
    private readonly Mock<IPlanRepository> _planRepositoryMock;
    private readonly UpdatePlanCommandHandler _handler;

    public UpdatePlanCommandHandlerTests()
    {
        _planRepositoryMock = new Mock<IPlanRepository>();
        _handler = new UpdatePlanCommandHandler(_planRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingPlan_UpdatesSuccessfully()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Old Name",
            Code = "OLD",
            Type = PlanType.Pro,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "New Name",
            Code = "NEW",
            Type = PlanType.Enterprise,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Key = "MaxUsers", Value = "500", LimitType = LimitType.Hard }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("New Name");
        result.Value.Code.Should().Be("NEW");
        result.Value.Type.Should().Be(PlanType.Enterprise);
        result.Value.Features.Should().HaveCount(1);

        _planRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PlanNotFound_ReturnsFailure()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Plan?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_NOT_FOUND");
        result.ErrorMessage.Should().Contain(planId.ToString());

        _planRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_DuplicateCode_ReturnsFailure()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var otherPlanId = Guid.NewGuid();

        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Original",
            Code = "ORIG",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var otherPlan = new Plan
        {
            Id = otherPlanId,
            Name = "Other",
            Code = "NEW"
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Updated",
            Code = "NEW", // Conflicts with otherPlan
            Type = PlanType.Pro,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(otherPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("PLAN_CODE_EXISTS");

        _planRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SameCode_AllowsUpdate()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Original",
            Code = "SAME",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Updated Name",
            Code = "SAME", // Same code
            Type = PlanType.Enterprise,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Updated Name");

        _planRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<Plan>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CodeConflictWithSamePlan_AllowsUpdate()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Original",
            Code = "CODE",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Updated",
            Code = "NEWCODE",
            Type = PlanType.Pro,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Return the same plan when checking for code conflict
        _planRepositoryMock.Setup(x => x.GetByCodeAsync(command.Code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Plan { Id = planId, Code = "NEWCODE" });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_UpdateFeatures_ReplacesAllFeatures()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>
            {
                new() { Id = Guid.NewGuid(), Key = "OldFeature", Value = "OldValue" }
            }
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Key = "NewFeature1", Value = "NewValue1", LimitType = LimitType.Hard },
                new() { Key = "NewFeature2", Value = "NewValue2", LimitType = LimitType.Soft }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Features.Should().HaveCount(2);
        result.Value.Features.Should().Contain(f => f.Key == "NewFeature1");
        result.Value.Features.Should().Contain(f => f.Key == "NewFeature2");
        result.Value.Features.Should().NotContain(f => f.Key == "OldFeature");
    }

    [Fact]
    public async Task Handle_ExistingFeatureId_PreservesId()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingFeatureId = Guid.NewGuid();

        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Id = existingFeatureId, Key = "Feature", Value = "Value" }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Features.First().Id.Should().Be(existingFeatureId);
    }

    [Fact]
    public async Task Handle_NewFeatureWithEmptyGuid_GeneratesNewId()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeatureDto>
            {
                new() { Id = Guid.Empty, Key = "Feature", Value = "Value" }
            }
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Features.First().Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Updated",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        existingPlan.UpdatedAt.Should().NotBeNull();
        existingPlan.UpdatedAt!.Value.Should().BeOnOrAfter(beforeTime);
        existingPlan.UpdatedAt.Value.Should().BeOnOrBefore(afterTime);
    }

    [Fact]
    public async Task Handle_DeactivatePlan_SetsIsActiveFalse()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var existingPlan = new Plan
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = true,
            Features = new List<PlanFeature>()
        };

        var command = new UpdatePlanCommand
        {
            Id = planId,
            Name = "Test",
            Code = "TEST",
            Type = PlanType.Pro,
            IsActive = false
        };

        _planRepositoryMock.Setup(x => x.GetByIdAsync(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPlan);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsActive.Should().BeFalse();
    }
}
