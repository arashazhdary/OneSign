using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;

namespace Onesign.Api.Tests.IdentityLifecycle;

#region CreateProvisioningRuleCommand Tests

public class CreateProvisioningRuleCommandTests
{
    [Fact]
    public void CreateProvisioningRuleCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateProvisioningRuleCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Auto-provision Contractors",
            Description = "Automatically provision contractor accounts",
            TriggerType = (int)ProvisioningTriggerType.AttributeChange,
            TriggerConditions = new Dictionary<string, string>
            {
                { "attribute", "employeeType" },
                { "value", "contractor" }
            },
            Actions = new List<ProvisioningActionItem>
            {
                new ProvisioningActionItem
                {
                    Type = (int)ProvisioningActionType.AssignRole,
                    Parameters = new Dictionary<string, string> { { "roleId", "contractor-role" } }
                },
                new ProvisioningActionItem
                {
                    Type = (int)ProvisioningActionType.AssignApplication,
                    Parameters = new Dictionary<string, string> { { "appId", "contractor-app" } }
                }
            },
            Priority = 100,
            IsEnabled = true
        };

        // Assert
        command.Name.Should().Be("Auto-provision Contractors");
        command.TriggerType.Should().Be((int)ProvisioningTriggerType.AttributeChange);
        command.Actions.Should().HaveCount(2);
    }
}

#endregion

#region UpdateProvisioningRuleCommand Tests

public class UpdateProvisioningRuleCommandTests
{
    [Fact]
    public void UpdateProvisioningRuleCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateProvisioningRuleCommand
        {
            TenantId = Guid.NewGuid(),
            RuleId = Guid.NewGuid(),
            Name = "Updated Rule",
            Description = "Updated description",
            Priority = 50,
            IsEnabled = false
        };

        // Assert
        command.RuleId.Should().NotBeEmpty();
        command.Priority.Should().Be(50);
    }
}

#endregion

#region DeleteProvisioningRuleCommand Tests

public class DeleteProvisioningRuleCommandTests
{
    [Fact]
    public void DeleteProvisioningRuleCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var ruleId = Guid.NewGuid();
        var command = new DeleteProvisioningRuleCommand
        {
            TenantId = Guid.NewGuid(),
            RuleId = ruleId
        };

        // Assert
        command.RuleId.Should().Be(ruleId);
    }
}

#endregion

#region CreateDeprovisioningPolicyCommand Tests

public class CreateDeprovisioningPolicyCommandTests
{
    [Fact]
    public void CreateDeprovisioningPolicyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateDeprovisioningPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Terminated Employee Policy",
            Description = "Deprovision terminated employees",
            TriggerType = (int)DeprovisioningTriggerType.Termination,
            GracePeriodDays = 30,
            Actions = new List<DeprovisioningActionItem>
            {
                new DeprovisioningActionItem
                {
                    Type = (int)DeprovisioningActionType.DisableAccount,
                    DelayDays = 0
                },
                new DeprovisioningActionItem
                {
                    Type = (int)DeprovisioningActionType.RevokeAccess,
                    DelayDays = 7
                },
                new DeprovisioningActionItem
                {
                    Type = (int)DeprovisioningActionType.ArchiveData,
                    DelayDays = 30
                }
            },
            NotifyUser = true,
            NotifyManager = true
        };

        // Assert
        command.Name.Should().Be("Terminated Employee Policy");
        command.GracePeriodDays.Should().Be(30);
        command.Actions.Should().HaveCount(3);
    }
}

#endregion

#region ExecuteLifecycleEventCommand Tests

public class ExecuteLifecycleEventCommandTests
{
    [Fact]
    public void ExecuteLifecycleEventCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ExecuteLifecycleEventCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            EventType = (int)LifecycleEventType.Onboarding,
            Attributes = new Dictionary<string, string>
            {
                { "department", "Engineering" },
                { "location", "New York" }
            },
            TriggeredBy = Guid.NewGuid()
        };

        // Assert
        command.EventType.Should().Be((int)LifecycleEventType.Onboarding);
        command.Attributes.Should().ContainKey("department");
    }
}

#endregion

#region CreateCertificationCampaignCommand Tests

public class CreateCertificationCampaignCommandTests
{
    [Fact]
    public void CreateCertificationCampaignCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateCertificationCampaignCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Q4 Access Review",
            Description = "Quarterly access certification",
            Type = (int)CertificationCampaignType.UserAccess,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(14),
            Reviewers = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() },
            Scope = new CertificationScopeItem
            {
                IncludeAllUsers = false,
                UserFilter = "department=Finance",
                IncludeAllApplications = true
            },
            ReminderFrequencyDays = 3,
            AutoRevokeOnExpiry = true
        };

        // Assert
        command.Name.Should().Be("Q4 Access Review");
        command.Type.Should().Be((int)CertificationCampaignType.UserAccess);
        command.Reviewers.Should().HaveCount(2);
    }
}

#endregion

#region GetProvisioningRulesQuery Tests

public class GetProvisioningRulesQueryTests
{
    [Fact]
    public void GetProvisioningRulesQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetProvisioningRulesQuery
        {
            TenantId = Guid.NewGuid(),
            TriggerType = (int)ProvisioningTriggerType.UserCreation,
            IsEnabled = true
        };

        // Assert
        query.TriggerType.Should().Be((int)ProvisioningTriggerType.UserCreation);
        query.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region GetLifecycleEventsQuery Tests

public class GetLifecycleEventsQueryTests
{
    [Fact]
    public void GetLifecycleEventsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetLifecycleEventsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            EventType = (int)LifecycleEventType.RoleChange,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.EventType.Should().Be((int)LifecycleEventType.RoleChange);
    }
}

#endregion

#region GetCertificationCampaignsQuery Tests

public class GetCertificationCampaignsQueryTests
{
    [Fact]
    public void GetCertificationCampaignsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetCertificationCampaignsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)CertificationCampaignStatus.Active,
            Type = (int)CertificationCampaignType.UserAccess
        };

        // Assert
        query.Status.Should().Be((int)CertificationCampaignStatus.Active);
    }
}

#endregion

#region ProvisioningRule Entity Tests

public class ProvisioningRuleEntityTests
{
    [Fact]
    public void ProvisioningRule_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var rule = new ProvisioningRule(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Rule",
            "Description",
            ProvisioningTriggerType.UserCreation,
            100);

        // Assert
        rule.Name.Should().Be("Test Rule");
        rule.TriggerType.Should().Be(ProvisioningTriggerType.UserCreation);
        rule.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void ProvisioningRule_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var rule = new ProvisioningRule(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Rule",
            "Desc",
            ProvisioningTriggerType.UserCreation,
            100);

        // Act
        rule.Disable();

        // Assert
        rule.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void ProvisioningRule_AddAction_ShouldAddToActionsList()
    {
        // Arrange
        var rule = new ProvisioningRule(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Rule",
            "Desc",
            ProvisioningTriggerType.UserCreation,
            100);

        // Act
        rule.AddAction(ProvisioningActionType.AssignRole, new Dictionary<string, string>());
        rule.AddAction(ProvisioningActionType.SendNotification, new Dictionary<string, string>());

        // Assert
        rule.Actions.Should().HaveCount(2);
    }
}

#endregion

#region LifecycleEvent Entity Tests

public class LifecycleEventEntityTests
{
    [Fact]
    public void LifecycleEvent_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var evt = new LifecycleEvent(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            LifecycleEventType.Onboarding,
            Guid.NewGuid());

        // Assert
        evt.EventType.Should().Be(LifecycleEventType.Onboarding);
        evt.Status.Should().Be(LifecycleEventStatus.Pending);
    }

    [Fact]
    public void LifecycleEvent_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var evt = new LifecycleEvent(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            LifecycleEventType.Onboarding,
            Guid.NewGuid());

        // Act
        evt.Complete();

        // Assert
        evt.Status.Should().Be(LifecycleEventStatus.Completed);
        evt.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void LifecycleEvent_Fail_ShouldChangeStatusToFailed()
    {
        // Arrange
        var evt = new LifecycleEvent(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            LifecycleEventType.Onboarding,
            Guid.NewGuid());

        // Act
        evt.Fail("Error occurred");

        // Assert
        evt.Status.Should().Be(LifecycleEventStatus.Failed);
        evt.ErrorMessage.Should().Be("Error occurred");
    }
}

#endregion

#region CertificationCampaign Entity Tests

public class CertificationCampaignEntityTests
{
    [Fact]
    public void CertificationCampaign_ShouldBeCreatedWithDraftStatus()
    {
        // Arrange & Act
        var campaign = new CertificationCampaign(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Campaign",
            "Description",
            CertificationCampaignType.UserAccess,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(14));

        // Assert
        campaign.Status.Should().Be(CertificationCampaignStatus.Draft);
    }

    [Fact]
    public void CertificationCampaign_Start_ShouldChangeStatusToActive()
    {
        // Arrange
        var campaign = new CertificationCampaign(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Campaign",
            "Desc",
            CertificationCampaignType.UserAccess,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(14));

        // Act
        campaign.Start();

        // Assert
        campaign.Status.Should().Be(CertificationCampaignStatus.Active);
    }

    [Fact]
    public void CertificationCampaign_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var campaign = new CertificationCampaign(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Campaign",
            "Desc",
            CertificationCampaignType.UserAccess,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(14));
        campaign.Start();

        // Act
        campaign.Complete();

        // Assert
        campaign.Status.Should().Be(CertificationCampaignStatus.Completed);
    }
}

#endregion

#region ProvisioningTriggerType Enum Tests

public class ProvisioningTriggerTypeEnumTests
{
    [Theory]
    [InlineData(ProvisioningTriggerType.UserCreation)]
    [InlineData(ProvisioningTriggerType.AttributeChange)]
    [InlineData(ProvisioningTriggerType.GroupMembership)]
    [InlineData(ProvisioningTriggerType.RoleAssignment)]
    public void ProvisioningTriggerType_ShouldHaveCorrectValues(ProvisioningTriggerType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region LifecycleEventType Enum Tests

public class LifecycleEventTypeEnumTests
{
    [Theory]
    [InlineData(LifecycleEventType.Onboarding)]
    [InlineData(LifecycleEventType.Offboarding)]
    [InlineData(LifecycleEventType.Transfer)]
    [InlineData(LifecycleEventType.RoleChange)]
    [InlineData(LifecycleEventType.LeaveOfAbsence)]
    public void LifecycleEventType_ShouldHaveCorrectValues(LifecycleEventType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region CertificationCampaignStatus Enum Tests

public class CertificationCampaignStatusEnumTests
{
    [Theory]
    [InlineData(CertificationCampaignStatus.Draft)]
    [InlineData(CertificationCampaignStatus.Active)]
    [InlineData(CertificationCampaignStatus.Completed)]
    [InlineData(CertificationCampaignStatus.Cancelled)]
    public void CertificationCampaignStatus_ShouldHaveCorrectValues(CertificationCampaignStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
