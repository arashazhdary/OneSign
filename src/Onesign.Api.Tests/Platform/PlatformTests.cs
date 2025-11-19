using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Platform.Application.Commands;
using Onesign.Modules.Platform.Application.Queries;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;

namespace Onesign.Api.Tests.Platform;

#region UpdatePlatformSettingsCommand Tests

public class UpdatePlatformSettingsCommandTests
{
    [Fact]
    public void UpdatePlatformSettingsCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdatePlatformSettingsCommand
        {
            TenantId = Guid.NewGuid(),
            Settings = new Dictionary<string, string>
            {
                { "maxUsersPerTenant", "1000" },
                { "defaultSessionTimeout", "3600" },
                { "enableAuditLogging", "true" }
            }
        };

        // Assert
        command.Settings.Should().HaveCount(3);
        command.Settings.Should().ContainKey("maxUsersPerTenant");
    }
}

#endregion

#region UpdateFeatureFlagsCommand Tests

public class UpdateFeatureFlagsCommandTests
{
    [Fact]
    public void UpdateFeatureFlagsCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateFeatureFlagsCommand
        {
            TenantId = Guid.NewGuid(),
            Flags = new Dictionary<string, bool>
            {
                { "enableMfa", true },
                { "enableSso", true },
                { "enableApiKeys", false }
            }
        };

        // Assert
        command.Flags.Should().HaveCount(3);
        command.Flags["enableMfa"].Should().BeTrue();
    }
}

#endregion

#region CreateMaintenanceWindowCommand Tests

public class CreateMaintenanceWindowCommandTests
{
    [Fact]
    public void CreateMaintenanceWindowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateMaintenanceWindowCommand
        {
            TenantId = Guid.NewGuid(),
            Title = "Scheduled Maintenance",
            Description = "Database upgrade",
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            AffectedServices = new List<string> { "Authentication", "UserManagement" },
            NotifyUsers = true
        };

        // Assert
        command.Title.Should().Be("Scheduled Maintenance");
        command.AffectedServices.Should().HaveCount(2);
    }
}

#endregion

#region CancelMaintenanceWindowCommand Tests

public class CancelMaintenanceWindowCommandTests
{
    [Fact]
    public void CancelMaintenanceWindowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CancelMaintenanceWindowCommand
        {
            TenantId = Guid.NewGuid(),
            MaintenanceWindowId = Guid.NewGuid(),
            Reason = "Issue resolved without maintenance"
        };

        // Assert
        command.Reason.Should().Be("Issue resolved without maintenance");
    }
}

#endregion

#region GetPlatformSettingsQuery Tests

public class GetPlatformSettingsQueryTests
{
    [Fact]
    public void GetPlatformSettingsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetPlatformSettingsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region GetFeatureFlagsQuery Tests

public class GetFeatureFlagsQueryTests
{
    [Fact]
    public void GetFeatureFlagsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var query = new GetFeatureFlagsQuery
        {
            TenantId = Guid.NewGuid()
        };

        // Assert
        query.TenantId.Should().NotBeEmpty();
    }
}

#endregion

#region GetSystemHealthQuery Tests

public class GetSystemHealthQueryTests
{
    [Fact]
    public void GetSystemHealthQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var query = new GetSystemHealthQuery
        {
            TenantId = Guid.NewGuid(),
            IncludeDetails = true
        };

        // Assert
        query.IncludeDetails.Should().BeTrue();
    }
}

#endregion

#region GetMaintenanceWindowsQuery Tests

public class GetMaintenanceWindowsQueryTests
{
    [Fact]
    public void GetMaintenanceWindowsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetMaintenanceWindowsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)MaintenanceWindowStatus.Scheduled,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        // Assert
        query.Status.Should().Be((int)MaintenanceWindowStatus.Scheduled);
    }
}

#endregion

#region PlatformSettings Entity Tests

public class PlatformSettingsEntityTests
{
    [Fact]
    public void PlatformSettings_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var settings = new PlatformSettings(
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        settings.Settings.Should().NotBeNull();
    }

    [Fact]
    public void PlatformSettings_SetSetting_ShouldAddOrUpdateValue()
    {
        // Arrange
        var settings = new PlatformSettings(
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        settings.SetSetting("key1", "value1");
        settings.SetSetting("key2", "value2");

        // Assert
        settings.Settings.Should().HaveCount(2);
        settings.GetSetting("key1").Should().Be("value1");
    }
}

#endregion

#region FeatureFlag Entity Tests

public class FeatureFlagEntityTests
{
    [Fact]
    public void FeatureFlag_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var flag = new FeatureFlag(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "enableMfa",
            true);

        // Assert
        flag.Name.Should().Be("enableMfa");
        flag.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void FeatureFlag_Toggle_ShouldChangeState()
    {
        // Arrange
        var flag = new FeatureFlag(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "feature",
            true);

        // Act
        flag.Toggle();

        // Assert
        flag.IsEnabled.Should().BeFalse();
    }
}

#endregion

#region MaintenanceWindow Entity Tests

public class MaintenanceWindowEntityTests
{
    [Fact]
    public void MaintenanceWindow_ShouldBeCreatedWithScheduledStatus()
    {
        // Arrange & Act
        var window = new MaintenanceWindow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Maintenance",
            "Description",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(1).AddHours(2));

        // Assert
        window.Status.Should().Be(MaintenanceWindowStatus.Scheduled);
    }

    [Fact]
    public void MaintenanceWindow_Start_ShouldChangeStatusToInProgress()
    {
        // Arrange
        var window = new MaintenanceWindow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Maintenance",
            "Desc",
            DateTime.UtcNow,
            DateTime.UtcNow.AddHours(2));

        // Act
        window.Start();

        // Assert
        window.Status.Should().Be(MaintenanceWindowStatus.InProgress);
    }

    [Fact]
    public void MaintenanceWindow_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var window = new MaintenanceWindow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Maintenance",
            "Desc",
            DateTime.UtcNow,
            DateTime.UtcNow.AddHours(2));
        window.Start();

        // Act
        window.Complete();

        // Assert
        window.Status.Should().Be(MaintenanceWindowStatus.Completed);
    }

    [Fact]
    public void MaintenanceWindow_Cancel_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var window = new MaintenanceWindow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Maintenance",
            "Desc",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(1).AddHours(2));

        // Act
        window.Cancel("Not needed");

        // Assert
        window.Status.Should().Be(MaintenanceWindowStatus.Cancelled);
    }
}

#endregion

#region MaintenanceWindowStatus Enum Tests

public class MaintenanceWindowStatusEnumTests
{
    [Theory]
    [InlineData(MaintenanceWindowStatus.Scheduled)]
    [InlineData(MaintenanceWindowStatus.InProgress)]
    [InlineData(MaintenanceWindowStatus.Completed)]
    [InlineData(MaintenanceWindowStatus.Cancelled)]
    public void MaintenanceWindowStatus_ShouldHaveCorrectValues(MaintenanceWindowStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
