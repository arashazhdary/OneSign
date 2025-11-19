using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Authorization.Application.Services;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Modules.Tenants.Domain.Entities;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class PolicyEvaluationServiceTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task EvaluateAsync_NoPoliciesAssigned_ReturnsAllowed()
    {
        // Arrange
        using var context = CreateContext();
        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment>());

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().BeEmpty();
        result.DenyReason.Should().BeNull();
    }

    [Fact]
    public async Task EvaluateAsync_AllowPolicyWithNoConditions_ReturnsAllowed()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Allow All",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Allow All");
        result.AllowedScopes.Should().Contain("test-target");
    }

    [Fact]
    public async Task EvaluateAsync_DenyPolicyWithNoConditions_ReturnsDenied()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Deny All",
            Effect = PolicyEffect.Deny,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.MatchedPolicies.Should().Contain("Deny All");
        result.DeniedScopes.Should().Contain("test-target");
        result.DenyReason.Should().Contain("Deny All");
    }

    [Fact]
    public async Task EvaluateAsync_DisabledPolicy_IsSkipped()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Disabled Deny",
            Effect = PolicyEffect.Deny,
            Enabled = false,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().BeEmpty();
    }

    [Fact]
    public async Task EvaluateAsync_NullPolicyDefinition_IsSkipped()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = Guid.NewGuid(),
            PolicyDefinition = null,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
    }

    [Fact]
    public async Task EvaluateAsync_DenyTakesPrecedence_StopsEvaluation()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var denyPolicy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Deny Policy",
            Effect = PolicyEffect.Deny,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var allowPolicy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Allow Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignments = new List<PolicyAssignment>
        {
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = denyPolicy.Id,
                PolicyDefinition = denyPolicy,
                Order = 1
            },
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = allowPolicy.Id,
                PolicyDefinition = allowPolicy,
                Order = 2
            }
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignments);

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.MatchedPolicies.Should().HaveCount(1);
        result.MatchedPolicies.Should().Contain("Deny Policy");
        result.MatchedPolicies.Should().NotContain("Allow Policy");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionEquals_MatchesValue()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.Equals,
            Value = "Engineering"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Engineering Only",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Department", "Engineering" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Engineering Only");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionEquals_CaseInsensitive()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.Equals,
            Value = "ENGINEERING"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Engineering Only",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Department", "engineering" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Engineering Only");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionNotEquals_MatchesValue()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.NotEquals,
            Value = "Sales"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Not Sales",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Department", "Engineering" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Not Sales");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionContains_MatchesSubstring()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Email",
            Operator = ConditionOperator.Contains,
            Value = "@company.com"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Company Email",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Email", "user@company.com" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Company Email");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionNotContains_MatchesWhenNotPresent()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Email",
            Operator = ConditionOperator.NotContains,
            Value = "@external.com"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Internal Users",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Email", "user@company.com" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Internal Users");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionIn_MatchesListValue()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserRole,
            SourceKey = "Role",
            Operator = ConditionOperator.In,
            Value = "Admin, Manager, Supervisor"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Management Only",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Role", "Manager" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Management Only");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionNotIn_MatchesWhenNotInList()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserRole,
            SourceKey = "Role",
            Operator = ConditionOperator.NotIn,
            Value = "Guest, Temporary"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Regular Users",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Role", "Employee" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Regular Users");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionGreaterThanOrEqual_MatchesNumericValue()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.RiskContext,
            SourceKey = "TrustScore",
            Operator = ConditionOperator.GreaterThanOrEqual,
            Value = "50"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "High Trust",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "TrustScore", "75" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("High Trust");
    }

    [Fact]
    public async Task EvaluateAsync_ConditionLessThanOrEqual_MatchesNumericValue()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.RiskContext,
            SourceKey = "RiskLevel",
            Operator = ConditionOperator.LessThanOrEqual,
            Value = "30"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Low Risk",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "RiskLevel", "20" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Low Risk");
    }

    [Fact]
    public async Task EvaluateAsync_MissingContextKey_ConditionFails()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "MissingKey",
            Operator = ConditionOperator.Equals,
            Value = "Value"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Missing Key Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object>());

        // Assert - Policy doesn't match because condition fails
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().NotContain("Missing Key Policy");
    }

    [Fact]
    public async Task EvaluateAsync_AndLogicalOperator_AllConditionsMustMatch()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition1 = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.Equals,
            Value = "Engineering"
        };

        var condition2 = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserRole,
            SourceKey = "Role",
            Operator = ConditionOperator.Equals,
            Value = "Senior"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition1, condition2 }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Senior Engineers",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act - Only one condition matches
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object>
            {
                { "Department", "Engineering" },
                { "Role", "Junior" }
            });

        // Assert - Policy doesn't match because not all conditions are met
        result.MatchedPolicies.Should().NotContain("Senior Engineers");
    }

    [Fact]
    public async Task EvaluateAsync_OrLogicalOperator_OneConditionSuffices()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition1 = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.Equals,
            Value = "Engineering"
        };

        var condition2 = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "Department",
            Operator = ConditionOperator.Equals,
            Value = "IT"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.Or,
            Conditions = new List<PolicyCondition> { condition1, condition2 }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Tech Teams",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "Department", "IT" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Tech Teams");
    }

    [Fact]
    public async Task EvaluateAsync_MultipleConditionGroups_OrBetweenGroups()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var group1 = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition>
            {
                new PolicyCondition
                {
                    Id = Guid.NewGuid(),
                    SourceType = AttributeSourceType.UserClaim,
                    SourceKey = "Department",
                    Operator = ConditionOperator.Equals,
                    Value = "Engineering"
                }
            }
        };

        var group2 = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition>
            {
                new PolicyCondition
                {
                    Id = Guid.NewGuid(),
                    SourceType = AttributeSourceType.UserRole,
                    SourceKey = "Role",
                    Operator = ConditionOperator.Equals,
                    Value = "Admin"
                }
            }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Engineering Or Admin",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { group1, group2 }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act - Only second group matches
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object>
            {
                { "Department", "Sales" },
                { "Role", "Admin" }
            });

        // Assert - Policy matches because one group matches
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Engineering Or Admin");
    }

    [Fact]
    public async Task EvaluateAsync_EmptyConditionGroup_MatchesAlways()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var emptyGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition>()
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Always Match",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { emptyGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Always Match");
    }

    [Fact]
    public async Task EvaluateAsync_ContextMerge_ProvidedContextOverridesBuiltIn()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "CustomField",
            Operator = ConditionOperator.Equals,
            Value = "CustomValue"
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Custom Context",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "CustomField", "CustomValue" } });

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Custom Context");
    }

    [Fact]
    public async Task EvaluateAsync_WithClientId_AddsToContext()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.Client,
            SourceKey = "ClientId",
            Operator = ConditionOperator.Equals,
            Value = clientId.ToString()
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Specific Client",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            clientId,
            "test-target",
            PolicyTargetType.Application);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Specific Client");
    }

    [Fact]
    public async Task EvaluateAsync_PolicyOrder_EvaluatesInOrder()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var allowPolicy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Allow First",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var denyPolicy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Deny Second",
            Effect = PolicyEffect.Deny,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignments = new List<PolicyAssignment>
        {
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = allowPolicy.Id,
                PolicyDefinition = allowPolicy,
                Order = 1
            },
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = denyPolicy.Id,
                PolicyDefinition = denyPolicy,
                Order = 2
            }
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignments);

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application);

        // Assert - Deny comes second but stops evaluation
        result.IsAllowed.Should().BeFalse();
        result.MatchedPolicies.Should().HaveCount(2);
    }

    [Theory]
    [InlineData(PolicyTargetType.Application)]
    [InlineData(PolicyTargetType.Scope)]
    [InlineData(PolicyTargetType.TenantFeature)]
    public async Task EvaluateAsync_AllTargetTypes_Work(PolicyTargetType targetType)
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = $"Policy for {targetType}",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup>()
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            targetType,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            targetType);

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain($"Policy for {targetType}");
    }

    [Fact]
    public async Task EvaluateAsync_NullContextValue_HandledGracefully()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var condition = new PolicyCondition
        {
            Id = Guid.NewGuid(),
            SourceType = AttributeSourceType.UserClaim,
            SourceKey = "NullField",
            Operator = ConditionOperator.Equals,
            Value = ""
        };

        var conditionGroup = new PolicyConditionGroup
        {
            Id = Guid.NewGuid(),
            LogicalOperator = ConditionLogicalOperator.And,
            Conditions = new List<PolicyCondition> { condition }
        };

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Null Check",
            Effect = PolicyEffect.Allow,
            Enabled = true,
            ConditionGroups = new List<PolicyConditionGroup> { conditionGroup }
        };

        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyDefinitionId = policy.Id,
            PolicyDefinition = policy,
            Order = 1
        };

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByTargetAsync(
            tenantId,
            "test-target",
            PolicyTargetType.Application,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        var service = new PolicyEvaluationService(assignmentRepository.Object, context);

        // Act
        var result = await service.EvaluateAsync(
            tenantId,
            userId,
            null,
            "test-target",
            PolicyTargetType.Application,
            new Dictionary<string, object> { { "NullField", null! } });

        // Assert - null value converted to empty string matches empty expected
        result.IsAllowed.Should().BeTrue();
        result.MatchedPolicies.Should().Contain("Null Check");
    }
}
