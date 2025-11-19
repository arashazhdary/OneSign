using Xunit;
using Moq;
using FluentAssertions;
using MediatR;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;

namespace Onesign.Api.Tests.Authorization;

#region CreatePolicyCommandHandler Tests

public class CreatePolicyCommandHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly CreatePolicyCommandHandler _handler;

    public CreatePolicyCommandHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _handler = new CreatePolicyCommandHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreatePolicy()
    {
        // Arrange
        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Test Description",
            Effect = (int)PolicyEffect.Allow,
            Resources = new List<string> { "users:*" },
            Actions = new List<string> { "read", "write" },
            Conditions = new Dictionary<string, string> { { "role", "admin" } }
        };

        Policy? capturedPolicy = null;
        _policyRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Policy>(), It.IsAny<CancellationToken>()))
            .Callback<Policy, CancellationToken>((p, _) => capturedPolicy = p)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(command.Name);
        result.Description.Should().Be(command.Description);
        result.Effect.Should().Be(command.Effect);

        capturedPolicy.Should().NotBeNull();
        capturedPolicy!.TenantId.Should().Be(command.TenantId);
        _policyRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Policy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDenyEffect_ShouldCreateDenyPolicy()
    {
        // Arrange
        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Deny Policy",
            Effect = (int)PolicyEffect.Deny,
            Resources = new List<string> { "sensitive:*" },
            Actions = new List<string> { "delete" }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Effect.Should().Be((int)PolicyEffect.Deny);
    }

    [Fact]
    public async Task Handle_WithEmptyConditions_ShouldCreatePolicyWithoutConditions()
    {
        // Arrange
        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Simple Policy",
            Effect = (int)PolicyEffect.Allow,
            Resources = new List<string> { "*" },
            Actions = new List<string> { "*" },
            Conditions = new Dictionary<string, string>()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WithMultipleResources_ShouldCreatePolicyWithAllResources()
    {
        // Arrange
        var command = new CreatePolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Multi Resource Policy",
            Effect = (int)PolicyEffect.Allow,
            Resources = new List<string> { "users:*", "groups:*", "roles:*" },
            Actions = new List<string> { "read" }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Multi Resource Policy");
    }
}

#endregion

#region UpdatePolicyCommandHandler Tests

public class UpdatePolicyCommandHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly UpdatePolicyCommandHandler _handler;

    public UpdatePolicyCommandHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _handler = new UpdatePolicyCommandHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingPolicy_ShouldUpdatePolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var existingPolicy = new Policy(
            policyId, tenantId, "Old Name", "Old Description",
            PolicyEffect.Allow,
            new List<string> { "old:*" },
            new List<string> { "read" },
            new Dictionary<string, string>());

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "New Name",
            Description = "New Description",
            Effect = (int)PolicyEffect.Deny,
            Resources = new List<string> { "new:*" },
            Actions = new List<string> { "write" },
            Conditions = new Dictionary<string, string> { { "env", "prod" } }
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Name");
        result.Description.Should().Be("New Description");
        _policyRepositoryMock.Verify(r => r.UpdateAsync(existingPolicy, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentPolicy_ShouldThrowException()
    {
        // Arrange
        var command = new UpdatePolicyCommand
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Test"
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Policy?)null);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*not found*");
    }

    [Fact]
    public async Task Handle_WithDifferentTenant_ShouldThrowException()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var existingPolicy = new Policy(
            policyId, Guid.NewGuid(), "Name", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        var command = new UpdatePolicyCommand
        {
            Id = policyId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "New Name"
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}

#endregion

#region DeletePolicyCommandHandler Tests

public class DeletePolicyCommandHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly DeletePolicyCommandHandler _handler;

    public DeletePolicyCommandHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _handler = new DeletePolicyCommandHandler(_policyRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingPolicy_ShouldDeletePolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var existingPolicy = new Policy(
            policyId, tenantId, "Name", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        var command = new DeletePolicyCommand
        {
            Id = policyId,
            TenantId = tenantId
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _policyRepositoryMock.Verify(r => r.DeleteAsync(policyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentPolicy_ShouldThrowException()
    {
        // Arrange
        var command = new DeletePolicyCommand
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Policy?)null);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*not found*");
    }
}

#endregion

#region AssignPolicyCommandHandler Tests

public class AssignPolicyCommandHandlerTests
{
    private readonly Mock<IPolicyRepository> _policyRepositoryMock;
    private readonly Mock<IPolicyAssignmentRepository> _assignmentRepositoryMock;
    private readonly AssignPolicyCommandHandler _handler;

    public AssignPolicyCommandHandlerTests()
    {
        _policyRepositoryMock = new Mock<IPolicyRepository>();
        _assignmentRepositoryMock = new Mock<IPolicyAssignmentRepository>();
        _handler = new AssignPolicyCommandHandler(_policyRepositoryMock.Object, _assignmentRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidPolicyAndUser_ShouldCreateAssignment()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Name", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        var command = new AssignPolicyCommand
        {
            PolicyId = policyId,
            TenantId = tenantId,
            PrincipalType = (int)PrincipalType.User,
            PrincipalId = userId
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _assignmentRepositoryMock
            .Setup(r => r.ExistsAsync(policyId, (PrincipalType)command.PrincipalType, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _assignmentRepositoryMock.Verify(r => r.AddAsync(
            It.Is<PolicyAssignment>(a =>
                a.PolicyId == policyId &&
                a.PrincipalId == userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithExistingAssignment_ShouldThrowException()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Name", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        var command = new AssignPolicyCommand
        {
            PolicyId = policyId,
            TenantId = tenantId,
            PrincipalType = (int)PrincipalType.User,
            PrincipalId = userId
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _assignmentRepositoryMock
            .Setup(r => r.ExistsAsync(policyId, (PrincipalType)command.PrincipalType, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*already assigned*");
    }

    [Fact]
    public async Task Handle_WithGroupPrincipal_ShouldCreateGroupAssignment()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var groupId = Guid.NewGuid();

        var policy = new Policy(
            policyId, tenantId, "Name", "Desc",
            PolicyEffect.Allow, new List<string>(), new List<string>(), new Dictionary<string, string>());

        var command = new AssignPolicyCommand
        {
            PolicyId = policyId,
            TenantId = tenantId,
            PrincipalType = (int)PrincipalType.Group,
            PrincipalId = groupId
        };

        _policyRepositoryMock
            .Setup(r => r.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _assignmentRepositoryMock
            .Setup(r => r.ExistsAsync(policyId, PrincipalType.Group, groupId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _assignmentRepositoryMock.Verify(r => r.AddAsync(
            It.Is<PolicyAssignment>(a => a.PrincipalType == PrincipalType.Group),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

#endregion
