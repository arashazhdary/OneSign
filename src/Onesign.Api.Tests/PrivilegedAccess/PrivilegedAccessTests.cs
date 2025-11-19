using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;

namespace Onesign.Api.Tests.PrivilegedAccess;

#region RequestJitAccessCommand Tests

public class RequestJitAccessCommandTests
{
    [Fact]
    public void RequestJitAccessCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RequestJitAccessCommand
        {
            TenantId = Guid.NewGuid(),
            RequesterId = Guid.NewGuid(),
            ResourceType = "Database",
            ResourceId = Guid.NewGuid(),
            Permissions = new List<string> { "read", "write" },
            Justification = "Need access for emergency fix",
            DurationMinutes = 60
        };

        // Assert
        command.ResourceType.Should().Be("Database");
        command.Permissions.Should().HaveCount(2);
        command.DurationMinutes.Should().Be(60);
    }
}

#endregion

#region ApproveJitAccessCommand Tests

public class ApproveJitAccessCommandTests
{
    [Fact]
    public void ApproveJitAccessCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ApproveJitAccessCommand
        {
            TenantId = Guid.NewGuid(),
            GrantId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Comments = "Approved for emergency"
        };

        // Assert
        command.GrantId.Should().NotBeEmpty();
        command.Comments.Should().Be("Approved for emergency");
    }
}

#endregion

#region RevokeJitGrantCommand Tests

public class RevokeJitGrantCommandTests
{
    [Fact]
    public void RevokeJitGrantCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeJitGrantCommand
        {
            TenantId = Guid.NewGuid(),
            GrantId = Guid.NewGuid(),
            RevokedBy = Guid.NewGuid(),
            Reason = "Task completed"
        };

        // Assert
        command.Reason.Should().Be("Task completed");
    }
}

#endregion

#region ExpireJitGrantCommand Tests

public class ExpireJitGrantCommandTests
{
    [Fact]
    public void ExpireJitGrantCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ExpireJitGrantCommand
        {
            TenantId = Guid.NewGuid(),
            GrantId = Guid.NewGuid()
        };

        // Assert
        command.GrantId.Should().NotBeEmpty();
    }
}

#endregion

#region CreateBreakGlassAccountCommand Tests

public class CreateBreakGlassAccountCommandTests
{
    [Fact]
    public void CreateBreakGlassAccountCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateBreakGlassAccountCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Emergency Admin",
            Description = "Break glass account for emergencies",
            Permissions = new List<string> { "admin:*" },
            RequiresApproval = true,
            NotifyOnUse = true,
            CreatedBy = Guid.NewGuid()
        };

        // Assert
        command.Name.Should().Be("Emergency Admin");
        command.RequiresApproval.Should().BeTrue();
        command.NotifyOnUse.Should().BeTrue();
    }
}

#endregion

#region UpdateBreakGlassAccountCommand Tests

public class UpdateBreakGlassAccountCommandTests
{
    [Fact]
    public void UpdateBreakGlassAccountCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateBreakGlassAccountCommand
        {
            TenantId = Guid.NewGuid(),
            AccountId = Guid.NewGuid(),
            Name = "Updated Emergency Account",
            Description = "Updated description"
        };

        // Assert
        command.AccountId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated Emergency Account");
    }
}

#endregion

#region DeleteBreakGlassAccountCommand Tests

public class DeleteBreakGlassAccountCommandTests
{
    [Fact]
    public void DeleteBreakGlassAccountCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var accountId = Guid.NewGuid();
        var command = new DeleteBreakGlassAccountCommand
        {
            TenantId = Guid.NewGuid(),
            AccountId = accountId
        };

        // Assert
        command.AccountId.Should().Be(accountId);
    }
}

#endregion

#region RevokePrivilegedSessionCommand Tests

public class RevokePrivilegedSessionCommandTests
{
    [Fact]
    public void RevokePrivilegedSessionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokePrivilegedSessionCommand
        {
            TenantId = Guid.NewGuid(),
            SessionId = Guid.NewGuid(),
            RevokedBy = Guid.NewGuid(),
            Reason = "Suspicious activity"
        };

        // Assert
        command.Reason.Should().Be("Suspicious activity");
    }
}

#endregion

#region GetActiveJitGrantsQuery Tests

public class GetActiveJitGrantsQueryTests
{
    [Fact]
    public void GetActiveJitGrantsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetActiveJitGrantsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ResourceType = "Database"
        };

        // Assert
        query.UserId.Should().NotBeEmpty();
        query.ResourceType.Should().Be("Database");
    }
}

#endregion

#region GetBreakGlassAccountsQuery Tests

public class GetBreakGlassAccountsQueryTests
{
    [Fact]
    public void GetBreakGlassAccountsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetBreakGlassAccountsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region GetPrivilegedSessionsQuery Tests

public class GetPrivilegedSessionsQueryTests
{
    [Fact]
    public void GetPrivilegedSessionsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetPrivilegedSessionsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Status = (int)PrivilegedSessionStatus.Active,
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow
        };

        // Assert
        query.Status.Should().Be((int)PrivilegedSessionStatus.Active);
    }
}

#endregion

#region GetPrivilegedAccessDashboardQuery Tests

public class GetPrivilegedAccessDashboardQueryTests
{
    [Fact]
    public void GetPrivilegedAccessDashboardQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var query = new GetPrivilegedAccessDashboardQuery
        {
            TenantId = Guid.NewGuid()
        };

        // Assert
        query.TenantId.Should().NotBeEmpty();
    }
}

#endregion

#region JitGrant Entity Tests

public class JitGrantEntityTests
{
    [Fact]
    public void JitGrant_ShouldBeCreatedWithPendingStatus()
    {
        // Arrange & Act
        var grant = new JitGrant(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database",
            Guid.NewGuid(),
            "justification",
            60);

        // Assert
        grant.Status.Should().Be(JitGrantStatus.Pending);
        grant.DurationMinutes.Should().Be(60);
    }

    [Fact]
    public void JitGrant_Approve_ShouldChangeStatusToActive()
    {
        // Arrange
        var grant = new JitGrant(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database",
            Guid.NewGuid(),
            "justification",
            60);

        // Act
        grant.Approve(Guid.NewGuid(), "Approved");

        // Assert
        grant.Status.Should().Be(JitGrantStatus.Active);
        grant.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void JitGrant_Reject_ShouldChangeStatusToRejected()
    {
        // Arrange
        var grant = new JitGrant(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database",
            Guid.NewGuid(),
            "justification",
            60);

        // Act
        grant.Reject(Guid.NewGuid(), "Not justified");

        // Assert
        grant.Status.Should().Be(JitGrantStatus.Rejected);
    }

    [Fact]
    public void JitGrant_Revoke_ShouldChangeStatusToRevoked()
    {
        // Arrange
        var grant = new JitGrant(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database",
            Guid.NewGuid(),
            "justification",
            60);
        grant.Approve(Guid.NewGuid(), "OK");

        // Act
        grant.Revoke(Guid.NewGuid(), "No longer needed");

        // Assert
        grant.Status.Should().Be(JitGrantStatus.Revoked);
    }

    [Fact]
    public void JitGrant_Expire_ShouldChangeStatusToExpired()
    {
        // Arrange
        var grant = new JitGrant(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database",
            Guid.NewGuid(),
            "justification",
            60);
        grant.Approve(Guid.NewGuid(), "OK");

        // Act
        grant.Expire();

        // Assert
        grant.Status.Should().Be(JitGrantStatus.Expired);
    }
}

#endregion

#region BreakGlassAccount Entity Tests

public class BreakGlassAccountEntityTests
{
    [Fact]
    public void BreakGlassAccount_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var account = new BreakGlassAccount(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Emergency Admin",
            "Description",
            Guid.NewGuid());

        // Assert
        account.Name.Should().Be("Emergency Admin");
        account.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void BreakGlassAccount_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var account = new BreakGlassAccount(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Account",
            "Desc",
            Guid.NewGuid());

        // Act
        account.Disable();

        // Assert
        account.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void BreakGlassAccount_RecordUsage_ShouldUpdateLastUsedAt()
    {
        // Arrange
        var account = new BreakGlassAccount(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Account",
            "Desc",
            Guid.NewGuid());

        // Act
        account.RecordUsage(Guid.NewGuid());

        // Assert
        account.LastUsedAt.Should().NotBeNull();
        account.UsageCount.Should().Be(1);
    }
}

#endregion

#region PrivilegedSession Entity Tests

public class PrivilegedSessionEntityTests
{
    [Fact]
    public void PrivilegedSession_ShouldBeCreatedWithActiveStatus()
    {
        // Arrange & Act
        var session = new PrivilegedSession(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database");

        // Assert
        session.Status.Should().Be(PrivilegedSessionStatus.Active);
    }

    [Fact]
    public void PrivilegedSession_End_ShouldChangeStatusToEnded()
    {
        // Arrange
        var session = new PrivilegedSession(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database");

        // Act
        session.End();

        // Assert
        session.Status.Should().Be(PrivilegedSessionStatus.Ended);
        session.EndedAt.Should().NotBeNull();
    }

    [Fact]
    public void PrivilegedSession_Revoke_ShouldChangeStatusToRevoked()
    {
        // Arrange
        var session = new PrivilegedSession(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Database");

        // Act
        session.Revoke(Guid.NewGuid(), "Suspicious");

        // Assert
        session.Status.Should().Be(PrivilegedSessionStatus.Revoked);
    }
}

#endregion

#region JitGrantStatus Enum Tests

public class JitGrantStatusEnumTests
{
    [Theory]
    [InlineData(JitGrantStatus.Pending)]
    [InlineData(JitGrantStatus.Active)]
    [InlineData(JitGrantStatus.Expired)]
    [InlineData(JitGrantStatus.Revoked)]
    [InlineData(JitGrantStatus.Rejected)]
    public void JitGrantStatus_ShouldHaveCorrectValues(JitGrantStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region PrivilegedSessionStatus Enum Tests

public class PrivilegedSessionStatusEnumTests
{
    [Theory]
    [InlineData(PrivilegedSessionStatus.Active)]
    [InlineData(PrivilegedSessionStatus.Ended)]
    [InlineData(PrivilegedSessionStatus.Revoked)]
    public void PrivilegedSessionStatus_ShouldHaveCorrectValues(PrivilegedSessionStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
