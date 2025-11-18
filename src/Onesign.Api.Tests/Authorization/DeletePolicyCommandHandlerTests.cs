using FluentAssertions;
using Moq;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class DeletePolicyCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_DeletesPolicy()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Test Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);
        policyRepository.Setup(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment>());

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        policyRepository.Verify(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PolicyNotFound_ReturnsFailure()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition?)null);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("not found");

        policyRepository.Verify(x => x.DeleteAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PolicyHasAssignments_ReturnsFailure()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Description = "Test Description",
            Effect = PolicyEffect.Allow,
            Priority = 1,
            Enabled = true
        };

        var assignments = new List<PolicyAssignment>
        {
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = policy.TenantId,
                PolicyDefinitionId = policyId,
                PolicyTargetId = Guid.NewGuid(),
                Order = 1
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignments);

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("Cannot delete policy");
        result.Error.Should().Contain("1 assignment");
        result.Error.Should().Contain("Remove assignments first");

        policyRepository.Verify(x => x.DeleteAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PolicyHasMultipleAssignments_ReturnsCorrectCount()
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
            Enabled = true
        };

        var assignments = new List<PolicyAssignment>
        {
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = policyId,
                PolicyTargetId = Guid.NewGuid(),
                Order = 1
            },
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = policyId,
                PolicyTargetId = Guid.NewGuid(),
                Order = 2
            },
            new PolicyAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyDefinitionId = policyId,
                PolicyTargetId = Guid.NewGuid(),
                Order = 3
            }
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignments);

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("3 assignment");
    }

    [Fact]
    public async Task Handle_ChecksAssignmentsBeforeDeleting()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);
        policyRepository.Setup(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment>());

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert - Verify the order of operations
        var sequence = new MockSequence();
        policyRepository.InSequence(sequence).Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()));
        assignmentRepository.InSequence(sequence).Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()));
        policyRepository.InSequence(sequence).Setup(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()));
    }

    [Fact]
    public async Task Handle_DisabledPolicyWithNoAssignments_DeletesSuccessfully()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Disabled Policy",
            Description = "Test",
            Effect = PolicyEffect.Deny,
            Priority = 1,
            Enabled = false
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);
        policyRepository.Setup(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PolicyAssignment>());

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        policyRepository.Verify(x => x.DeleteAsync(policyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = Guid.NewGuid(),
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var cancellationToken = new CancellationToken();

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, cancellationToken))
            .ReturnsAsync(policy);
        policyRepository.Setup(x => x.DeleteAsync(policyId, cancellationToken))
            .Returns(Task.CompletedTask);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.GetByPolicyIdAsync(policyId, cancellationToken))
            .ReturnsAsync(new List<PolicyAssignment>());

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = policyId
        };

        // Act
        await handler.Handle(command, cancellationToken);

        // Assert
        policyRepository.Verify(x => x.GetByIdAsync(policyId, cancellationToken), Times.Once);
        assignmentRepository.Verify(x => x.GetByPolicyIdAsync(policyId, cancellationToken), Times.Once);
        policyRepository.Verify(x => x.DeleteAsync(policyId, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyGuid_ReturnsNotFound()
    {
        // Arrange
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(Guid.Empty, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition?)null);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();

        var handler = new DeletePolicyCommandHandler(policyRepository.Object, assignmentRepository.Object);

        var command = new DeletePolicyCommand
        {
            Id = Guid.Empty
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("not found");
    }
}
