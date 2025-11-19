using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Developer.Application.Commands;
using Onesign.Modules.Developer.Application.Queries;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Domain.Repositories;

namespace Onesign.Api.Tests.Developer;

#region CreateApiKeyCommand Tests

public class CreateApiKeyCommandTests
{
    [Fact]
    public void CreateApiKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Production API Key",
            Description = "API key for production environment",
            Scopes = new List<string> { "read:users", "write:users", "read:applications" },
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            IpWhitelist = new List<string> { "10.0.0.1", "10.0.0.2" }
        };

        // Assert
        command.Name.Should().Be("Production API Key");
        command.Scopes.Should().HaveCount(3);
        command.IpWhitelist.Should().HaveCount(2);
    }
}

#endregion

#region RevokeApiKeyCommand Tests

public class RevokeApiKeyCommandTests
{
    [Fact]
    public void RevokeApiKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            ApiKeyId = Guid.NewGuid(),
            Reason = "Security concern"
        };

        // Assert
        command.ApiKeyId.Should().NotBeEmpty();
        command.Reason.Should().Be("Security concern");
    }
}

#endregion

#region UpdateApiKeyCommand Tests

public class UpdateApiKeyCommandTests
{
    [Fact]
    public void UpdateApiKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            ApiKeyId = Guid.NewGuid(),
            Name = "Updated Key Name",
            Scopes = new List<string> { "read:*" }
        };

        // Assert
        command.Name.Should().Be("Updated Key Name");
    }
}

#endregion

#region CreateWebhookCommand Tests

public class CreateWebhookCommandTests
{
    [Fact]
    public void CreateWebhookCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "User Events Webhook",
            Url = "https://api.example.com/webhooks/onesign",
            Secret = "webhook_secret_123",
            Events = new List<string> { "user.created", "user.updated", "user.deleted" },
            IsEnabled = true,
            Headers = new Dictionary<string, string>
            {
                { "X-Custom-Header", "value" }
            }
        };

        // Assert
        command.Name.Should().Be("User Events Webhook");
        command.Events.Should().HaveCount(3);
        command.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region UpdateWebhookCommand Tests

public class UpdateWebhookCommandTests
{
    [Fact]
    public void UpdateWebhookCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            WebhookId = Guid.NewGuid(),
            Name = "Updated Webhook",
            Url = "https://api.example.com/webhooks/updated",
            Events = new List<string> { "user.created" },
            IsEnabled = false
        };

        // Assert
        command.WebhookId.Should().NotBeEmpty();
        command.IsEnabled.Should().BeFalse();
    }
}

#endregion

#region DeleteWebhookCommand Tests

public class DeleteWebhookCommandTests
{
    [Fact]
    public void DeleteWebhookCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var webhookId = Guid.NewGuid();
        var command = new DeleteWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            WebhookId = webhookId
        };

        // Assert
        command.WebhookId.Should().Be(webhookId);
    }
}

#endregion

#region TestWebhookCommand Tests

public class TestWebhookCommandTests
{
    [Fact]
    public void TestWebhookCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new TestWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            WebhookId = Guid.NewGuid(),
            EventType = "user.created",
            Payload = new Dictionary<string, string>
            {
                { "userId", Guid.NewGuid().ToString() }
            }
        };

        // Assert
        command.EventType.Should().Be("user.created");
    }
}

#endregion

#region GetApiKeysQuery Tests

public class GetApiKeysQueryTests
{
    [Fact]
    public void GetApiKeysQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetApiKeysQuery
        {
            TenantId = tenantId,
            IncludeRevoked = false
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
        query.IncludeRevoked.Should().BeFalse();
    }
}

#endregion

#region GetApiKeyUsageQuery Tests

public class GetApiKeyUsageQueryTests
{
    [Fact]
    public void GetApiKeyUsageQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetApiKeyUsageQuery
        {
            TenantId = Guid.NewGuid(),
            ApiKeyId = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow
        };

        // Assert
        query.ApiKeyId.Should().NotBeEmpty();
    }
}

#endregion

#region GetWebhooksQuery Tests

public class GetWebhooksQueryTests
{
    [Fact]
    public void GetWebhooksQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetWebhooksQuery
        {
            TenantId = Guid.NewGuid(),
            IsEnabled = true
        };

        // Assert
        query.IsEnabled.Should().BeTrue();
    }
}

#endregion

#region GetWebhookDeliveriesQuery Tests

public class GetWebhookDeliveriesQueryTests
{
    [Fact]
    public void GetWebhookDeliveriesQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetWebhookDeliveriesQuery
        {
            TenantId = Guid.NewGuid(),
            WebhookId = Guid.NewGuid(),
            Status = (int)WebhookDeliveryStatus.Failed,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)WebhookDeliveryStatus.Failed);
    }
}

#endregion

#region ApiKey Entity Tests

public class ApiKeyEntityTests
{
    [Fact]
    public void ApiKey_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var apiKey = new ApiKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Key",
            "Description",
            "key_hash",
            DateTime.UtcNow.AddYears(1));

        // Assert
        apiKey.Name.Should().Be("Test Key");
        apiKey.IsActive.Should().BeTrue();
    }

    [Fact]
    public void ApiKey_Revoke_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var apiKey = new ApiKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            "Desc",
            "hash",
            DateTime.UtcNow.AddYears(1));

        // Act
        apiKey.Revoke("No longer needed");

        // Assert
        apiKey.IsActive.Should().BeFalse();
        apiKey.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public void ApiKey_AddScope_ShouldAddScopeToList()
    {
        // Arrange
        var apiKey = new ApiKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            "Desc",
            "hash",
            DateTime.UtcNow.AddYears(1));

        // Act
        apiKey.AddScope("read:users");
        apiKey.AddScope("write:users");

        // Assert
        apiKey.Scopes.Should().HaveCount(2);
    }

    [Fact]
    public void ApiKey_RecordUsage_ShouldUpdateLastUsedAt()
    {
        // Arrange
        var apiKey = new ApiKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            "Desc",
            "hash",
            DateTime.UtcNow.AddYears(1));

        // Act
        apiKey.RecordUsage();

        // Assert
        apiKey.LastUsedAt.Should().NotBeNull();
        apiKey.UsageCount.Should().Be(1);
    }
}

#endregion

#region Webhook Entity Tests

public class WebhookEntityTests
{
    [Fact]
    public void Webhook_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var webhook = new Webhook(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Webhook",
            "https://example.com/webhook",
            "secret");

        // Assert
        webhook.Name.Should().Be("Test Webhook");
        webhook.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Webhook_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var webhook = new Webhook(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Webhook",
            "https://example.com",
            "secret");

        // Act
        webhook.Disable();

        // Assert
        webhook.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void Webhook_Enable_ShouldSetIsEnabledToTrue()
    {
        // Arrange
        var webhook = new Webhook(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Webhook",
            "https://example.com",
            "secret");
        webhook.Disable();

        // Act
        webhook.Enable();

        // Assert
        webhook.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Webhook_AddEvent_ShouldAddEventToList()
    {
        // Arrange
        var webhook = new Webhook(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Webhook",
            "https://example.com",
            "secret");

        // Act
        webhook.AddEvent("user.created");
        webhook.AddEvent("user.deleted");

        // Assert
        webhook.Events.Should().HaveCount(2);
    }

    [Fact]
    public void Webhook_RecordDelivery_ShouldUpdateDeliveryStats()
    {
        // Arrange
        var webhook = new Webhook(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Webhook",
            "https://example.com",
            "secret");

        // Act
        webhook.RecordSuccessfulDelivery();
        webhook.RecordSuccessfulDelivery();
        webhook.RecordFailedDelivery();

        // Assert
        webhook.SuccessCount.Should().Be(2);
        webhook.FailureCount.Should().Be(1);
    }
}

#endregion

#region WebhookDelivery Entity Tests

public class WebhookDeliveryEntityTests
{
    [Fact]
    public void WebhookDelivery_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var delivery = new WebhookDelivery(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "user.created",
            "{\"userId\": \"123\"}");

        // Assert
        delivery.EventType.Should().Be("user.created");
        delivery.Status.Should().Be(WebhookDeliveryStatus.Pending);
    }

    [Fact]
    public void WebhookDelivery_MarkAsDelivered_ShouldUpdateStatus()
    {
        // Arrange
        var delivery = new WebhookDelivery(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "user.created",
            "{}");

        // Act
        delivery.MarkAsDelivered(200, "OK", 150);

        // Assert
        delivery.Status.Should().Be(WebhookDeliveryStatus.Delivered);
        delivery.ResponseCode.Should().Be(200);
        delivery.ResponseTimeMs.Should().Be(150);
    }

    [Fact]
    public void WebhookDelivery_MarkAsFailed_ShouldUpdateStatus()
    {
        // Arrange
        var delivery = new WebhookDelivery(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "user.created",
            "{}");

        // Act
        delivery.MarkAsFailed(500, "Internal Server Error");

        // Assert
        delivery.Status.Should().Be(WebhookDeliveryStatus.Failed);
        delivery.ResponseCode.Should().Be(500);
    }
}

#endregion

#region WebhookDeliveryStatus Enum Tests

public class WebhookDeliveryStatusEnumTests
{
    [Theory]
    [InlineData(WebhookDeliveryStatus.Pending)]
    [InlineData(WebhookDeliveryStatus.Delivered)]
    [InlineData(WebhookDeliveryStatus.Failed)]
    [InlineData(WebhookDeliveryStatus.Retrying)]
    public void WebhookDeliveryStatus_ShouldHaveCorrectValues(WebhookDeliveryStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
