using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class UpdatePolicyCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_UpdatesPolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Old Name",
            Description = "Old Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "New Name",
            Description = "New Description",
            Effect = PolicyEffect.Deny,
            Priority = 10,
            Enabled = false,
            ConditionGroups = new List<PolicyConditionGroupDto>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("New Name");
        result.Value.Description.Should().Be("New Description");
        result.Value.Effect.Should().Be(PolicyEffect.Deny);
        result.Value.Priority.Should().Be(10);
        result.Value.Enabled.Should().BeFalse();

        policyRepository.Verify(x => x.UpdateAsync(
            It.Is<PolicyDefinition>(p => p.Name == "New Name"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PolicyNotFound_ReturnsFailure()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition?)null);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = Guid.NewGuid(),
            Name = "New Name",
            Description = "New Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("not found");

        policyRepository.Verify(x => x.UpdateAsync(
            It.IsAny<PolicyDefinition>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_EmptyName_ReturnsFailure()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "",
            Description = "New Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("name is required");

        policyRepository.Verify(x => x.UpdateAsync(
            It.IsAny<PolicyDefinition>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhitespaceName_ReturnsFailure()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "   ",
            Description = "New Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("name is required");
    }

    [Fact]
    public async Task Handle_TrimsNameAndDescription()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "  Trimmed Name  ",
            Description = "  Trimmed Description  ",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Trimmed Name");
        result.Value.Description.Should().Be("Trimmed Description");
    }

    [Fact]
    public async Task Handle_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var originalCreatedAt = DateTime.UtcNow.AddDays(-1);
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = originalCreatedAt,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var beforeUpdate = DateTime.UtcNow;

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        var afterUpdate = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CreatedAt.Should().Be(originalCreatedAt);

        policyRepository.Verify(x => x.UpdateAsync(
            It.Is<PolicyDefinition>(p =>
                p.UpdatedAt.HasValue &&
                p.UpdatedAt.Value >= beforeUpdate &&
                p.UpdatedAt.Value <= afterUpdate),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PreservesTenantId()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public async Task Handle_UpdateConditionGroups_ReplacesAll()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>
            {
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "OldKey",
                            Operator = ConditionOperator.Equals,
                            Value = "OldValue"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>
            {
                new PolicyConditionGroupDto
                {
                    LogicalOperator = ConditionLogicalOperator.Or,
                    Conditions = new List<PolicyConditionDto>
                    {
                        new PolicyConditionDto
                        {
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "NewKey",
                            Operator = ConditionOperator.Contains,
                            Value = "NewValue"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups.Should().HaveCount(1);
        result.Value.ConditionGroups[0].LogicalOperator.Should().Be(ConditionLogicalOperator.Or);
        result.Value.ConditionGroups[0].Conditions[0].SourceKey.Should().Be("NewKey");
        result.Value.ConditionGroups[0].Conditions[0].Value.Should().Be("NewValue");
    }

    [Fact]
    public async Task Handle_ExistingGroupIdPreserved_UsesProvidedId()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingGroupId = Guid.NewGuid();
        var existingConditionId = Guid.NewGuid();

        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>
            {
                new PolicyConditionGroupDto
                {
                    Id = existingGroupId,
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyConditionDto>
                    {
                        new PolicyConditionDto
                        {
                            Id = existingConditionId,
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Key",
                            Operator = ConditionOperator.Equals,
                            Value = "Value"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Id.Should().Be(existingGroupId);
        result.Value.ConditionGroups[0].Conditions[0].Id.Should().Be(existingConditionId);
    }

    [Fact]
    public async Task Handle_EmptyGroupId_GeneratesNewId()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>
            {
                new PolicyConditionGroupDto
                {
                    Id = Guid.Empty,
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyConditionDto>
                    {
                        new PolicyConditionDto
                        {
                            Id = Guid.Empty,
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Key",
                            Operator = ConditionOperator.Equals,
                            Value = "Value"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Id.Should().NotBe(Guid.Empty);
        result.Value.ConditionGroups[0].Conditions[0].Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_ConditionValuesAreTrimmed()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>
            {
                new PolicyConditionGroupDto
                {
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyConditionDto>
                    {
                        new PolicyConditionDto
                        {
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "  Key  ",
                            Operator = ConditionOperator.Equals,
                            Value = "  Value  "
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Conditions[0].SourceKey.Should().Be("Key");
        result.Value.ConditionGroups[0].Conditions[0].Value.Should().Be("Value");
    }

    [Theory]
    [InlineData(PolicyEffect.Allow)]
    [InlineData(PolicyEffect.Deny)]
    public async Task Handle_UpdateEffect_ChangesCorrectly(PolicyEffect newEffect)
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = newEffect == PolicyEffect.Allow ? PolicyEffect.Deny : PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = newEffect,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Effect.Should().Be(newEffect);
    }

    [Fact]
    public async Task Handle_ClearConditionGroups_RemovesAll()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>
            {
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Key",
                            Operator = ConditionOperator.Equals,
                            Value = "Value"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>() // Empty list
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_SetsPolicyDefinitionIdOnConditionGroups()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Existing Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);
        policyRepository.Setup(x => x.UpdateAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdatePolicyCommandHandler(policyRepository.Object);

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            Name = "Updated Name",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>
            {
                new PolicyConditionGroupDto
                {
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyConditionDto>()
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        policyRepository.Verify(x => x.UpdateAsync(
            It.Is<PolicyDefinition>(p =>
                p.ConditionGroups.All(g => g.PolicyDefinitionId == policyId)),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
