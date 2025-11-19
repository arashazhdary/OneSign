using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Queries;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class GetPolicyByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ExistingPolicy_ReturnsPolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Description = "Test Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(policyId);
        result.Value.Name.Should().Be("Test Policy");
    }

    [Fact]
    public async Task Handle_PolicyNotFound_ReturnsFailure()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition?)null);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task Handle_MapsAllPropertiesCorrectly()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-1);

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Complete Policy",
            Description = "Complete Description",
            Effect = PolicyEffect.Deny,
            Priority = 10,
            Enabled = false,
            CreatedAt = createdAt,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value!;
        dto.Id.Should().Be(policyId);
        dto.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("Complete Policy");
        dto.Description.Should().Be("Complete Description");
        dto.Effect.Should().Be(PolicyEffect.Deny);
        dto.Priority.Should().Be(10);
        dto.Enabled.Should().BeFalse();
        dto.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_MapsConditionGroupsCorrectly()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var groupId = Guid.NewGuid();
        var conditionId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Policy with Conditions",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>
            {
                new PolicyConditionGroup
                {
                    Id = groupId,
                    LogicalOperator = ConditionLogicalOperator.Or,
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = conditionId,
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Email",
                            Operator = ConditionOperator.Contains,
                            Value = "@company.com"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value!;
        dto.ConditionGroups.Should().HaveCount(1);

        var groupDto = dto.ConditionGroups[0];
        groupDto.Id.Should().Be(groupId);
        groupDto.LogicalOperator.Should().Be(ConditionLogicalOperator.Or);
        groupDto.Conditions.Should().HaveCount(1);

        var conditionDto = groupDto.Conditions[0];
        conditionDto.Id.Should().Be(conditionId);
        conditionDto.SourceType.Should().Be(AttributeSourceType.UserClaim);
        conditionDto.SourceKey.Should().Be("Email");
        conditionDto.Operator.Should().Be(ConditionOperator.Contains);
        conditionDto.Value.Should().Be("@company.com");
    }

    [Fact]
    public async Task Handle_MultipleConditionGroups_MapsAll()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Multi Group Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>
            {
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyCondition>()
                },
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.Or,
                    Conditions = new List<PolicyCondition>()
                },
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyCondition>()
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_MultipleConditionsInGroup_MapsAll()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Multi Condition Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
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
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Key1",
                            Operator = ConditionOperator.Equals,
                            Value = "Value1"
                        },
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Key2",
                            Operator = ConditionOperator.NotEquals,
                            Value = "Value2"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Conditions.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, cancellationToken))
            .ReturnsAsync((PolicyDefinition?)null);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        await handler.Handle(query, cancellationToken);

        // Assert
        policyRepository.Verify(x => x.GetByIdAsync(policyId, cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData(PolicyEffect.Allow)]
    [InlineData(PolicyEffect.Deny)]
    public async Task Handle_AllPolicyEffects_MapCorrectly(PolicyEffect effect)
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = $"Policy with {effect}",
            Description = "Description",
            Effect = effect,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Effect.Should().Be(effect);
    }

    [Theory]
    [InlineData(ConditionLogicalOperator.And)]
    [InlineData(ConditionLogicalOperator.Or)]
    public async Task Handle_AllLogicalOperators_MapCorrectly(ConditionLogicalOperator logicalOperator)
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>
            {
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = logicalOperator,
                    Conditions = new List<PolicyCondition>()
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].LogicalOperator.Should().Be(logicalOperator);
    }

    [Theory]
    [InlineData(AttributeSourceType.UserRole)]
    [InlineData(AttributeSourceType.UserClaim)]
    [InlineData(AttributeSourceType.OrgUnit)]
    [InlineData(AttributeSourceType.RiskContext)]
    [InlineData(AttributeSourceType.Client)]
    [InlineData(AttributeSourceType.Tenant)]
    public async Task Handle_AllSourceTypes_MapCorrectly(AttributeSourceType sourceType)
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
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
                            SourceType = sourceType,
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
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

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
    public async Task Handle_AllOperators_MapCorrectly(ConditionOperator operatorType)
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
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
                            Operator = operatorType,
                            Value = "Value"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups[0].Conditions[0].Operator.Should().Be(operatorType);
    }

    [Fact]
    public async Task Handle_EmptyConditionGroups_ReturnsEmptyList()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "No Conditions Policy",
            Description = "Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var handler = new GetPolicyByIdQueryHandler(policyRepository.Object);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ConditionGroups.Should().BeEmpty();
    }
}
