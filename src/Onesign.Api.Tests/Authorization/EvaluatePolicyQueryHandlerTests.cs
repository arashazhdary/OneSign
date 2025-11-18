using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Queries;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class EvaluatePolicyQueryHandlerTests
{
    [Fact]
    public async Task Handle_DelegatestoService_ReturnsResult()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var targetKey = "my-app";

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true,
            MatchedPolicies = new List<string> { "Policy1" },
            AllowedScopes = new List<string> { targetKey }
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            tenantId,
            userId,
            null,
            targetKey,
            PolicyTargetType.Application,
            null,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            ClientId = null,
            TargetKey = targetKey,
            TargetType = PolicyTargetType.Application,
            Context = null
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.IsAllowed.Should().BeTrue();
        result.Value.MatchedPolicies.Should().Contain("Policy1");
        result.Value.AllowedScopes.Should().Contain(targetKey);

        evaluationService.Verify(x => x.EvaluateAsync(
            tenantId,
            userId,
            null,
            targetKey,
            PolicyTargetType.Application,
            null,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithClientId_PassesToService()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            tenantId,
            userId,
            clientId,
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            ClientId = clientId,
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        evaluationService.Verify(x => x.EvaluateAsync(
            tenantId,
            userId,
            clientId,
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithContext_PassesToService()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var context = new Dictionary<string, object>
        {
            { "Key1", "Value1" },
            { "Key2", 42 }
        };

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            tenantId,
            userId,
            null,
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            context,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            TargetKey = "test",
            TargetType = PolicyTargetType.Application,
            Context = context
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        evaluationService.Verify(x => x.EvaluateAsync(
            tenantId,
            userId,
            null,
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            context,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DenyResult_ReturnsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var targetKey = "restricted-app";

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = false,
            MatchedPolicies = new List<string> { "Deny Policy" },
            DeniedScopes = new List<string> { targetKey },
            DenyReason = "Access denied by policy: Deny Policy"
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            TargetKey = targetKey,
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsAllowed.Should().BeFalse();
        result.Value.MatchedPolicies.Should().Contain("Deny Policy");
        result.Value.DeniedScopes.Should().Contain(targetKey);
        result.Value.DenyReason.Should().Contain("Deny Policy");
    }

    [Theory]
    [InlineData(PolicyTargetType.Application)]
    [InlineData(PolicyTargetType.Scope)]
    [InlineData(PolicyTargetType.TenantFeature)]
    public async Task Handle_AllTargetTypes_PassesToService(PolicyTargetType targetType)
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            targetType,
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = targetType
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        evaluationService.Verify(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            targetType,
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var cancellationToken = new CancellationToken();
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            cancellationToken))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        await handler.Handle(query, cancellationToken);

        // Assert
        evaluationService.Verify(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleMatchedPolicies_ReturnsAll()
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true,
            MatchedPolicies = new List<string>
            {
                "Policy1",
                "Policy2",
                "Policy3"
            },
            AllowedScopes = new List<string> { "scope1", "scope2" }
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.MatchedPolicies.Should().HaveCount(3);
        result.Value.AllowedScopes.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_NoMatchedPolicies_ReturnsEmptyList()
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true,
            MatchedPolicies = new List<string>(),
            AllowedScopes = new List<string>(),
            DeniedScopes = new List<string>()
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.MatchedPolicies.Should().BeEmpty();
        result.Value.AllowedScopes.Should().BeEmpty();
        result.Value.DeniedScopes.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_NullDenyReason_ReturnsNull()
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true,
            DenyReason = null
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.DenyReason.Should().BeNull();
    }

    [Fact]
    public async Task Handle_AllowedAndDeniedScopes_ReturnsBoth()
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = false,
            MatchedPolicies = new List<string> { "Policy1", "Policy2" },
            AllowedScopes = new List<string> { "scope1" },
            DeniedScopes = new List<string> { "scope2" },
            DenyReason = "Partial access denied"
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AllowedScopes.Should().HaveCount(1);
        result.Value.DeniedScopes.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_ComplexContext_PassesCorrectly()
    {
        // Arrange
        var context = new Dictionary<string, object>
        {
            { "StringValue", "test" },
            { "IntValue", 42 },
            { "BoolValue", true },
            { "DoubleValue", 3.14 },
            { "DateValue", DateTime.UtcNow },
            { "ListValue", new List<string> { "a", "b", "c" } }
        };

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.Is<Dictionary<string, object>>(c => c.Count == 6),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = "test",
            TargetType = PolicyTargetType.Application,
            Context = context
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        evaluationService.Verify(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            It.IsAny<string>(),
            It.IsAny<PolicyTargetType>(),
            It.Is<Dictionary<string, object>>(c => c.Count == 6),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyTargetKey_PassesToService()
    {
        // Arrange
        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            string.Empty,
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TargetKey = string.Empty,
            TargetType = PolicyTargetType.Application
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        evaluationService.Verify(x => x.EvaluateAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<Guid?>(),
            string.Empty,
            It.IsAny<PolicyTargetType>(),
            It.IsAny<Dictionary<string, object>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_FullParameters_PassesAllCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var targetKey = "full-test-app";
        var targetType = PolicyTargetType.TenantFeature;
        var context = new Dictionary<string, object>
        {
            { "TestKey", "TestValue" }
        };

        var evaluationResult = new PolicyEvaluationResult
        {
            IsAllowed = true,
            MatchedPolicies = new List<string> { "Test Policy" },
            AllowedScopes = new List<string> { targetKey }
        };

        var evaluationService = new Mock<IPolicyEvaluationService>();
        evaluationService.Setup(x => x.EvaluateAsync(
            tenantId,
            userId,
            clientId,
            targetKey,
            targetType,
            context,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(evaluationResult);

        var handler = new EvaluatePolicyQueryHandler(evaluationService.Object);

        var query = new EvaluatePolicyQuery
        {
            TenantId = tenantId,
            UserId = userId,
            ClientId = clientId,
            TargetKey = targetKey,
            TargetType = targetType,
            Context = context
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsAllowed.Should().BeTrue();
        result.Value.MatchedPolicies.Should().Contain("Test Policy");
        result.Value.AllowedScopes.Should().Contain(targetKey);

        evaluationService.Verify(x => x.EvaluateAsync(
            tenantId,
            userId,
            clientId,
            targetKey,
            targetType,
            context,
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
