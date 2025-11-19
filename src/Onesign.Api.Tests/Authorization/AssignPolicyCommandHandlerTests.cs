using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Authorization;

public class AssignPolicyCommandHandlerTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task Handle_ValidRequest_AssignsPolicy()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "my-app",
            TargetName = "My Application",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);

        assignmentRepository.Verify(x => x.AddAsync(
            It.Is<PolicyAssignment>(a =>
                a.TenantId == tenantId &&
                a.PolicyDefinitionId == policyId &&
                a.Order == 1),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PolicyNotFound_ReturnsFailure()
    {
        // Arrange
        using var context = CreateContext();
        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyDefinition?)null);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyDefinitionId = Guid.NewGuid(),
            TargetType = PolicyTargetType.Application,
            TargetKey = "my-app",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("Policy not found");

        assignmentRepository.Verify(x => x.AddAsync(
            It.IsAny<PolicyAssignment>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PolicyBelongsToDifferentTenant_ReturnsFailure()
    {
        // Arrange
        using var context = CreateContext();
        var policyTenantId = Guid.NewGuid();
        var requestTenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = policyTenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = requestTenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "my-app",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("does not belong to this tenant");

        assignmentRepository.Verify(x => x.AddAsync(
            It.IsAny<PolicyAssignment>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NewTarget_CreatesTargetEntity()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "new-app",
            TargetName = "New Application",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var target = await context.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TargetKey == "new-app");
        target.Should().NotBeNull();
        target!.TenantId.Should().Be(tenantId);
        target.TargetType.Should().Be(PolicyTargetType.Application);
        target.TargetName.Should().Be("New Application");
    }

    [Fact]
    public async Task Handle_ExistingTarget_ReusesTargetEntity()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();
        var existingTargetId = Guid.NewGuid();

        // Create existing target
        var existingTarget = new PolicyTargetEntity
        {
            Id = existingTargetId,
            TenantId = tenantId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "existing-app",
            TargetName = "Existing App",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        context.Set<PolicyTargetEntity>().Add(existingTarget);
        await context.SaveChangesAsync();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "existing-app",
            TargetName = "Different Name",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify only one target exists
        var targets = await context.Set<PolicyTargetEntity>()
            .Where(x => x.TargetKey == "existing-app")
            .ToListAsync();
        targets.Should().HaveCount(1);
        targets[0].Id.Should().Be(existingTargetId);

        // Verify assignment uses existing target
        assignmentRepository.Verify(x => x.AddAsync(
            It.Is<PolicyAssignment>(a => a.PolicyTargetId == existingTargetId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(PolicyTargetType.Application)]
    [InlineData(PolicyTargetType.Scope)]
    [InlineData(PolicyTargetType.TenantFeature)]
    public async Task Handle_AllTargetTypes_CreateCorrectly(PolicyTargetType targetType)
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = targetType,
            TargetKey = $"target-{targetType}",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var target = await context.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TargetKey == $"target-{targetType}");
        target.Should().NotBeNull();
        target!.TargetType.Should().Be(targetType);
    }

    [Fact]
    public async Task Handle_SetsCorrectTimestamps()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var beforeCreate = DateTime.UtcNow;

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "timestamp-test",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        var afterCreate = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();

        var target = await context.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TargetKey == "timestamp-test");
        target!.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        target.CreatedAt.Should().BeOnOrBefore(afterCreate);

        assignmentRepository.Verify(x => x.AddAsync(
            It.Is<PolicyAssignment>(a =>
                a.CreatedAt >= beforeCreate &&
                a.CreatedAt <= afterCreate),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PreservesOrder()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "order-test",
            Order = 42
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        assignmentRepository.Verify(x => x.AddAsync(
            It.Is<PolicyAssignment>(a => a.Order == 42),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NullTargetName_CreatesTargetWithoutName()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "no-name-test",
            TargetName = null,
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var target = await context.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TargetKey == "no-name-test");
        target.Should().NotBeNull();
        target!.TargetName.Should().BeNull();
    }

    [Fact]
    public async Task Handle_GeneratesUniqueAssignmentId()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "unique-id-test",
            Order = 1
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);

        assignmentRepository.Verify(x => x.AddAsync(
            It.Is<PolicyAssignment>(a => a.Id != Guid.Empty),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        using var context = CreateContext();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        var policy = new PolicyDefinition
        {
            Id = policyId,
            TenantId = tenantId,
            Name = "Test Policy",
            Effect = PolicyEffect.Allow,
            Enabled = true
        };

        var policyRepository = new Mock<IPolicyDefinitionRepository>();
        policyRepository.Setup(x => x.GetByIdAsync(policyId, cancellationToken))
            .ReturnsAsync(policy);

        var assignmentRepository = new Mock<IPolicyAssignmentRepository>();
        assignmentRepository.Setup(x => x.AddAsync(It.IsAny<PolicyAssignment>(), cancellationToken))
            .ReturnsAsync((PolicyAssignment assignment, CancellationToken _) => assignment);

        var handler = new AssignPolicyCommandHandler(
            policyRepository.Object,
            assignmentRepository.Object,
            context);

        var command = new AssignPolicyCommand
        {
            TenantId = tenantId,
            PolicyDefinitionId = policyId,
            TargetType = PolicyTargetType.Application,
            TargetKey = "cancel-test",
            Order = 1
        };

        // Act
        await handler.Handle(command, cancellationToken);

        // Assert
        policyRepository.Verify(x => x.GetByIdAsync(policyId, cancellationToken), Times.Once);
        assignmentRepository.Verify(x => x.AddAsync(It.IsAny<PolicyAssignment>(), cancellationToken), Times.Once);
    }
}
