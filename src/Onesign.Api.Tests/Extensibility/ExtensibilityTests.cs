using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Extensibility.Application.Commands;
using Onesign.Modules.Extensibility.Application.Queries;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;

namespace Onesign.Api.Tests.Extensibility;

#region InstallExtensionCommand Tests

public class InstallExtensionCommandTests
{
    [Fact]
    public void InstallExtensionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new InstallExtensionCommand
        {
            TenantId = Guid.NewGuid(),
            ExtensionId = Guid.NewGuid(),
            Version = "1.0.0",
            Configuration = new Dictionary<string, string>
            {
                { "apiUrl", "https://api.example.com" },
                { "apiKey", "key_123" }
            },
            InstalledBy = Guid.NewGuid()
        };

        // Assert
        command.Version.Should().Be("1.0.0");
        command.Configuration.Should().ContainKey("apiUrl");
    }
}

#endregion

#region UninstallExtensionCommand Tests

public class UninstallExtensionCommandTests
{
    [Fact]
    public void UninstallExtensionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UninstallExtensionCommand
        {
            TenantId = Guid.NewGuid(),
            InstallationId = Guid.NewGuid(),
            UninstalledBy = Guid.NewGuid(),
            Reason = "No longer needed"
        };

        // Assert
        command.InstallationId.Should().NotBeEmpty();
        command.Reason.Should().Be("No longer needed");
    }
}

#endregion

#region UpdateExtensionConfigurationCommand Tests

public class UpdateExtensionConfigurationCommandTests
{
    [Fact]
    public void UpdateExtensionConfigurationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateExtensionConfigurationCommand
        {
            TenantId = Guid.NewGuid(),
            InstallationId = Guid.NewGuid(),
            Configuration = new Dictionary<string, string>
            {
                { "setting1", "value1" },
                { "setting2", "value2" }
            }
        };

        // Assert
        command.Configuration.Should().HaveCount(2);
    }
}

#endregion

#region EnableExtensionCommand Tests

public class EnableExtensionCommandTests
{
    [Fact]
    public void EnableExtensionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new EnableExtensionCommand
        {
            TenantId = Guid.NewGuid(),
            InstallationId = Guid.NewGuid()
        };

        // Assert
        command.InstallationId.Should().NotBeEmpty();
    }
}

#endregion

#region DisableExtensionCommand Tests

public class DisableExtensionCommandTests
{
    [Fact]
    public void DisableExtensionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new DisableExtensionCommand
        {
            TenantId = Guid.NewGuid(),
            InstallationId = Guid.NewGuid(),
            Reason = "Maintenance"
        };

        // Assert
        command.Reason.Should().Be("Maintenance");
    }
}

#endregion

#region RegisterExtensionCommand Tests

public class RegisterExtensionCommandTests
{
    [Fact]
    public void RegisterExtensionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RegisterExtensionCommand
        {
            Name = "Custom SIEM Integration",
            Description = "Integrates with custom SIEM system",
            Version = "2.0.0",
            Author = "Acme Corp",
            Category = (int)ExtensionCategory.Security,
            Permissions = new List<string> { "read:audit", "write:audit" },
            ConfigurationSchema = "{\"type\":\"object\"}",
            ManifestUrl = "https://extensions.example.com/siem/manifest.json"
        };

        // Assert
        command.Name.Should().Be("Custom SIEM Integration");
        command.Category.Should().Be((int)ExtensionCategory.Security);
        command.Permissions.Should().HaveCount(2);
    }
}

#endregion

#region GetAvailableExtensionsQuery Tests

public class GetAvailableExtensionsQueryTests
{
    [Fact]
    public void GetAvailableExtensionsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetAvailableExtensionsQuery
        {
            Category = (int)ExtensionCategory.Integration,
            SearchTerm = "SIEM",
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Category.Should().Be((int)ExtensionCategory.Integration);
        query.SearchTerm.Should().Be("SIEM");
    }
}

#endregion

#region GetInstalledExtensionsQuery Tests

public class GetInstalledExtensionsQueryTests
{
    [Fact]
    public void GetInstalledExtensionsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetInstalledExtensionsQuery
        {
            TenantId = tenantId,
            IsEnabled = true
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
        query.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region GetExtensionDetailsQuery Tests

public class GetExtensionDetailsQueryTests
{
    [Fact]
    public void GetExtensionDetailsQuery_ShouldHaveExtensionId()
    {
        // Arrange & Act
        var extensionId = Guid.NewGuid();
        var query = new GetExtensionDetailsQuery
        {
            ExtensionId = extensionId
        };

        // Assert
        query.ExtensionId.Should().Be(extensionId);
    }
}

#endregion

#region GetExtensionLogsQuery Tests

public class GetExtensionLogsQueryTests
{
    [Fact]
    public void GetExtensionLogsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetExtensionLogsQuery
        {
            TenantId = Guid.NewGuid(),
            InstallationId = Guid.NewGuid(),
            Level = (int)LogLevel.Error,
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 100
        };

        // Assert
        query.Level.Should().Be((int)LogLevel.Error);
    }
}

#endregion

#region Extension Entity Tests

public class ExtensionEntityTests
{
    [Fact]
    public void Extension_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var extension = new Extension(
            Guid.NewGuid(),
            "Test Extension",
            "Description",
            "1.0.0",
            "Author",
            ExtensionCategory.Integration);

        // Assert
        extension.Name.Should().Be("Test Extension");
        extension.Version.Should().Be("1.0.0");
        extension.Category.Should().Be(ExtensionCategory.Integration);
        extension.IsPublished.Should().BeFalse();
    }

    [Fact]
    public void Extension_Publish_ShouldSetIsPublishedToTrue()
    {
        // Arrange
        var extension = new Extension(
            Guid.NewGuid(),
            "Extension",
            "Desc",
            "1.0.0",
            "Author",
            ExtensionCategory.Integration);

        // Act
        extension.Publish();

        // Assert
        extension.IsPublished.Should().BeTrue();
        extension.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Extension_Unpublish_ShouldSetIsPublishedToFalse()
    {
        // Arrange
        var extension = new Extension(
            Guid.NewGuid(),
            "Extension",
            "Desc",
            "1.0.0",
            "Author",
            ExtensionCategory.Integration);
        extension.Publish();

        // Act
        extension.Unpublish();

        // Assert
        extension.IsPublished.Should().BeFalse();
    }

    [Fact]
    public void Extension_AddPermission_ShouldAddPermissionToList()
    {
        // Arrange
        var extension = new Extension(
            Guid.NewGuid(),
            "Extension",
            "Desc",
            "1.0.0",
            "Author",
            ExtensionCategory.Integration);

        // Act
        extension.AddPermission("read:users");
        extension.AddPermission("write:users");

        // Assert
        extension.Permissions.Should().HaveCount(2);
    }
}

#endregion

#region ExtensionInstallation Entity Tests

public class ExtensionInstallationEntityTests
{
    [Fact]
    public void ExtensionInstallation_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var installation = new ExtensionInstallation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "1.0.0",
            Guid.NewGuid());

        // Assert
        installation.Version.Should().Be("1.0.0");
        installation.IsEnabled.Should().BeTrue();
        installation.Status.Should().Be(InstallationStatus.Active);
    }

    [Fact]
    public void ExtensionInstallation_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var installation = new ExtensionInstallation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "1.0.0",
            Guid.NewGuid());

        // Act
        installation.Disable("Maintenance");

        // Assert
        installation.IsEnabled.Should().BeFalse();
        installation.Status.Should().Be(InstallationStatus.Disabled);
    }

    [Fact]
    public void ExtensionInstallation_Enable_ShouldSetIsEnabledToTrue()
    {
        // Arrange
        var installation = new ExtensionInstallation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "1.0.0",
            Guid.NewGuid());
        installation.Disable("Test");

        // Act
        installation.Enable();

        // Assert
        installation.IsEnabled.Should().BeTrue();
        installation.Status.Should().Be(InstallationStatus.Active);
    }

    [Fact]
    public void ExtensionInstallation_Uninstall_ShouldChangeStatus()
    {
        // Arrange
        var installation = new ExtensionInstallation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "1.0.0",
            Guid.NewGuid());

        // Act
        installation.Uninstall(Guid.NewGuid(), "No longer needed");

        // Assert
        installation.Status.Should().Be(InstallationStatus.Uninstalled);
        installation.UninstalledAt.Should().NotBeNull();
    }

    [Fact]
    public void ExtensionInstallation_UpdateConfiguration_ShouldUpdateConfig()
    {
        // Arrange
        var installation = new ExtensionInstallation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "1.0.0",
            Guid.NewGuid());

        var newConfig = new Dictionary<string, string>
        {
            { "key", "value" }
        };

        // Act
        installation.UpdateConfiguration(newConfig);

        // Assert
        installation.Configuration.Should().ContainKey("key");
    }
}

#endregion

#region ExtensionCategory Enum Tests

public class ExtensionCategoryEnumTests
{
    [Theory]
    [InlineData(ExtensionCategory.Security)]
    [InlineData(ExtensionCategory.Integration)]
    [InlineData(ExtensionCategory.Analytics)]
    [InlineData(ExtensionCategory.Automation)]
    [InlineData(ExtensionCategory.Compliance)]
    public void ExtensionCategory_ShouldHaveCorrectValues(ExtensionCategory category)
    {
        // Assert
        category.Should().BeDefined();
    }
}

#endregion

#region InstallationStatus Enum Tests

public class InstallationStatusEnumTests
{
    [Theory]
    [InlineData(InstallationStatus.Active)]
    [InlineData(InstallationStatus.Disabled)]
    [InlineData(InstallationStatus.Error)]
    [InlineData(InstallationStatus.Uninstalled)]
    [InlineData(InstallationStatus.Pending)]
    public void InstallationStatus_ShouldHaveCorrectValues(InstallationStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region LogLevel Enum Tests

public class ExtensibilityLogLevelEnumTests
{
    [Theory]
    [InlineData(LogLevel.Debug)]
    [InlineData(LogLevel.Info)]
    [InlineData(LogLevel.Warning)]
    [InlineData(LogLevel.Error)]
    [InlineData(LogLevel.Critical)]
    public void LogLevel_ShouldHaveCorrectValues(LogLevel level)
    {
        // Assert
        level.Should().BeDefined();
    }
}

#endregion
