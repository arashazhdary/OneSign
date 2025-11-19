using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class CreatePolicyCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_CreatesPolicy()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Test Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroupDto>()
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Test Policy");
        result.Value.Description.Should().Be("Test Description");
        result.Value.Effect.Should().Be(PolicyEffect.Allow);
        result.Value.Priority.Should().Be(1);
        result.Value.Enabled.Should().BeTrue();
        result.Value.Id.Should().NotBe(Guid.Empty);

        policyRepository.Verify(x => x.AddAsync(
            It.Is<PolicyDefinition>(p => p.Name == "Test Policy"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyName_ReturnsFailure()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Description = "Test Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("name is required");

        policyRepository.Verify(x => x.AddAsync(
            It.IsAny<PolicyDefinition>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhitespaceName_ReturnsFailure()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "   ",
            Description = "Test Description",
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
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "  Test Policy  ",
            Description = "  Test Description  ",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Test Policy");
        result.Value.Description.Should().Be("Test Description");
    }

    [Fact]
    public async Task Handle_WithConditionGroups_CreatesCorrectly()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Complex Policy",
            Description = "Policy with conditions",
            Effect = PolicyEffect.Deny,
            Priority = 10,
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
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Role",
                            Operator = ConditionOperator.Equals,
                            Value = "Admin"
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
        result.Value.ConditionGroups[0].LogicalOperator.Should().Be(ConditionLogicalOperator.And);
        result.Value.ConditionGroups[0].Conditions.Should().HaveCount(1);
        result.Value.ConditionGroups[0].Conditions[0].SourceKey.Should().Be("Role");
        result.Value.ConditionGroups[0].Conditions[0].Value.Should().Be("Admin");
    }

    [Fact]
    public async Task Handle_MultipleConditionGroups_CreatesAll()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Multi Group Policy",
            Description = "Policy with multiple groups",
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
                            SourceKey = "Department",
                            Operator = ConditionOperator.Equals,
                            Value = "Engineering"
                        }
                    }
                },
                new PolicyConditionGroupDto
                {
                    LogicalOperator = ConditionLogicalOperator.Or,
                    Conditions = new List<PolicyConditionDto>
                    {
                        new PolicyConditionDto
                        {
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Role",
                            Operator = ConditionOperator.In,
                            Value = "Admin, Manager"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtTimestamp()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var beforeCreate = DateTime.UtcNow;

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Timestamp Test",
            Description = "Test",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        var afterCreate = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        result.Value.CreatedAt.Should().BeOnOrBefore(afterCreate);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueIds()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "ID Test",
            Description = "Test",
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
                            SourceKey = "Test",
                            Operator = ConditionOperator.Equals,
                            Value = "Test"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().NotBe(Guid.Empty);
        result.Value.ConditionGroups[0].Id.Should().NotBe(Guid.Empty);
        result.Value.ConditionGroups[0].Conditions[0].Id.Should().NotBe(Guid.Empty);
    }

    [Theory]
    [InlineData(PolicyEffect.Allow)]
    [InlineData(PolicyEffect.Deny)]
    public async Task Handle_AllPolicyEffects_CreateCorrectly(PolicyEffect effect)
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = $"Policy with {effect}",
            Description = "Test",
            Effect = effect,
            Priority = 1,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Effect.Should().Be(effect);
    }

    [Fact]
    public async Task Handle_DisabledPolicy_CreatesCorrectly()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Disabled Policy",
            Description = "Test",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = false
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Enabled.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ConditionValuesAreTrimmed()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Trim Test",
            Description = "Test",
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

    [Fact]
    public async Task Handle_PreservesTenantId()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);
        var tenantId = Guid.NewGuid();

        var command = new CreatePolicyCommand
        {
            TenantId = tenantId,
            Name = "Tenant Test",
            Description = "Test",
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

    [Theory]
    [InlineData(AttributeSourceType.UserRole)]
    [InlineData(AttributeSourceType.UserClaim)]
    [InlineData(AttributeSourceType.OrgUnit)]
    [InlineData(AttributeSourceType.RiskContext)]
    [InlineData(AttributeSourceType.Client)]
    [InlineData(AttributeSourceType.Tenant)]
    public async Task Handle_AllSourceTypes_CreateCorrectly(AttributeSourceType sourceType)
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = $"Policy with {sourceType}",
            Description = "Test",
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
                            SourceType = sourceType,
                            SourceKey = "Test",
                            Operator = ConditionOperator.Equals,
                            Value = "Test"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Conditions[0].SourceType.Should().Be(sourceType);
    }

    [Theory]
    [InlineData(ConditionOperator.Equals)]
    [InlineData(ConditionOperator.NotEquals)]
    [InlineData(ConditionOperator.In)]
    [InlineData(ConditionOperator.NotIn)]
    [InlineData(ConditionOperator.GreaterThanOrEqual)]
    [InlineData(ConditionOperator.LessThanOrEqual)]
    [InlineData(ConditionOperator.Contains)]
    [InlineData(ConditionOperator.NotContains)]
    public async Task Handle_AllOperators_CreateCorrectly(ConditionOperator operatorType)
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.AddAsync(It.IsAny<PolicyDefinition>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition policy, CancellationToken _) => policy);

        var handler = new CreatePolicyCommandHandler(policyRepository.Object);

        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = $"Policy with {operatorType}",
            Description = "Test",
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
                            SourceKey = "Test",
                            Operator = operatorType,
                            Value = "Test"
                        }
                    }
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Conditions[0].Operator.Should().Be(operatorType);
    }
}
