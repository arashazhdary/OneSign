using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Authorization.Application.Queries;
using Onesign.Modules.Authorization.Application.Services;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;

namespace Onesign.Api.Tests.Authorization;

#region GetPoliciesQueryHandler Tests

public class GetPoliciesQueryHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly GetPoliciesQueryHandler _handler;

    public GetPoliciesQueryHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _handler = new GetPoliciesQueryHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingPolicies_ShouldReturnAllPolicies()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<Policy>
        {
            new Policy(Guid.NewGuid(), tenantId, "Policy 1", "Desc 1", PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>()),
            new Policy(Guid.NewGuid(), tenantId, "Policy 2", "Desc 2", PolicyEffect.Deny, new List<string>(), new List<string>(), new Dictionary<string, string>())
        };

        _policyRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetPoliciesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.First().Name.Should().Be("Policy 1");
    }

    [Fact]
    public async Task Handle_WithNoPolicies_ShouldReturnEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _policyRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Policy>());

        var query = new GetPoliciesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldMapAllPolicyFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();
        var policy = new Policy(
            policyId, tenantId, "Full Policy", "Full Description",
            PolicyEffect.Deny,
            new List<string> { "res:*" },
            new List<string> { "act:*" },
            new Dictionary<string, string> { { "key", "value" } });

        _policyRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Policy> { policy });

        var query = new GetPoliciesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.First();
        dto.Id.Should().Be(policyId);
        dto.Name.Should().Be("Full Policy");
        dto.Description.Should().Be("Full Description");
        dto.Effect.Should().Be((int)PolicyEffect.Deny);
    }
}

#endregion

#region GetPolicyByIdQueryHandler Tests

public class GetPolicyByIdQueryHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly GetPolicyByIdQueryHandler _handler;

    public GetPolicyByIdQueryHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _handler = new GetPolicyByIdQueryHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingPolicy_ShouldReturnPolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var policy = new Policy(
            policyId, tenantId, "Test Policy", "Description",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var query = new GetPolicyByIdQuery { Id = policyId, TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(policyId);
        result.Name.Should().Be("Test Policy");
    }

    [Fact]
    public async Task Handle_WithNonExistentPolicy_ShouldReturnNull()
    {
        // Arrange
        var query = new GetPolicyByIdQuery
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(query.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Policy?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithDifferentTenant_ShouldReturnNull()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new Policy(
            policyId, Guid.NewGuid(), "Test", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var query = new GetPolicyByIdQuery
        {
            Id = policyId,
            TenantId = Guid.NewGuid() // Different tenant
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}

#endregion

#region EvaluatePolicyQueryHandler Tests

public class EvaluatePolicyQueryHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly Mock<IPolicyAssignmentRepository> _assignmentRepositoryMock;
    private readonly PolicyEvaluationService _evaluationService;
    private readonly EvaluatePolicyQueryHandler _handler;

    public EvaluatePolicyQueryHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _assignmentRepositoryMock = new Mock<IPolicyAssignmentRepository>();
        _evaluationService = new PolicyEvaluationService(_policyRepositoryMock.Object, _assignmentRepositoryMock.Object);
        _handler = new EvaluatePolicyQueryHandler(_evaluationService);
    }

    [Fact]
    public async Task Handle_WithAllowPolicy_ShouldReturnAllow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Allow All", "Desc",
            PolicyEffect.Allow,
            new List<string> { "*" },
            new List<string> { "*" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            Resource = "users:123",
            Action = "read"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsAllowed.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithDenyPolicy_ShouldReturnDeny()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Deny All", "Desc",
            PolicyEffect.Deny,
            new List<string> { "*" },
            new List<string> { "*" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            Resource = "users:123",
            Action = "read"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsAllowed.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithNoAssignments_ShouldReturnDeny()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment>());

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            Resource = "users:123",
            Action = "read"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsAllowed.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithResourceMismatch_ShouldReturnDeny()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Specific Resource", "Desc",
            PolicyEffect.Allow,
            new List<string> { "users:*" },
            new List<string> { "*" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            Resource = "groups:123", // Different resource
            Action = "read"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsAllowed.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithMultiplePolicies_DenyShouldTakePrecedence()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var allowPolicyId = Guid.NewGuid();
        var denyPolicyId = Guid.NewGuid();

        var allowPolicy = new Policy(
            allowPolicyId, tenantId, "Allow", "Desc",
            PolicyEffect.Allow,
            new List<string> { "*" },
            new List<string> { "*" },
            new Dictionary<string, string>());

        var denyPolicy = new Policy(
            denyPolicyId, tenantId, "Deny", "Desc",
            PolicyEffect.Deny,
            new List<string> { "*" },
            new List<string> { "*" },
            new Dictionary<string, string>());

        var assignments = new List<PolicyAssignment>
        {
            new PolicyAssignment(Guid.NewGuid(), allowPolicyId, tenantId, PrincipalType.User, userId),
            new PolicyAssignment(Guid.NewGuid(), denyPolicyId, tenantId, PrincipalType.User, userId)
        };

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignments);

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(allowPolicyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(allowPolicy);

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(denyPolicyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(denyPolicy);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            Resource = "users:123",
            Action = "read"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsAllowed.Should().BeFalse(); // Deny takes precedence
    }
}

#endregion

#region PolicyEvaluationService Tests

public class PolicyEvaluationServiceTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly Mock<IPolicyAssignmentRepository> _assignmentRepositoryMock;
    private readonly PolicyEvaluationService _service;

    public PolicyEvaluationServiceTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _assignmentRepositoryMock = new Mock<IPolicyAssignmentRepository>();
        _service = new PolicyEvaluationService(_policyRepositoryMock.Object, _assignmentRepositoryMock.Object);
    }

    [Fact]
    public async Task EvaluateAsync_WithWildcardResource_ShouldMatch()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Wildcard", "Desc",
            PolicyEffect.Allow,
            new List<string> { "users:*" },
            new List<string> { "read" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.EvaluateAsync(tenantId, userId, "users:123", "read", CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task EvaluateAsync_WithSpecificResource_ShouldMatchExactly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Specific", "Desc",
            PolicyEffect.Allow,
            new List<string> { "users:123" },
            new List<string> { "read" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.EvaluateAsync(tenantId, userId, "users:123", "read", CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task EvaluateAsync_WithWrongAction_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Read Only", "Desc",
            PolicyEffect.Allow,
            new List<string> { "*" },
            new List<string> { "read" },
            new Dictionary<string, string>());

        var assignment = new PolicyAssignment(Guid.NewGuid(), policyId, tenantId, PrincipalType.User, userId);

        _assignmentRepositoryMock
            .Setup(r => r.GetByPrincipalAsync(tenantId, PrincipalType.User, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment> { assignment });

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.EvaluateAsync(tenantId, userId, "users:123", "write", CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }
}

#endregion
