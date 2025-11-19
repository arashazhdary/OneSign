using FluentAssertions;
using Moq;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.ChangeManagement;

public class ChangeManagementModuleTests
{
    #region ChangeSet Entity Tests

    [Fact]
    public void ChangeSet_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var changeSet = new ChangeSet();

        // Assert
        changeSet.Id.Should().Be(Guid.Empty);
        changeSet.ScopeType.Should().BeEmpty();
        changeSet.Title.Should().BeEmpty();
        changeSet.Description.Should().BeNull();
        changeSet.Items.Should().NotBeNull().And.BeEmpty();
        changeSet.Approvals.Should().NotBeNull().And.BeEmpty();
        changeSet.ExecutionLogs.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void ChangeSet_WithAllPropertiesSet_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var requestedByUserId = Guid.NewGuid();
        var approvedByUserId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;
        var updatedAt = DateTimeOffset.UtcNow.AddHours(1);
        var approvedAt = DateTimeOffset.UtcNow.AddHours(2);
        var scheduledFor = DateTimeOffset.UtcNow.AddDays(1);
        var appliedAt = DateTimeOffset.UtcNow.AddDays(2);
        var rolledBackAt = DateTimeOffset.UtcNow.AddDays(3);

        // Act
        var changeSet = new ChangeSet
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = scopeId,
            Title = "Security Configuration Update",
            Description = "Update MFA requirements",
            Category = ChangeCategory.TenantSecuritySettings,
            Status = ChangeSetStatus.Approved,
            RequestedByUserId = requestedByUserId,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            ApprovedByUserId = approvedByUserId,
            ApprovedAt = approvedAt,
            ScheduledFor = scheduledFor,
            AppliedAt = appliedAt,
            RolledBackAt = rolledBackAt,
            RollbackReason = "Performance issues",
            SimulationSummaryJson = "{\"impact\":\"low\"}"
        };

        // Assert
        changeSet.Id.Should().Be(id);
        changeSet.ScopeType.Should().Be("Tenant");
        changeSet.ScopeId.Should().Be(scopeId);
        changeSet.Title.Should().Be("Security Configuration Update");
        changeSet.Description.Should().Be("Update MFA requirements");
        changeSet.Category.Should().Be(ChangeCategory.TenantSecuritySettings);
        changeSet.Status.Should().Be(ChangeSetStatus.Approved);
        changeSet.RequestedByUserId.Should().Be(requestedByUserId);
        changeSet.CreatedAt.Should().Be(createdAt);
        changeSet.UpdatedAt.Should().Be(updatedAt);
        changeSet.ApprovedByUserId.Should().Be(approvedByUserId);
        changeSet.ApprovedAt.Should().Be(approvedAt);
        changeSet.ScheduledFor.Should().Be(scheduledFor);
        changeSet.AppliedAt.Should().Be(appliedAt);
        changeSet.RolledBackAt.Should().Be(rolledBackAt);
        changeSet.RollbackReason.Should().Be("Performance issues");
        changeSet.SimulationSummaryJson.Should().Be("{\"impact\":\"low\"}");
    }

    [Fact]
    public void ChangeSet_AddItems_ShouldAddToCollection()
    {
        // Arrange
        var changeSet = new ChangeSet();
        var item1 = new ChangeItem { Id = Guid.NewGuid(), Order = 1 };
        var item2 = new ChangeItem { Id = Guid.NewGuid(), Order = 2 };

        // Act
        changeSet.Items.Add(item1);
        changeSet.Items.Add(item2);

        // Assert
        changeSet.Items.Should().HaveCount(2);
        changeSet.Items.Should().Contain(item1);
        changeSet.Items.Should().Contain(item2);
    }

    [Fact]
    public void ChangeSet_AddApprovals_ShouldAddToCollection()
    {
        // Arrange
        var changeSet = new ChangeSet();
        var approval = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            Decision = ApprovalDecision.Approved
        };

        // Act
        changeSet.Approvals.Add(approval);

        // Assert
        changeSet.Approvals.Should().HaveCount(1);
        changeSet.Approvals.First().Decision.Should().Be(ApprovalDecision.Approved);
    }

    [Fact]
    public void ChangeSet_WithNullOptionalProperties_ShouldAllowNull()
    {
        // Arrange & Act
        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            Description = null,
            ApprovedByUserId = null,
            ApprovedAt = null,
            ScheduledFor = null,
            AppliedAt = null,
            RolledBackAt = null,
            RollbackReason = null,
            SimulationSummaryJson = null
        };

        // Assert
        changeSet.Description.Should().BeNull();
        changeSet.ApprovedByUserId.Should().BeNull();
        changeSet.ApprovedAt.Should().BeNull();
        changeSet.ScheduledFor.Should().BeNull();
        changeSet.AppliedAt.Should().BeNull();
        changeSet.RolledBackAt.Should().BeNull();
        changeSet.RollbackReason.Should().BeNull();
        changeSet.SimulationSummaryJson.Should().BeNull();
    }

    #endregion

    #region ChangeItem Entity Tests

    [Fact]
    public void ChangeItem_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var changeItem = new ChangeItem();

        // Assert
        changeItem.Id.Should().Be(Guid.Empty);
        changeItem.ChangeSetId.Should().Be(Guid.Empty);
        changeItem.TargetId.Should().Be(Guid.Empty);
        changeItem.Order.Should().Be(0);
        changeItem.CurrentValueJson.Should().BeNull();
        changeItem.ProposedValueJson.Should().BeNull();
    }

    [Fact]
    public void ChangeItem_WithAllPropertiesSet_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var changeSetId = Guid.NewGuid();
        var targetId = Guid.NewGuid();

        // Act
        var changeItem = new ChangeItem
        {
            Id = id,
            ChangeSetId = changeSetId,
            TargetType = ChangeTargetType.Policy,
            TargetId = targetId,
            Operation = ChangeOperation.Update,
            CurrentValueJson = "{\"enabled\":false}",
            ProposedValueJson = "{\"enabled\":true}",
            Order = 5
        };

        // Assert
        changeItem.Id.Should().Be(id);
        changeItem.ChangeSetId.Should().Be(changeSetId);
        changeItem.TargetType.Should().Be(ChangeTargetType.Policy);
        changeItem.TargetId.Should().Be(targetId);
        changeItem.Operation.Should().Be(ChangeOperation.Update);
        changeItem.CurrentValueJson.Should().Be("{\"enabled\":false}");
        changeItem.ProposedValueJson.Should().Be("{\"enabled\":true}");
        changeItem.Order.Should().Be(5);
    }

    [Theory]
    [InlineData(ChangeOperation.Create)]
    [InlineData(ChangeOperation.Update)]
    [InlineData(ChangeOperation.Delete)]
    [InlineData(ChangeOperation.Enable)]
    [InlineData(ChangeOperation.Disable)]
    public void ChangeItem_WithDifferentOperations_ShouldRetainOperation(ChangeOperation operation)
    {
        // Arrange & Act
        var changeItem = new ChangeItem { Operation = operation };

        // Assert
        changeItem.Operation.Should().Be(operation);
    }

    [Theory]
    [InlineData(ChangeTargetType.Policy)]
    [InlineData(ChangeTargetType.AutomationWorkflow)]
    [InlineData(ChangeTargetType.TenantSetting)]
    [InlineData(ChangeTargetType.FederationProvider)]
    [InlineData(ChangeTargetType.Application)]
    public void ChangeItem_WithDifferentTargetTypes_ShouldRetainTargetType(ChangeTargetType targetType)
    {
        // Arrange & Act
        var changeItem = new ChangeItem { TargetType = targetType };

        // Assert
        changeItem.TargetType.Should().Be(targetType);
    }

    #endregion

    #region ChangeApproval Entity Tests

    [Fact]
    public void ChangeApproval_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var approval = new ChangeApproval();

        // Assert
        approval.Id.Should().Be(Guid.Empty);
        approval.ChangeSetId.Should().Be(Guid.Empty);
        approval.ApproverUserId.Should().Be(Guid.Empty);
        approval.Reason.Should().BeNull();
    }

    [Fact]
    public void ChangeApproval_WithAllPropertiesSet_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var changeSetId = Guid.NewGuid();
        var approverUserId = Guid.NewGuid();
        var decidedAt = DateTimeOffset.UtcNow;

        // Act
        var approval = new ChangeApproval
        {
            Id = id,
            ChangeSetId = changeSetId,
            ApproverUserId = approverUserId,
            Decision = ApprovalDecision.Approved,
            Reason = "Looks good to me",
            DecidedAt = decidedAt
        };

        // Assert
        approval.Id.Should().Be(id);
        approval.ChangeSetId.Should().Be(changeSetId);
        approval.ApproverUserId.Should().Be(approverUserId);
        approval.Decision.Should().Be(ApprovalDecision.Approved);
        approval.Reason.Should().Be("Looks good to me");
        approval.DecidedAt.Should().Be(decidedAt);
    }

    [Fact]
    public void ChangeApproval_WithRejectedDecision_ShouldRetainReason()
    {
        // Arrange & Act
        var approval = new ChangeApproval
        {
            Decision = ApprovalDecision.Rejected,
            Reason = "Security concerns with this change"
        };

        // Assert
        approval.Decision.Should().Be(ApprovalDecision.Rejected);
        approval.Reason.Should().Be("Security concerns with this change");
    }

    #endregion

    #region ChangeApprovalRule Entity Tests

    [Fact]
    public void ChangeApprovalRule_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var rule = new ChangeApprovalRule();

        // Assert
        rule.Id.Should().Be(Guid.Empty);
        rule.ScopeType.Should().BeEmpty();
        rule.ScopeId.Should().Be(Guid.Empty);
        rule.MinApprovers.Should().Be(0);
        rule.RequireSeparationOfDuties.Should().BeFalse();
    }

    [Fact]
    public void ChangeApprovalRule_WithAllPropertiesSet_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();

        // Act
        var rule = new ChangeApprovalRule
        {
            Id = id,
            ScopeType = "Organization",
            ScopeId = scopeId,
            Category = ChangeCategory.AuthorizationPolicy,
            MinApprovers = 2,
            RequireSeparationOfDuties = true
        };

        // Assert
        rule.Id.Should().Be(id);
        rule.ScopeType.Should().Be("Organization");
        rule.ScopeId.Should().Be(scopeId);
        rule.Category.Should().Be(ChangeCategory.AuthorizationPolicy);
        rule.MinApprovers.Should().Be(2);
        rule.RequireSeparationOfDuties.Should().BeTrue();
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(5)]
    [InlineData(10)]
    public void ChangeApprovalRule_WithDifferentMinApprovers_ShouldRetainValue(int minApprovers)
    {
        // Arrange & Act
        var rule = new ChangeApprovalRule { MinApprovers = minApprovers };

        // Assert
        rule.MinApprovers.Should().Be(minApprovers);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void ChangeApprovalRule_WithSeparationOfDuties_ShouldRetainValue(bool requireSeparation)
    {
        // Arrange & Act
        var rule = new ChangeApprovalRule { RequireSeparationOfDuties = requireSeparation };

        // Assert
        rule.RequireSeparationOfDuties.Should().Be(requireSeparation);
    }

    #endregion

    #region ChangeExecutionLog Entity Tests

    [Fact]
    public void ChangeExecutionLog_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var log = new ChangeExecutionLog();

        // Assert
        log.Id.Should().Be(Guid.Empty);
        log.ChangeSetId.Should().Be(Guid.Empty);
        log.ItemId.Should().BeNull();
        log.Status.Should().BeEmpty();
        log.Message.Should().BeNull();
    }

    [Fact]
    public void ChangeExecutionLog_WithAllPropertiesSet_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var changeSetId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;

        // Act
        var log = new ChangeExecutionLog
        {
            Id = id,
            ChangeSetId = changeSetId,
            ItemId = itemId,
            Step = ExecutionStep.Apply,
            Status = "Success",
            Message = "Changes applied successfully",
            CreatedAt = createdAt
        };

        // Assert
        log.Id.Should().Be(id);
        log.ChangeSetId.Should().Be(changeSetId);
        log.ItemId.Should().Be(itemId);
        log.Step.Should().Be(ExecutionStep.Apply);
        log.Status.Should().Be("Success");
        log.Message.Should().Be("Changes applied successfully");
        log.CreatedAt.Should().Be(createdAt);
    }

    [Theory]
    [InlineData(ExecutionStep.Simulate)]
    [InlineData(ExecutionStep.Apply)]
    [InlineData(ExecutionStep.Rollback)]
    public void ChangeExecutionLog_WithDifferentSteps_ShouldRetainStep(ExecutionStep step)
    {
        // Arrange & Act
        var log = new ChangeExecutionLog { Step = step };

        // Assert
        log.Step.Should().Be(step);
    }

    [Fact]
    public void ChangeExecutionLog_WithNullItemId_ShouldAllowNull()
    {
        // Arrange & Act
        var log = new ChangeExecutionLog
        {
            ItemId = null,
            Message = "Global execution log"
        };

        // Assert
        log.ItemId.Should().BeNull();
    }

    #endregion

    #region ChangeSetStatus Enum Tests

    [Fact]
    public void ChangeSetStatus_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ChangeSetStatus.Draft).Should().Be(0);
        ((int)ChangeSetStatus.InReview).Should().Be(1);
        ((int)ChangeSetStatus.Approved).Should().Be(2);
        ((int)ChangeSetStatus.Scheduled).Should().Be(3);
        ((int)ChangeSetStatus.Applied).Should().Be(4);
        ((int)ChangeSetStatus.RolledBack).Should().Be(5);
        ((int)ChangeSetStatus.Cancelled).Should().Be(6);
    }

    [Fact]
    public void ChangeSetStatus_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ChangeSetStatus>();

        // Assert
        values.Should().HaveCount(7);
    }

    [Theory]
    [InlineData(ChangeSetStatus.Draft, "Draft")]
    [InlineData(ChangeSetStatus.InReview, "InReview")]
    [InlineData(ChangeSetStatus.Approved, "Approved")]
    [InlineData(ChangeSetStatus.Scheduled, "Scheduled")]
    [InlineData(ChangeSetStatus.Applied, "Applied")]
    [InlineData(ChangeSetStatus.RolledBack, "RolledBack")]
    [InlineData(ChangeSetStatus.Cancelled, "Cancelled")]
    public void ChangeSetStatus_ShouldHaveCorrectNames(ChangeSetStatus status, string expectedName)
    {
        // Assert
        status.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Draft", ChangeSetStatus.Draft)]
    [InlineData("InReview", ChangeSetStatus.InReview)]
    [InlineData("Approved", ChangeSetStatus.Approved)]
    [InlineData("Scheduled", ChangeSetStatus.Scheduled)]
    [InlineData("Applied", ChangeSetStatus.Applied)]
    [InlineData("RolledBack", ChangeSetStatus.RolledBack)]
    [InlineData("Cancelled", ChangeSetStatus.Cancelled)]
    public void ChangeSetStatus_ShouldParseFromString(string name, ChangeSetStatus expectedStatus)
    {
        // Act
        var result = Enum.Parse<ChangeSetStatus>(name);

        // Assert
        result.Should().Be(expectedStatus);
    }

    [Theory]
    [InlineData(0, ChangeSetStatus.Draft)]
    [InlineData(1, ChangeSetStatus.InReview)]
    [InlineData(2, ChangeSetStatus.Approved)]
    [InlineData(3, ChangeSetStatus.Scheduled)]
    [InlineData(4, ChangeSetStatus.Applied)]
    [InlineData(5, ChangeSetStatus.RolledBack)]
    [InlineData(6, ChangeSetStatus.Cancelled)]
    public void ChangeSetStatus_ShouldCastFromInt(int value, ChangeSetStatus expectedStatus)
    {
        // Act
        var result = (ChangeSetStatus)value;

        // Assert
        result.Should().Be(expectedStatus);
    }

    [Fact]
    public void ChangeSetStatus_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ChangeSetStatus>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ChangeSetStatus), value).Should().BeTrue();
        }
    }

    #endregion

    #region ChangeCategory Enum Tests

    [Fact]
    public void ChangeCategory_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ChangeCategory.AuthorizationPolicy).Should().Be(0);
        ((int)ChangeCategory.AutomationWorkflow).Should().Be(1);
        ((int)ChangeCategory.TenantSecuritySettings).Should().Be(2);
        ((int)ChangeCategory.FederationConfig).Should().Be(3);
        ((int)ChangeCategory.ApplicationConfig).Should().Be(4);
    }

    [Fact]
    public void ChangeCategory_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ChangeCategory>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Theory]
    [InlineData(ChangeCategory.AuthorizationPolicy, "AuthorizationPolicy")]
    [InlineData(ChangeCategory.AutomationWorkflow, "AutomationWorkflow")]
    [InlineData(ChangeCategory.TenantSecuritySettings, "TenantSecuritySettings")]
    [InlineData(ChangeCategory.FederationConfig, "FederationConfig")]
    [InlineData(ChangeCategory.ApplicationConfig, "ApplicationConfig")]
    public void ChangeCategory_ShouldHaveCorrectNames(ChangeCategory category, string expectedName)
    {
        // Assert
        category.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("AuthorizationPolicy", ChangeCategory.AuthorizationPolicy)]
    [InlineData("AutomationWorkflow", ChangeCategory.AutomationWorkflow)]
    [InlineData("TenantSecuritySettings", ChangeCategory.TenantSecuritySettings)]
    [InlineData("FederationConfig", ChangeCategory.FederationConfig)]
    [InlineData("ApplicationConfig", ChangeCategory.ApplicationConfig)]
    public void ChangeCategory_ShouldParseFromString(string name, ChangeCategory expectedCategory)
    {
        // Act
        var result = Enum.Parse<ChangeCategory>(name);

        // Assert
        result.Should().Be(expectedCategory);
    }

    [Fact]
    public void ChangeCategory_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ChangeCategory>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ChangeCategory), value).Should().BeTrue();
        }
    }

    #endregion

    #region ChangeOperation Enum Tests

    [Fact]
    public void ChangeOperation_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ChangeOperation.Create).Should().Be(0);
        ((int)ChangeOperation.Update).Should().Be(1);
        ((int)ChangeOperation.Delete).Should().Be(2);
        ((int)ChangeOperation.Enable).Should().Be(3);
        ((int)ChangeOperation.Disable).Should().Be(4);
    }

    [Fact]
    public void ChangeOperation_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ChangeOperation>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Theory]
    [InlineData(ChangeOperation.Create, "Create")]
    [InlineData(ChangeOperation.Update, "Update")]
    [InlineData(ChangeOperation.Delete, "Delete")]
    [InlineData(ChangeOperation.Enable, "Enable")]
    [InlineData(ChangeOperation.Disable, "Disable")]
    public void ChangeOperation_ShouldHaveCorrectNames(ChangeOperation operation, string expectedName)
    {
        // Assert
        operation.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Create", ChangeOperation.Create)]
    [InlineData("Update", ChangeOperation.Update)]
    [InlineData("Delete", ChangeOperation.Delete)]
    [InlineData("Enable", ChangeOperation.Enable)]
    [InlineData("Disable", ChangeOperation.Disable)]
    public void ChangeOperation_ShouldParseFromString(string name, ChangeOperation expectedOperation)
    {
        // Act
        var result = Enum.Parse<ChangeOperation>(name);

        // Assert
        result.Should().Be(expectedOperation);
    }

    [Fact]
    public void ChangeOperation_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ChangeOperation>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ChangeOperation), value).Should().BeTrue();
        }
    }

    #endregion

    #region ApprovalDecision Enum Tests

    [Fact]
    public void ApprovalDecision_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ApprovalDecision.Approved).Should().Be(0);
        ((int)ApprovalDecision.Rejected).Should().Be(1);
    }

    [Fact]
    public void ApprovalDecision_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ApprovalDecision>();

        // Assert
        values.Should().HaveCount(2);
    }

    [Theory]
    [InlineData(ApprovalDecision.Approved, "Approved")]
    [InlineData(ApprovalDecision.Rejected, "Rejected")]
    public void ApprovalDecision_ShouldHaveCorrectNames(ApprovalDecision decision, string expectedName)
    {
        // Assert
        decision.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Approved", ApprovalDecision.Approved)]
    [InlineData("Rejected", ApprovalDecision.Rejected)]
    public void ApprovalDecision_ShouldParseFromString(string name, ApprovalDecision expectedDecision)
    {
        // Act
        var result = Enum.Parse<ApprovalDecision>(name);

        // Assert
        result.Should().Be(expectedDecision);
    }

    [Fact]
    public void ApprovalDecision_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ApprovalDecision>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ApprovalDecision), value).Should().BeTrue();
        }
    }

    #endregion

    #region ChangeTargetType Enum Tests

    [Fact]
    public void ChangeTargetType_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ChangeTargetType.Policy).Should().Be(0);
        ((int)ChangeTargetType.AutomationWorkflow).Should().Be(1);
        ((int)ChangeTargetType.TenantSetting).Should().Be(2);
        ((int)ChangeTargetType.FederationProvider).Should().Be(3);
        ((int)ChangeTargetType.Application).Should().Be(4);
    }

    [Fact]
    public void ChangeTargetType_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ChangeTargetType>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Theory]
    [InlineData(ChangeTargetType.Policy, "Policy")]
    [InlineData(ChangeTargetType.AutomationWorkflow, "AutomationWorkflow")]
    [InlineData(ChangeTargetType.TenantSetting, "TenantSetting")]
    [InlineData(ChangeTargetType.FederationProvider, "FederationProvider")]
    [InlineData(ChangeTargetType.Application, "Application")]
    public void ChangeTargetType_ShouldHaveCorrectNames(ChangeTargetType targetType, string expectedName)
    {
        // Assert
        targetType.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Policy", ChangeTargetType.Policy)]
    [InlineData("AutomationWorkflow", ChangeTargetType.AutomationWorkflow)]
    [InlineData("TenantSetting", ChangeTargetType.TenantSetting)]
    [InlineData("FederationProvider", ChangeTargetType.FederationProvider)]
    [InlineData("Application", ChangeTargetType.Application)]
    public void ChangeTargetType_ShouldParseFromString(string name, ChangeTargetType expectedTargetType)
    {
        // Act
        var result = Enum.Parse<ChangeTargetType>(name);

        // Assert
        result.Should().Be(expectedTargetType);
    }

    [Fact]
    public void ChangeTargetType_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ChangeTargetType>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ChangeTargetType), value).Should().BeTrue();
        }
    }

    #endregion

    #region ExecutionStep Enum Tests

    [Fact]
    public void ExecutionStep_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ExecutionStep.Simulate).Should().Be(0);
        ((int)ExecutionStep.Apply).Should().Be(1);
        ((int)ExecutionStep.Rollback).Should().Be(2);
    }

    [Fact]
    public void ExecutionStep_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<ExecutionStep>();

        // Assert
        values.Should().HaveCount(3);
    }

    [Theory]
    [InlineData(ExecutionStep.Simulate, "Simulate")]
    [InlineData(ExecutionStep.Apply, "Apply")]
    [InlineData(ExecutionStep.Rollback, "Rollback")]
    public void ExecutionStep_ShouldHaveCorrectNames(ExecutionStep step, string expectedName)
    {
        // Assert
        step.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Simulate", ExecutionStep.Simulate)]
    [InlineData("Apply", ExecutionStep.Apply)]
    [InlineData("Rollback", ExecutionStep.Rollback)]
    public void ExecutionStep_ShouldParseFromString(string name, ExecutionStep expectedStep)
    {
        // Act
        var result = Enum.Parse<ExecutionStep>(name);

        // Assert
        result.Should().Be(expectedStep);
    }

    [Fact]
    public void ExecutionStep_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<ExecutionStep>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(ExecutionStep), value).Should().BeTrue();
        }
    }

    #endregion

    #region IChangeSetRepository Mock Tests

    [Fact]
    public async Task ChangeSetRepository_GetByIdAsync_ReturnsChangeSet()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSetId = Guid.NewGuid();
        var expectedChangeSet = new ChangeSet
        {
            Id = changeSetId,
            Title = "Test ChangeSet",
            Status = ChangeSetStatus.Draft
        };

        mockRepository.Setup(r => r.GetByIdAsync(changeSetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedChangeSet);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(changeSetId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(changeSetId);
        result.Title.Should().Be("Test ChangeSet");
        mockRepository.Verify(r => r.GetByIdAsync(changeSetId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeSetRepository_GetByIdAsync_NonExistent_ReturnsNull()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSetId = Guid.NewGuid();

        mockRepository.Setup(r => r.GetByIdAsync(changeSetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ChangeSet?)null);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(changeSetId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ChangeSetRepository_GetByIdWithDetailsAsync_ReturnsChangeSetWithItems()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSetId = Guid.NewGuid();
        var expectedChangeSet = new ChangeSet
        {
            Id = changeSetId,
            Title = "Test ChangeSet",
            Items = new List<ChangeItem>
            {
                new() { Id = Guid.NewGuid(), Order = 1 },
                new() { Id = Guid.NewGuid(), Order = 2 }
            }
        };

        mockRepository.Setup(r => r.GetByIdWithDetailsAsync(changeSetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedChangeSet);

        // Act
        var result = await mockRepository.Object.GetByIdWithDetailsAsync(changeSetId);

        // Assert
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task ChangeSetRepository_GetByScopeAsync_ReturnsFilteredChangeSets()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var scopeType = "Tenant";
        var scopeId = Guid.NewGuid();
        var expectedChangeSets = new List<ChangeSet>
        {
            new() { Id = Guid.NewGuid(), ScopeType = scopeType, ScopeId = scopeId },
            new() { Id = Guid.NewGuid(), ScopeType = scopeType, ScopeId = scopeId }
        };

        mockRepository.Setup(r => r.GetByScopeAsync(scopeType, scopeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedChangeSets);

        // Act
        var result = await mockRepository.Object.GetByScopeAsync(scopeType, scopeId);

        // Assert
        result.Should().HaveCount(2);
        result.All(cs => cs.ScopeType == scopeType && cs.ScopeId == scopeId).Should().BeTrue();
    }

    [Fact]
    public async Task ChangeSetRepository_GetByStatusAsync_ReturnsFilteredByStatus()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var scopeType = "Tenant";
        var scopeId = Guid.NewGuid();
        var status = ChangeSetStatus.InReview;
        var expectedChangeSets = new List<ChangeSet>
        {
            new() { Id = Guid.NewGuid(), Status = ChangeSetStatus.InReview }
        };

        mockRepository.Setup(r => r.GetByStatusAsync(scopeType, scopeId, status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedChangeSets);

        // Act
        var result = await mockRepository.Object.GetByStatusAsync(scopeType, scopeId, status);

        // Assert
        result.Should().HaveCount(1);
        result.All(cs => cs.Status == ChangeSetStatus.InReview).Should().BeTrue();
    }

    [Fact]
    public async Task ChangeSetRepository_GetPendingApprovalsForUserAsync_ReturnsPendingApprovals()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var userId = Guid.NewGuid();
        var expectedChangeSets = new List<ChangeSet>
        {
            new() { Id = Guid.NewGuid(), Status = ChangeSetStatus.InReview },
            new() { Id = Guid.NewGuid(), Status = ChangeSetStatus.InReview }
        };

        mockRepository.Setup(r => r.GetPendingApprovalsForUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedChangeSets);

        // Act
        var result = await mockRepository.Object.GetPendingApprovalsForUserAsync(userId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task ChangeSetRepository_GetPagedAsync_ReturnsPagedResults()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var scopeType = "Tenant";
        var scopeId = Guid.NewGuid();
        var expectedChangeSets = new List<ChangeSet>
        {
            new() { Id = Guid.NewGuid() },
            new() { Id = Guid.NewGuid() }
        };

        mockRepository.Setup(r => r.GetPagedAsync(
                scopeType, scopeId, null, null, null, null, null, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync((expectedChangeSets, 50));

        // Act
        var (items, totalCount) = await mockRepository.Object.GetPagedAsync(
            scopeType, scopeId, null, null, null, null, null, 1, 10);

        // Assert
        items.Should().HaveCount(2);
        totalCount.Should().Be(50);
    }

    [Fact]
    public async Task ChangeSetRepository_AddAsync_InvokesAdd()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            Title = "New ChangeSet"
        };

        mockRepository.Setup(r => r.AddAsync(changeSet, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(changeSet);

        // Assert
        mockRepository.Verify(r => r.AddAsync(changeSet, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeSetRepository_UpdateAsync_InvokesUpdate()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            Title = "Updated ChangeSet"
        };

        mockRepository.Setup(r => r.UpdateAsync(changeSet, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.UpdateAsync(changeSet);

        // Assert
        mockRepository.Verify(r => r.UpdateAsync(changeSet, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeSetRepository_DeleteAsync_InvokesDelete()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSetId = Guid.NewGuid();

        mockRepository.Setup(r => r.DeleteAsync(changeSetId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.DeleteAsync(changeSetId);

        // Assert
        mockRepository.Verify(r => r.DeleteAsync(changeSetId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region IChangeApprovalRepository Mock Tests

    [Fact]
    public async Task ChangeApprovalRepository_GetByIdAsync_ReturnsApproval()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRepository>();
        var approvalId = Guid.NewGuid();
        var expectedApproval = new ChangeApproval
        {
            Id = approvalId,
            Decision = ApprovalDecision.Approved
        };

        mockRepository.Setup(r => r.GetByIdAsync(approvalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedApproval);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(approvalId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(approvalId);
    }

    [Fact]
    public async Task ChangeApprovalRepository_GetByChangeSetIdAsync_ReturnsApprovals()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRepository>();
        var changeSetId = Guid.NewGuid();
        var expectedApprovals = new List<ChangeApproval>
        {
            new() { Id = Guid.NewGuid(), ChangeSetId = changeSetId, Decision = ApprovalDecision.Approved },
            new() { Id = Guid.NewGuid(), ChangeSetId = changeSetId, Decision = ApprovalDecision.Rejected }
        };

        mockRepository.Setup(r => r.GetByChangeSetIdAsync(changeSetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedApprovals);

        // Act
        var result = await mockRepository.Object.GetByChangeSetIdAsync(changeSetId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task ChangeApprovalRepository_GetByChangeSetAndUserAsync_ReturnsSpecificApproval()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRepository>();
        var changeSetId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var expectedApproval = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSetId,
            ApproverUserId = userId,
            Decision = ApprovalDecision.Approved
        };

        mockRepository.Setup(r => r.GetByChangeSetAndUserAsync(changeSetId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedApproval);

        // Act
        var result = await mockRepository.Object.GetByChangeSetAndUserAsync(changeSetId, userId);

        // Assert
        result.Should().NotBeNull();
        result!.ApproverUserId.Should().Be(userId);
    }

    [Fact]
    public async Task ChangeApprovalRepository_AddAsync_InvokesAdd()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRepository>();
        var approval = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            Decision = ApprovalDecision.Approved
        };

        mockRepository.Setup(r => r.AddAsync(approval, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(approval);

        // Assert
        mockRepository.Verify(r => r.AddAsync(approval, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeApprovalRepository_DeleteByChangeSetIdAsync_InvokesDelete()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRepository>();
        var changeSetId = Guid.NewGuid();

        mockRepository.Setup(r => r.DeleteByChangeSetIdAsync(changeSetId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.DeleteByChangeSetIdAsync(changeSetId);

        // Assert
        mockRepository.Verify(r => r.DeleteByChangeSetIdAsync(changeSetId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region IChangeApprovalRuleRepository Mock Tests

    [Fact]
    public async Task ChangeApprovalRuleRepository_GetByIdAsync_ReturnsRule()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var ruleId = Guid.NewGuid();
        var expectedRule = new ChangeApprovalRule
        {
            Id = ruleId,
            MinApprovers = 2
        };

        mockRepository.Setup(r => r.GetByIdAsync(ruleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedRule);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(ruleId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(ruleId);
        result.MinApprovers.Should().Be(2);
    }

    [Fact]
    public async Task ChangeApprovalRuleRepository_GetByScopeAndCategoryAsync_ReturnsMatchingRule()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var scopeType = "Tenant";
        var scopeId = Guid.NewGuid();
        var category = ChangeCategory.TenantSecuritySettings;
        var expectedRule = new ChangeApprovalRule
        {
            Id = Guid.NewGuid(),
            ScopeType = scopeType,
            ScopeId = scopeId,
            Category = category,
            MinApprovers = 3
        };

        mockRepository.Setup(r => r.GetByScopeAndCategoryAsync(scopeType, scopeId, category, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedRule);

        // Act
        var result = await mockRepository.Object.GetByScopeAndCategoryAsync(scopeType, scopeId, category);

        // Assert
        result.Should().NotBeNull();
        result!.Category.Should().Be(category);
    }

    [Fact]
    public async Task ChangeApprovalRuleRepository_GetByScopeAsync_ReturnsAllRulesForScope()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var scopeType = "Tenant";
        var scopeId = Guid.NewGuid();
        var expectedRules = new List<ChangeApprovalRule>
        {
            new() { Id = Guid.NewGuid(), Category = ChangeCategory.AuthorizationPolicy },
            new() { Id = Guid.NewGuid(), Category = ChangeCategory.TenantSecuritySettings }
        };

        mockRepository.Setup(r => r.GetByScopeAsync(scopeType, scopeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedRules);

        // Act
        var result = await mockRepository.Object.GetByScopeAsync(scopeType, scopeId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task ChangeApprovalRuleRepository_AddAsync_InvokesAdd()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var rule = new ChangeApprovalRule
        {
            Id = Guid.NewGuid(),
            MinApprovers = 2
        };

        mockRepository.Setup(r => r.AddAsync(rule, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(rule);

        // Assert
        mockRepository.Verify(r => r.AddAsync(rule, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeApprovalRuleRepository_UpdateAsync_InvokesUpdate()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var rule = new ChangeApprovalRule
        {
            Id = Guid.NewGuid(),
            MinApprovers = 5
        };

        mockRepository.Setup(r => r.UpdateAsync(rule, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.UpdateAsync(rule);

        // Assert
        mockRepository.Verify(r => r.UpdateAsync(rule, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeApprovalRuleRepository_DeleteAsync_InvokesDelete()
    {
        // Arrange
        var mockRepository = new Mock<IChangeApprovalRuleRepository>();
        var ruleId = Guid.NewGuid();

        mockRepository.Setup(r => r.DeleteAsync(ruleId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.DeleteAsync(ruleId);

        // Assert
        mockRepository.Verify(r => r.DeleteAsync(ruleId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region IChangeExecutionLogRepository Mock Tests

    [Fact]
    public async Task ChangeExecutionLogRepository_GetByChangeSetIdAsync_ReturnsLogs()
    {
        // Arrange
        var mockRepository = new Mock<IChangeExecutionLogRepository>();
        var changeSetId = Guid.NewGuid();
        var expectedLogs = new List<ChangeExecutionLog>
        {
            new() { Id = Guid.NewGuid(), ChangeSetId = changeSetId, Step = ExecutionStep.Simulate },
            new() { Id = Guid.NewGuid(), ChangeSetId = changeSetId, Step = ExecutionStep.Apply }
        };

        mockRepository.Setup(r => r.GetByChangeSetIdAsync(changeSetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await mockRepository.Object.GetByChangeSetIdAsync(changeSetId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task ChangeExecutionLogRepository_GetByChangeSetAndStepAsync_ReturnsFilteredLogs()
    {
        // Arrange
        var mockRepository = new Mock<IChangeExecutionLogRepository>();
        var changeSetId = Guid.NewGuid();
        var step = ExecutionStep.Apply;
        var expectedLogs = new List<ChangeExecutionLog>
        {
            new() { Id = Guid.NewGuid(), ChangeSetId = changeSetId, Step = ExecutionStep.Apply }
        };

        mockRepository.Setup(r => r.GetByChangeSetAndStepAsync(changeSetId, step, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await mockRepository.Object.GetByChangeSetAndStepAsync(changeSetId, step);

        // Assert
        result.Should().HaveCount(1);
        result.All(l => l.Step == ExecutionStep.Apply).Should().BeTrue();
    }

    [Fact]
    public async Task ChangeExecutionLogRepository_AddAsync_InvokesAdd()
    {
        // Arrange
        var mockRepository = new Mock<IChangeExecutionLogRepository>();
        var log = new ChangeExecutionLog
        {
            Id = Guid.NewGuid(),
            Step = ExecutionStep.Simulate,
            Status = "Success"
        };

        mockRepository.Setup(r => r.AddAsync(log, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(log);

        // Assert
        mockRepository.Verify(r => r.AddAsync(log, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeExecutionLogRepository_AddRangeAsync_InvokesAddRange()
    {
        // Arrange
        var mockRepository = new Mock<IChangeExecutionLogRepository>();
        var logs = new List<ChangeExecutionLog>
        {
            new() { Id = Guid.NewGuid(), Step = ExecutionStep.Apply, Status = "Success" },
            new() { Id = Guid.NewGuid(), Step = ExecutionStep.Apply, Status = "Success" }
        };

        mockRepository.Setup(r => r.AddRangeAsync(logs, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddRangeAsync(logs);

        // Assert
        mockRepository.Verify(r => r.AddRangeAsync(logs, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Edge Cases and Error Handling Tests

    [Fact]
    public void ChangeSet_WithEmptyTitle_ShouldAllowEmptyString()
    {
        // Arrange & Act
        var changeSet = new ChangeSet { Title = string.Empty };

        // Assert
        changeSet.Title.Should().BeEmpty();
    }

    [Fact]
    public void ChangeSet_WithSpecialCharactersInTitle_ShouldRetainCharacters()
    {
        // Arrange
        var title = "Update Policy: <MFA Required> & 'SSO Enabled'";

        // Act
        var changeSet = new ChangeSet { Title = title };

        // Assert
        changeSet.Title.Should().Be(title);
    }

    [Fact]
    public void ChangeItem_WithComplexJson_ShouldRetainJson()
    {
        // Arrange
        var complexJson = "{\"settings\":{\"mfa\":{\"required\":true,\"methods\":[\"totp\",\"sms\"]}},\"nested\":{\"deep\":{\"value\":123}}}";

        // Act
        var changeItem = new ChangeItem
        {
            ProposedValueJson = complexJson
        };

        // Assert
        changeItem.ProposedValueJson.Should().Be(complexJson);
    }

    [Fact]
    public void ChangeSet_StatusTransition_DraftToInReview()
    {
        // Arrange
        var changeSet = new ChangeSet { Status = ChangeSetStatus.Draft };

        // Act
        changeSet.Status = ChangeSetStatus.InReview;

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.InReview);
    }

    [Fact]
    public void ChangeSet_StatusTransition_ApprovedToScheduled()
    {
        // Arrange
        var changeSet = new ChangeSet
        {
            Status = ChangeSetStatus.Approved,
            ScheduledFor = DateTimeOffset.UtcNow.AddDays(1)
        };

        // Act
        changeSet.Status = ChangeSetStatus.Scheduled;

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Scheduled);
        changeSet.ScheduledFor.Should().NotBeNull();
    }

    [Fact]
    public void ChangeSet_StatusTransition_AppliedToRolledBack()
    {
        // Arrange
        var changeSet = new ChangeSet
        {
            Status = ChangeSetStatus.Applied,
            AppliedAt = DateTimeOffset.UtcNow.AddHours(-1)
        };

        // Act
        changeSet.Status = ChangeSetStatus.RolledBack;
        changeSet.RolledBackAt = DateTimeOffset.UtcNow;
        changeSet.RollbackReason = "Critical issue detected";

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.RolledBack);
        changeSet.RolledBackAt.Should().NotBeNull();
        changeSet.RollbackReason.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(7)]
    [InlineData(100)]
    public void ChangeSetStatus_InvalidValue_ShouldNotBeDefined(int invalidValue)
    {
        // Assert
        Enum.IsDefined(typeof(ChangeSetStatus), invalidValue).Should().BeFalse();
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(5)]
    [InlineData(100)]
    public void ChangeCategory_InvalidValue_ShouldNotBeDefined(int invalidValue)
    {
        // Assert
        Enum.IsDefined(typeof(ChangeCategory), invalidValue).Should().BeFalse();
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(3)]
    [InlineData(100)]
    public void ExecutionStep_InvalidValue_ShouldNotBeDefined(int invalidValue)
    {
        // Assert
        Enum.IsDefined(typeof(ExecutionStep), invalidValue).Should().BeFalse();
    }

    [Fact]
    public void ChangeApprovalRule_WithZeroMinApprovers_ShouldAllow()
    {
        // Arrange & Act
        var rule = new ChangeApprovalRule { MinApprovers = 0 };

        // Assert
        rule.MinApprovers.Should().Be(0);
    }

    [Fact]
    public void ChangeExecutionLog_WithErrorStatus_ShouldContainMessage()
    {
        // Arrange & Act
        var log = new ChangeExecutionLog
        {
            Status = "Error",
            Message = "Failed to apply change: Permission denied"
        };

        // Assert
        log.Status.Should().Be("Error");
        log.Message.Should().Contain("Permission denied");
    }

    [Fact]
    public async Task ChangeSetRepository_GetByIdAsync_WithCancellationToken_PropagatesToken()
    {
        // Arrange
        var mockRepository = new Mock<IChangeSetRepository>();
        var changeSetId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        mockRepository.Setup(r => r.GetByIdAsync(changeSetId, cancellationToken))
            .ReturnsAsync(new ChangeSet { Id = changeSetId });

        // Act
        await mockRepository.Object.GetByIdAsync(changeSetId, cancellationToken);

        // Assert
        mockRepository.Verify(r => r.GetByIdAsync(changeSetId, cancellationToken), Times.Once);
    }

    [Fact]
    public void ChangeSet_MultipleApprovals_ShouldTrackAllDecisions()
    {
        // Arrange
        var changeSet = new ChangeSet();
        var approval1 = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ApproverUserId = Guid.NewGuid(),
            Decision = ApprovalDecision.Approved,
            DecidedAt = DateTimeOffset.UtcNow
        };
        var approval2 = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ApproverUserId = Guid.NewGuid(),
            Decision = ApprovalDecision.Approved,
            DecidedAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        // Act
        changeSet.Approvals.Add(approval1);
        changeSet.Approvals.Add(approval2);

        // Assert
        changeSet.Approvals.Should().HaveCount(2);
        changeSet.Approvals.All(a => a.Decision == ApprovalDecision.Approved).Should().BeTrue();
    }

    [Fact]
    public void ChangeItem_OrderProperty_ShouldSupportOrdering()
    {
        // Arrange
        var items = new List<ChangeItem>
        {
            new() { Id = Guid.NewGuid(), Order = 3 },
            new() { Id = Guid.NewGuid(), Order = 1 },
            new() { Id = Guid.NewGuid(), Order = 2 }
        };

        // Act
        var orderedItems = items.OrderBy(i => i.Order).ToList();

        // Assert
        orderedItems[0].Order.Should().Be(1);
        orderedItems[1].Order.Should().Be(2);
        orderedItems[2].Order.Should().Be(3);
    }

    #endregion

    #region Workflow Integration Tests

    [Fact]
    public void ChangeSet_CompleteWorkflow_DraftToApplied()
    {
        // Arrange
        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            Title = "Policy Update",
            Status = ChangeSetStatus.Draft,
            Category = ChangeCategory.AuthorizationPolicy,
            RequestedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Act - Submit for review
        changeSet.Status = ChangeSetStatus.InReview;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;

        // Act - Approve
        changeSet.Status = ChangeSetStatus.Approved;
        changeSet.ApprovedByUserId = Guid.NewGuid();
        changeSet.ApprovedAt = DateTimeOffset.UtcNow;
        changeSet.Approvals.Add(new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ApproverUserId = changeSet.ApprovedByUserId.Value,
            Decision = ApprovalDecision.Approved,
            DecidedAt = changeSet.ApprovedAt.Value
        });

        // Act - Apply
        changeSet.Status = ChangeSetStatus.Applied;
        changeSet.AppliedAt = DateTimeOffset.UtcNow;
        changeSet.ExecutionLogs.Add(new ChangeExecutionLog
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSet.Id,
            Step = ExecutionStep.Apply,
            Status = "Success",
            CreatedAt = changeSet.AppliedAt.Value
        });

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Applied);
        changeSet.ApprovedAt.Should().NotBeNull();
        changeSet.AppliedAt.Should().NotBeNull();
        changeSet.Approvals.Should().HaveCount(1);
        changeSet.ExecutionLogs.Should().HaveCount(1);
    }

    [Fact]
    public void ChangeSet_RejectionWorkflow_DraftToRejected()
    {
        // Arrange
        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            Title = "Risky Policy Change",
            Status = ChangeSetStatus.Draft,
            Category = ChangeCategory.TenantSecuritySettings,
            RequestedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Act - Submit for review
        changeSet.Status = ChangeSetStatus.InReview;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;

        // Act - Reject
        var rejection = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSet.Id,
            ApproverUserId = Guid.NewGuid(),
            Decision = ApprovalDecision.Rejected,
            Reason = "This change violates security policy",
            DecidedAt = DateTimeOffset.UtcNow
        };
        changeSet.Approvals.Add(rejection);
        changeSet.Status = ChangeSetStatus.Cancelled;

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Cancelled);
        changeSet.Approvals.Should().HaveCount(1);
        changeSet.Approvals.First().Decision.Should().Be(ApprovalDecision.Rejected);
        changeSet.Approvals.First().Reason.Should().NotBeNullOrEmpty();
    }

    #endregion
}
