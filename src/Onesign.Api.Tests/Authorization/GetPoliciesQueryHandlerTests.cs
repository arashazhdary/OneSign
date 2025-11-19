using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Queries;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class GetPoliciesQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsAllPoliciesForTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<PolicyDefinition>
        {
            new PolicyDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Policy 1",
                Description = "Description 1",
                Effect = PolicyEffect.Allow,
                Priority = 1,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                ConditionGroups = new List<PolicyConditionGroup>()
            },
            new PolicyDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Policy 2",
                Description = "Description 2",
                Effect = PolicyEffect.Deny,
                Priority = 2,
                Enabled = false,
                CreatedAt = DateTime.UtcNow,
                ConditionGroups = new List<PolicyConditionGroup>()
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId,
            Enabled = null
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().Contain(p => p.Name == "Policy 1");
        result.Value.Should().Contain(p => p.Name == "Policy 2");
    }

    [Fact]
    public async Task Handle_FiltersByEnabledStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var enabledPolicies = new List<PolicyDefinition>
        {
            new PolicyDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Enabled Policy",
                Description = "Description",
                Effect = PolicyEffect.Allow,
                Priority = 1,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                ConditionGroups = new List<PolicyConditionGroup>()
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(enabledPolicies);

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId,
            Enabled = true
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Name.Should().Be("Enabled Policy");
        result.Value[0].Enabled.Should().BeTrue();

        policyRepository.Verify(x => x.GetByTenantIdAsync(tenantId, true, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_FiltersByDisabledStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var disabledPolicies = new List<PolicyDefinition>
        {
            new PolicyDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Disabled Policy",
                Description = "Description",
                Effect = PolicyEffect.Deny,
                Priority = 1,
                Enabled = false,
                CreatedAt = DateTime.UtcNow,
                ConditionGroups = new List<PolicyConditionGroup>()
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(disabledPolicies);

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId,
            Enabled = false
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Name.Should().Be("Disabled Policy");
        result.Value[0].Enabled.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyResult()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition>());

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_MapsAllPropertiesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-1);

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Description = "Test Description",
            Effect = PolicyEffect.Deny,
            Priority = 5,
            Enabled = true,
            CreatedAt = createdAt,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);

        var dto = result.Value[0];
        dto.Id.Should().Be(policyId);
        dto.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("Test Policy");
        dto.Description.Should().Be("Test Description");
        dto.Effect.Should().Be(PolicyEffect.Deny);
        dto.Priority.Should().Be(5);
        dto.Enabled.Should().BeTrue();
        dto.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_MapsConditionGroupsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var groupId = Guid.NewGuid();
        var conditionId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
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
                    LogicalOperator = ConditionLogicalOperator.And,
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = conditionId,
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Role",
                            Operator = ConditionOperator.Equals,
                            Value = "Admin"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value[0];
        dto.ConditionGroups.Should().HaveCount(1);

        var groupDto = dto.ConditionGroups[0];
        groupDto.Id.Should().Be(groupId);
        groupDto.LogicalOperator.Should().Be(ConditionLogicalOperator.And);
        groupDto.Conditions.Should().HaveCount(1);

        var conditionDto = groupDto.Conditions[0];
        conditionDto.Id.Should().Be(conditionId);
        conditionDto.SourceType.Should().Be(AttributeSourceType.UserRole);
        conditionDto.SourceKey.Should().Be("Role");
        conditionDto.Operator.Should().Be(ConditionOperator.Equals);
        conditionDto.Value.Should().Be("Admin");
    }

    [Fact]
    public async Task Handle_MultipleConditionGroups_MapsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
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
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Key1",
                            Operator = ConditionOperator.Equals,
                            Value = "Value1"
                        }
                    }
                },
                new PolicyConditionGroup
                {
                    Id = Guid.NewGuid(),
                    LogicalOperator = ConditionLogicalOperator.Or,
                    Conditions = new List<PolicyCondition>
                    {
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Key2",
                            Operator = ConditionOperator.Contains,
                            Value = "Value2"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value[0].ConditionGroups.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_MultipleConditionsInGroup_MapsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
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
                            SourceType = AttributeSourceType.UserClaim,
                            SourceKey = "Condition1",
                            Operator = ConditionOperator.Equals,
                            Value = "Value1"
                        },
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.UserRole,
                            SourceKey = "Condition2",
                            Operator = ConditionOperator.NotEquals,
                            Value = "Value2"
                        },
                        new PolicyCondition
                        {
                            Id = Guid.NewGuid(),
                            SourceType = AttributeSourceType.OrgUnit,
                            SourceKey = "Condition3",
                            Operator = ConditionOperator.In,
                            Value = "A, B, C"
                        }
                    }
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value[0].ConditionGroups[0].Conditions.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, cancellationToken))
            .ReturnsAsync(new List<PolicyDefinition>());

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        await handler.Handle(query, cancellationToken);

        // Assert
        policyRepository.Verify(x => x.GetByTenantIdAsync(tenantId, null, cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData(PolicyEffect.Allow)]
    [InlineData(PolicyEffect.Deny)]
    public async Task Handle_AllPolicyEffects_MapCorrectly(PolicyEffect effect)
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = $"Policy with {effect}",
            Description = "Description",
            Effect = effect,
            Priority = 1,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value[0].Effect.Should().Be(effect);
    }

    [Fact]
    public async Task Handle_EmptyConditionGroup_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Policy with Empty Group",
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
                }
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyDefinition> { policy });

        var handler = new GetPoliciesQueryHandler(policyRepository.Object);

        var query = new GetPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value[0].ConditionGroups[0].Conditions.Should().BeEmpty();
    }
}
