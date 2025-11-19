using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.AccountCenter.Application.Commands;
using Onesign.Modules.AccountCenter.Application.Queries;
using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Enums;
using Onesign.Modules.AccountCenter.Domain.Repositories;

namespace Onesign.Api.Tests.AccountCenter;

#region UpdateProfileCommand Tests

public class UpdateProfileCommandTests
{
    [Fact]
    public void UpdateProfileCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateProfileCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            DisplayName = "John D.",
            PhoneNumber = "+1234567890",
            Language = "en-US",
            Timezone = "America/New_York"
        };

        // Assert
        command.FirstName.Should().Be("John");
        command.Language.Should().Be("en-US");
    }
}

#endregion

#region ChangePasswordCommand Tests

public class ChangePasswordCommandTests
{
    [Fact]
    public void ChangePasswordCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ChangePasswordCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!"
        };

        // Assert
        command.CurrentPassword.Should().NotBeEmpty();
        command.NewPassword.Should().NotBeEmpty();
    }
}

#endregion

#region UpdateNotificationPreferencesCommand Tests

public class UpdateNotificationPreferencesCommandTests
{
    [Fact]
    public void UpdateNotificationPreferencesCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateNotificationPreferencesCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            EmailNotifications = true,
            SmsNotifications = false,
            PushNotifications = true,
            NotificationTypes = new Dictionary<string, bool>
            {
                { "security_alerts", true },
                { "login_notifications", true },
                { "marketing", false }
            }
        };

        // Assert
        command.EmailNotifications.Should().BeTrue();
        command.NotificationTypes.Should().HaveCount(3);
    }
}

#endregion

#region LinkExternalAccountCommand Tests

public class LinkExternalAccountCommandTests
{
    [Fact]
    public void LinkExternalAccountCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new LinkExternalAccountCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Provider = "google",
            ExternalId = "google-user-id-123",
            Email = "user@gmail.com"
        };

        // Assert
        command.Provider.Should().Be("google");
        command.ExternalId.Should().NotBeEmpty();
    }
}

#endregion

#region UnlinkExternalAccountCommand Tests

public class UnlinkExternalAccountCommandTests
{
    [Fact]
    public void UnlinkExternalAccountCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UnlinkExternalAccountCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Provider = "google"
        };

        // Assert
        command.Provider.Should().Be("google");
    }
}

#endregion

#region RevokeSessionCommand Tests

public class RevokeSessionCommandTests
{
    [Fact]
    public void RevokeSessionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeSessionCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            SessionId = Guid.NewGuid()
        };

        // Assert
        command.SessionId.Should().NotBeEmpty();
    }
}

#endregion

#region RevokeAllSessionsCommand Tests

public class RevokeAllSessionsCommandTests
{
    [Fact]
    public void RevokeAllSessionsCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeAllSessionsCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ExceptCurrentSession = true
        };

        // Assert
        command.ExceptCurrentSession.Should().BeTrue();
    }
}

#endregion

#region GetProfileQuery Tests

public class GetProfileQueryTests
{
    [Fact]
    public void GetProfileQuery_ShouldHaveUserId()
    {
        // Arrange & Act
        var userId = Guid.NewGuid();
        var query = new GetProfileQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = userId
        };

        // Assert
        query.UserId.Should().Be(userId);
    }
}

#endregion

#region GetActiveSessionsQuery Tests

public class GetActiveSessionsQueryTests
{
    [Fact]
    public void GetActiveSessionsQuery_ShouldHaveUserId()
    {
        // Arrange & Act
        var query = new GetActiveSessionsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Assert
        query.UserId.Should().NotBeEmpty();
    }
}

#endregion

#region GetLinkedAccountsQuery Tests

public class GetLinkedAccountsQueryTests
{
    [Fact]
    public void GetLinkedAccountsQuery_ShouldHaveUserId()
    {
        // Arrange & Act
        var query = new GetLinkedAccountsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Assert
        query.UserId.Should().NotBeEmpty();
    }
}

#endregion

#region GetSecurityOverviewQuery Tests

public class GetSecurityOverviewQueryTests
{
    [Fact]
    public void GetSecurityOverviewQuery_ShouldHaveUserId()
    {
        // Arrange & Act
        var query = new GetSecurityOverviewQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Assert
        query.UserId.Should().NotBeEmpty();
    }
}

#endregion

#region GetActivityLogQuery Tests

public class GetActivityLogQueryTests
{
    [Fact]
    public void GetActivityLogQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetActivityLogQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.PageSize.Should().Be(50);
    }
}

#endregion

#region UserProfile Entity Tests

public class UserProfileEntityTests
{
    [Fact]
    public void UserProfile_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var profile = new UserProfile(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        profile.Language.Should().Be("en-US"); // Default
        profile.Timezone.Should().Be("UTC"); // Default
    }

    [Fact]
    public void UserProfile_Update_ShouldUpdateProperties()
    {
        // Arrange
        var profile = new UserProfile(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        profile.Update("John", "Doe", "John D.", "+1234567890");

        // Assert
        profile.FirstName.Should().Be("John");
        profile.LastName.Should().Be("Doe");
        profile.DisplayName.Should().Be("John D.");
    }

    [Fact]
    public void UserProfile_SetLanguage_ShouldUpdateLanguage()
    {
        // Arrange
        var profile = new UserProfile(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        profile.SetLanguage("fa-IR");

        // Assert
        profile.Language.Should().Be("fa-IR");
    }
}

#endregion

#region ExternalAccountLink Entity Tests

public class ExternalAccountLinkEntityTests
{
    [Fact]
    public void ExternalAccountLink_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var link = new ExternalAccountLink(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "google",
            "external-id-123",
            "user@gmail.com");

        // Assert
        link.Provider.Should().Be("google");
        link.ExternalId.Should().Be("external-id-123");
    }
}

#endregion

#region NotificationPreferences Entity Tests

public class NotificationPreferencesEntityTests
{
    [Fact]
    public void NotificationPreferences_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var prefs = new NotificationPreferences(
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        prefs.EmailEnabled.Should().BeTrue(); // Default
        prefs.SmsEnabled.Should().BeFalse(); // Default
    }

    [Fact]
    public void NotificationPreferences_Update_ShouldUpdateValues()
    {
        // Arrange
        var prefs = new NotificationPreferences(
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        prefs.Update(true, true, true);

        // Assert
        prefs.EmailEnabled.Should().BeTrue();
        prefs.SmsEnabled.Should().BeTrue();
        prefs.PushEnabled.Should().BeTrue();
    }

    [Fact]
    public void NotificationPreferences_SetTypePreference_ShouldAddOrUpdatePreference()
    {
        // Arrange
        var prefs = new NotificationPreferences(
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        prefs.SetTypePreference("security_alerts", true);
        prefs.SetTypePreference("marketing", false);

        // Assert
        prefs.TypePreferences.Should().HaveCount(2);
        prefs.IsTypeEnabled("security_alerts").Should().BeTrue();
        prefs.IsTypeEnabled("marketing").Should().BeFalse();
    }
}

#endregion
