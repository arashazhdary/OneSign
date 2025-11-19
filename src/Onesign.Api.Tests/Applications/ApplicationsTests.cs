using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Application.Queries;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Enums;
using Onesign.Modules.Applications.Domain.Repositories;

namespace Onesign.Api.Tests.Applications;

#region CreateApplicationCommand Tests

public class CreateApplicationCommandTests
{
    [Fact]
    public void CreateApplicationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "HR Portal",
            Description = "Human Resources Management System",
            Type = (int)ApplicationType.Web,
            RedirectUris = new List<string> { "https://hr.example.com/callback" },
            AllowedScopes = new List<string> { "openid", "profile", "email" },
            AllowedGrantTypes = new List<string> { "authorization_code", "refresh_token" }
        };

        // Assert
        command.Name.Should().Be("HR Portal");
        command.Type.Should().Be((int)ApplicationType.Web);
        command.RedirectUris.Should().HaveCount(1);
    }
}

#endregion

#region UpdateApplicationCommand Tests

public class UpdateApplicationCommandTests
{
    [Fact]
    public void UpdateApplicationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            Name = "Updated App",
            Description = "Updated description",
            RedirectUris = new List<string> { "https://new.example.com/callback" }
        };

        // Assert
        command.ApplicationId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated App");
    }
}

#endregion

#region DeleteApplicationCommand Tests

public class DeleteApplicationCommandTests
{
    [Fact]
    public void DeleteApplicationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var appId = Guid.NewGuid();
        var command = new DeleteApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = appId
        };

        // Assert
        command.ApplicationId.Should().Be(appId);
    }
}

#endregion

#region RegenerateClientSecretCommand Tests

public class RegenerateClientSecretCommandTests
{
    [Fact]
    public void RegenerateClientSecretCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RegenerateClientSecretCommand
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid()
        };

        // Assert
        command.ApplicationId.Should().NotBeEmpty();
    }
}

#endregion

#region AssignUserToApplicationCommand Tests

public class AssignUserToApplicationCommandTests
{
    [Fact]
    public void AssignUserToApplicationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new AssignUserToApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Roles = new List<string> { "user", "editor" }
        };

        // Assert
        command.UserId.Should().NotBeEmpty();
        command.Roles.Should().HaveCount(2);
    }
}

#endregion

#region RevokeUserFromApplicationCommand Tests

public class RevokeUserFromApplicationCommandTests
{
    [Fact]
    public void RevokeUserFromApplicationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeUserFromApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Assert
        command.ApplicationId.Should().NotBeEmpty();
        command.UserId.Should().NotBeEmpty();
    }
}

#endregion

#region GetApplicationsQuery Tests

public class GetApplicationsQueryTests
{
    [Fact]
    public void GetApplicationsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetApplicationsQuery
        {
            TenantId = Guid.NewGuid(),
            Type = (int)ApplicationType.Web,
            IsEnabled = true,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Type.Should().Be((int)ApplicationType.Web);
        query.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region GetApplicationDetailsQuery Tests

public class GetApplicationDetailsQueryTests
{
    [Fact]
    public void GetApplicationDetailsQuery_ShouldHaveApplicationId()
    {
        // Arrange & Act
        var appId = Guid.NewGuid();
        var query = new GetApplicationDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = appId
        };

        // Assert
        query.ApplicationId.Should().Be(appId);
    }
}

#endregion

#region GetApplicationUsersQuery Tests

public class GetApplicationUsersQueryTests
{
    [Fact]
    public void GetApplicationUsersQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetApplicationUsersQuery
        {
            TenantId = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.ApplicationId.Should().NotBeEmpty();
    }
}

#endregion

#region Application Entity Tests

public class ApplicationEntityTests
{
    [Fact]
    public void Application_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var app = new OnesignApplication(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test App",
            "Description",
            ApplicationType.Web,
            "client-id",
            "client-secret-hash");

        // Assert
        app.Name.Should().Be("Test App");
        app.Type.Should().Be(ApplicationType.Web);
        app.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Application_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var app = new OnesignApplication(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "App",
            "Desc",
            ApplicationType.Web,
            "client",
            "secret");

        // Act
        app.Disable();

        // Assert
        app.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void Application_Enable_ShouldSetIsEnabledToTrue()
    {
        // Arrange
        var app = new OnesignApplication(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "App",
            "Desc",
            ApplicationType.Web,
            "client",
            "secret");
        app.Disable();

        // Act
        app.Enable();

        // Assert
        app.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Application_AddRedirectUri_ShouldAddToList()
    {
        // Arrange
        var app = new OnesignApplication(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "App",
            "Desc",
            ApplicationType.Web,
            "client",
            "secret");

        // Act
        app.AddRedirectUri("https://example.com/callback");
        app.AddRedirectUri("https://example.com/callback2");

        // Assert
        app.RedirectUris.Should().HaveCount(2);
    }

    [Fact]
    public void Application_RegenerateClientSecret_ShouldUpdateSecret()
    {
        // Arrange
        var app = new OnesignApplication(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "App",
            "Desc",
            ApplicationType.Web,
            "client",
            "old-secret");

        // Act
        app.RegenerateClientSecret("new-secret");

        // Assert
        app.ClientSecretHash.Should().Be("new-secret");
    }
}

#endregion

#region ApplicationAssignment Entity Tests

public class ApplicationAssignmentEntityTests
{
    [Fact]
    public void ApplicationAssignment_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var assignment = new ApplicationAssignment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        assignment.AssignedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void ApplicationAssignment_AddRole_ShouldAddToRoles()
    {
        // Arrange
        var assignment = new ApplicationAssignment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        assignment.AddRole("admin");
        assignment.AddRole("user");

        // Assert
        assignment.Roles.Should().HaveCount(2);
    }
}

#endregion

#region ApplicationType Enum Tests

public class ApplicationTypeEnumTests
{
    [Theory]
    [InlineData(ApplicationType.Web)]
    [InlineData(ApplicationType.SPA)]
    [InlineData(ApplicationType.Native)]
    [InlineData(ApplicationType.Service)]
    public void ApplicationType_ShouldHaveCorrectValues(ApplicationType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion
