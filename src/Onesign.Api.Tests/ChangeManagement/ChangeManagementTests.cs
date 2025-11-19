using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.ChangeManagement.Application.Commands;
using Onesign.Modules.ChangeManagement.Application.Queries;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;

namespace Onesign.Api.Tests.ChangeManagement;

#region CreateChangeSetCommand Tests

public class CreateChangeSetCommandTests
{
    [Fact]
    public void CreateChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            Title = "Security Policy Update",
            Description = "Update MFA requirements for admin users",
            Type = (int)ChangeType.SecurityConfiguration,
            Impact = (int)ChangeImpact.Medium,
            RequestedBy = Guid.NewGuid(),
            ScheduledAt = DateTime.UtcNow.AddDays(1),
            Changes = new List<ChangeItemRequest>
            {
                new ChangeItemRequest
                {
                    ResourceType = "SecurityPolicy",
                    ResourceId = Guid.NewGuid(),
                    Operation = (int)ChangeOperation.Update,
                    OldValue = "MfaRequirement: None",
                    NewValue = "MfaRequirement: AllAdmins"
                }
            }
        };

        // Assert
        command.Title.Should().Be("Security Policy Update");
        command.Impact.Should().Be((int)ChangeImpact.Medium);
        command.Changes.Should().HaveCount(1);
    }
}

#endregion

#region UpdateChangeSetCommand Tests

public class UpdateChangeSetCommandTests
{
    [Fact]
    public void UpdateChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            Title = "Updated Title",
            Description = "Updated description",
            Impact = (int)ChangeImpact.High
        };

        // Assert
        command.ChangeSetId.Should().NotBeEmpty();
        command.Impact.Should().Be((int)ChangeImpact.High);
    }
}

#endregion

#region SubmitChangeSetCommand Tests

public class SubmitChangeSetCommandTests
{
    [Fact]
    public void SubmitChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new SubmitChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            SubmittedBy = Guid.NewGuid()
        };

        // Assert
        command.ChangeSetId.Should().NotBeEmpty();
        command.SubmittedBy.Should().NotBeEmpty();
    }
}

#endregion

#region ApproveChangeSetCommand Tests

public class ApproveChangeSetCommandTests
{
    [Fact]
    public void ApproveChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ApproveChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            ApprovedBy = Guid.NewGuid(),
            Comments = "Approved for production"
        };

        // Assert
        command.Comments.Should().Be("Approved for production");
    }
}

#endregion

#region RejectChangeSetCommand Tests

public class RejectChangeSetCommandTests
{
    [Fact]
    public void RejectChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RejectChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            RejectedBy = Guid.NewGuid(),
            Reason = "Insufficient testing"
        };

        // Assert
        command.Reason.Should().Be("Insufficient testing");
    }
}

#endregion

#region ImplementChangeSetCommand Tests

public class ImplementChangeSetCommandTests
{
    [Fact]
    public void ImplementChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ImplementChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            ImplementedBy = Guid.NewGuid()
        };

        // Assert
        command.ImplementedBy.Should().NotBeEmpty();
    }
}

#endregion

#region RollbackChangeSetCommand Tests

public class RollbackChangeSetCommandTests
{
    [Fact]
    public void RollbackChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RollbackChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            RolledBackBy = Guid.NewGuid(),
            Reason = "Caused unexpected behavior"
        };

        // Assert
        command.Reason.Should().Be("Caused unexpected behavior");
    }
}

#endregion

#region VerifyChangeSetCommand Tests

public class VerifyChangeSetCommandTests
{
    [Fact]
    public void VerifyChangeSetCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new VerifyChangeSetCommand
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = Guid.NewGuid(),
            VerifiedBy = Guid.NewGuid(),
            Notes = "All changes verified successfully"
        };

        // Assert
        command.Notes.Should().Be("All changes verified successfully");
    }
}

#endregion

#region GetChangeSetsQuery Tests

public class GetChangeSetsQueryTests
{
    [Fact]
    public void GetChangeSetsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetChangeSetsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)ChangeSetStatus.PendingApproval,
            Type = (int)ChangeType.SecurityConfiguration,
            RequestedBy = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)ChangeSetStatus.PendingApproval);
        query.Type.Should().Be((int)ChangeType.SecurityConfiguration);
    }
}

#endregion

#region GetChangeSetDetailsQuery Tests

public class GetChangeSetDetailsQueryTests
{
    [Fact]
    public void GetChangeSetDetailsQuery_ShouldHaveChangeSetId()
    {
        // Arrange & Act
        var changeSetId = Guid.NewGuid();
        var query = new GetChangeSetDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            ChangeSetId = changeSetId
        };

        // Assert
        query.ChangeSetId.Should().Be(changeSetId);
    }
}

#endregion

#region GetChangeHistoryQuery Tests

public class GetChangeHistoryQueryTests
{
    [Fact]
    public void GetChangeHistoryQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetChangeHistoryQuery
        {
            TenantId = Guid.NewGuid(),
            ResourceType = "SecurityPolicy",
            ResourceId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        query.ResourceType.Should().Be("SecurityPolicy");
        query.ResourceId.Should().NotBeEmpty();
    }
}

#endregion

#region GetPendingApprovalsQuery Tests

public class GetPendingApprovalsQueryForChangeManagementTests
{
    [Fact]
    public void GetPendingApprovalsQuery_ShouldHaveApproverId()
    {
        // Arrange & Act
        var approverId = Guid.NewGuid();
        var query = new GetPendingChangeSetsQuery
        {
            TenantId = Guid.NewGuid(),
            ApproverId = approverId
        };

        // Assert
        query.ApproverId.Should().Be(approverId);
    }
}

#endregion

#region ChangeSet Entity Tests

public class ChangeSetEntityTests
{
    [Fact]
    public void ChangeSet_ShouldBeCreatedWithDraftStatus()
    {
        // Arrange & Act
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Change",
            "Description",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Draft);
        changeSet.Title.Should().Be("Test Change");
    }

    [Fact]
    public void ChangeSet_Submit_ShouldChangeStatusToPendingApproval()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());

        // Act
        changeSet.Submit();

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.PendingApproval);
        changeSet.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public void ChangeSet_Approve_ShouldChangeStatusToApproved()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());
        changeSet.Submit();

        // Act
        changeSet.Approve(Guid.NewGuid(), "Approved");

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Approved);
        changeSet.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void ChangeSet_Reject_ShouldChangeStatusToRejected()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());
        changeSet.Submit();

        // Act
        changeSet.Reject(Guid.NewGuid(), "Not justified");

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Rejected);
    }

    [Fact]
    public void ChangeSet_Implement_ShouldChangeStatusToImplemented()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());
        changeSet.Submit();
        changeSet.Approve(Guid.NewGuid(), "OK");

        // Act
        changeSet.Implement(Guid.NewGuid());

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Implemented);
        changeSet.ImplementedAt.Should().NotBeNull();
    }

    [Fact]
    public void ChangeSet_Rollback_ShouldChangeStatusToRolledBack()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());
        changeSet.Submit();
        changeSet.Approve(Guid.NewGuid(), "OK");
        changeSet.Implement(Guid.NewGuid());

        // Act
        changeSet.Rollback(Guid.NewGuid(), "Issue detected");

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.RolledBack);
    }

    [Fact]
    public void ChangeSet_Verify_ShouldChangeStatusToVerified()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());
        changeSet.Submit();
        changeSet.Approve(Guid.NewGuid(), "OK");
        changeSet.Implement(Guid.NewGuid());

        // Act
        changeSet.Verify(Guid.NewGuid(), "Verified OK");

        // Assert
        changeSet.Status.Should().Be(ChangeSetStatus.Verified);
        changeSet.VerifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ChangeSet_AddChangeItem_ShouldAddToList()
    {
        // Arrange
        var changeSet = new ChangeSet(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Change",
            "Desc",
            ChangeType.Configuration,
            ChangeImpact.Low,
            Guid.NewGuid());

        // Act
        changeSet.AddChangeItem("Policy", Guid.NewGuid(), ChangeOperation.Update, "old", "new");

        // Assert
        changeSet.ChangeItems.Should().HaveCount(1);
    }
}

#endregion

#region ChangeItem Entity Tests

public class ChangeItemEntityTests
{
    [Fact]
    public void ChangeItem_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var changeItem = new ChangeItem(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "SecurityPolicy",
            Guid.NewGuid(),
            ChangeOperation.Update,
            "old value",
            "new value");

        // Assert
        changeItem.ResourceType.Should().Be("SecurityPolicy");
        changeItem.Operation.Should().Be(ChangeOperation.Update);
        changeItem.OldValue.Should().Be("old value");
        changeItem.NewValue.Should().Be("new value");
    }
}

#endregion

#region ChangeType Enum Tests

public class ChangeTypeEnumTests
{
    [Theory]
    [InlineData(ChangeType.Configuration)]
    [InlineData(ChangeType.SecurityConfiguration)]
    [InlineData(ChangeType.UserManagement)]
    [InlineData(ChangeType.RoleManagement)]
    [InlineData(ChangeType.PolicyManagement)]
    public void ChangeType_ShouldHaveCorrectValues(ChangeType changeType)
    {
        // Assert
        changeType.Should().BeDefined();
    }
}

#endregion

#region ChangeImpact Enum Tests

public class ChangeImpactEnumTests
{
    [Theory]
    [InlineData(ChangeImpact.None)]
    [InlineData(ChangeImpact.Low)]
    [InlineData(ChangeImpact.Medium)]
    [InlineData(ChangeImpact.High)]
    [InlineData(ChangeImpact.Critical)]
    public void ChangeImpact_ShouldHaveCorrectValues(ChangeImpact impact)
    {
        // Assert
        impact.Should().BeDefined();
    }
}

#endregion

#region ChangeSetStatus Enum Tests

public class ChangeSetStatusEnumTests
{
    [Theory]
    [InlineData(ChangeSetStatus.Draft)]
    [InlineData(ChangeSetStatus.PendingApproval)]
    [InlineData(ChangeSetStatus.Approved)]
    [InlineData(ChangeSetStatus.Rejected)]
    [InlineData(ChangeSetStatus.Implemented)]
    [InlineData(ChangeSetStatus.Verified)]
    [InlineData(ChangeSetStatus.RolledBack)]
    public void ChangeSetStatus_ShouldHaveCorrectValues(ChangeSetStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region ChangeOperation Enum Tests

public class ChangeOperationEnumTests
{
    [Theory]
    [InlineData(ChangeOperation.Create)]
    [InlineData(ChangeOperation.Update)]
    [InlineData(ChangeOperation.Delete)]
    public void ChangeOperation_ShouldHaveCorrectValues(ChangeOperation operation)
    {
        // Assert
        operation.Should().BeDefined();
    }
}

#endregion
