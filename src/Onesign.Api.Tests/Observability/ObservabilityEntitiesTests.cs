using FluentAssertions;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class ObservabilityEntitiesTests
{
    #region AlertRule Entity Tests

    [Fact]
    public void AlertRule_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new AlertRule();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.Name.Should().BeEmpty();
        entity.Description.Should().BeEmpty();
        entity.MetricKey.Should().BeEmpty();
        entity.Threshold.Should().Be(0);
        entity.Window.Should().Be(TimeSpan.Zero);
        entity.Enabled.Should().BeFalse();
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().BeNull();
        entity.ChannelIds.Should().NotBeNull();
        entity.ChannelIds.Should().BeEmpty();
    }

    [Fact]
    public void AlertRule_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-1);
        var updatedAt = DateTime.UtcNow;
        var channelIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

        // Act
        var entity = new AlertRule
        {
            Id = id,
            TenantId = tenantId,
            Name = "Login Failure Alert",
            Description = "Alert when login failures exceed threshold",
            Type = AlertRuleType.Threshold,
            MetricKey = "Auth.LoginFailed",
            Threshold = 10,
            Window = TimeSpan.FromMinutes(5),
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            ChannelIds = channelIds
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.Name.Should().Be("Login Failure Alert");
        entity.Description.Should().Be("Alert when login failures exceed threshold");
        entity.Type.Should().Be(AlertRuleType.Threshold);
        entity.MetricKey.Should().Be("Auth.LoginFailed");
        entity.Threshold.Should().Be(10);
        entity.Window.Should().Be(TimeSpan.FromMinutes(5));
        entity.Enabled.Should().BeTrue();
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
        entity.ChannelIds.Should().HaveCount(2);
    }

    [Theory]
    [InlineData(AlertRuleType.Threshold)]
    [InlineData(AlertRuleType.EventPattern)]
    public void AlertRule_AcceptsAllRuleTypes(AlertRuleType type)
    {
        // Arrange & Act
        var entity = new AlertRule { Type = type };

        // Assert
        entity.Type.Should().Be(type);
    }

    [Fact]
    public void AlertRule_ChannelIds_CanBeModified()
    {
        // Arrange
        var entity = new AlertRule();
        var channelId = Guid.NewGuid();

        // Act
        entity.ChannelIds.Add(channelId);

        // Assert
        entity.ChannelIds.Should().Contain(channelId);
    }

    [Fact]
    public void AlertRule_Window_AcceptsVariousTimeSpans()
    {
        // Arrange & Act
        var entity1 = new AlertRule { Window = TimeSpan.FromMinutes(5) };
        var entity2 = new AlertRule { Window = TimeSpan.FromHours(1) };
        var entity3 = new AlertRule { Window = TimeSpan.FromDays(1) };

        // Assert
        entity1.Window.TotalMinutes.Should().Be(5);
        entity2.Window.TotalHours.Should().Be(1);
        entity3.Window.TotalDays.Should().Be(1);
    }

    #endregion

    #region AlertChannel Entity Tests

    [Fact]
    public void AlertChannel_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new AlertChannel();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.Name.Should().BeEmpty();
        entity.ConfigJson.Should().BeEmpty();
        entity.Enabled.Should().BeFalse();
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void AlertChannel_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-1);
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new AlertChannel
        {
            Id = id,
            TenantId = tenantId,
            Name = "Security Team Email",
            Type = AlertChannelType.Email,
            ConfigJson = "{\"emails\":[\"security@company.com\"]}",
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.Name.Should().Be("Security Team Email");
        entity.Type.Should().Be(AlertChannelType.Email);
        entity.ConfigJson.Should().Be("{\"emails\":[\"security@company.com\"]}");
        entity.Enabled.Should().BeTrue();
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Theory]
    [InlineData(AlertChannelType.Email)]
    [InlineData(AlertChannelType.Webhook)]
    public void AlertChannel_AcceptsAllChannelTypes(AlertChannelType type)
    {
        // Arrange & Act
        var entity = new AlertChannel { Type = type };

        // Assert
        entity.Type.Should().Be(type);
    }

    [Fact]
    public void AlertChannel_ConfigJson_CanContainEmailConfiguration()
    {
        // Arrange
        var config = "{\"emails\":[\"admin@test.com\",\"security@test.com\"],\"subject\":\"Alert\"}";

        // Act
        var entity = new AlertChannel
        {
            Type = AlertChannelType.Email,
            ConfigJson = config
        };

        // Assert
        entity.ConfigJson.Should().Be(config);
    }

    [Fact]
    public void AlertChannel_ConfigJson_CanContainWebhookConfiguration()
    {
        // Arrange
        var config = "{\"url\":\"https://hooks.example.com/webhook\",\"headers\":{\"Authorization\":\"Bearer token\"}}";

        // Act
        var entity = new AlertChannel
        {
            Type = AlertChannelType.Webhook,
            ConfigJson = config
        };

        // Assert
        entity.ConfigJson.Should().Be(config);
    }

    #endregion

    #region AlertNotification Entity Tests

    [Fact]
    public void AlertNotification_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new AlertNotification();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.AlertRuleId.Should().Be(Guid.Empty);
        entity.AlertChannelId.Should().Be(Guid.Empty);
        entity.Message.Should().BeEmpty();
        entity.DataJson.Should().BeEmpty();
        entity.IsRead.Should().BeFalse();
        entity.TriggeredAt.Should().Be(default);
        entity.ReadAt.Should().BeNull();
        entity.AlertRule.Should().BeNull();
        entity.AlertChannel.Should().BeNull();
    }

    [Fact]
    public void AlertNotification_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var alertRuleId = Guid.NewGuid();
        var alertChannelId = Guid.NewGuid();
        var triggeredAt = DateTime.UtcNow.AddMinutes(-30);
        var readAt = DateTime.UtcNow;

        var alertRule = new AlertRule { Id = alertRuleId };
        var alertChannel = new AlertChannel { Id = alertChannelId };

        // Act
        var entity = new AlertNotification
        {
            Id = id,
            TenantId = tenantId,
            AlertRuleId = alertRuleId,
            AlertChannelId = alertChannelId,
            Message = "Login failures exceeded threshold",
            DataJson = "{\"count\":15,\"threshold\":10}",
            IsRead = true,
            TriggeredAt = triggeredAt,
            ReadAt = readAt,
            AlertRule = alertRule,
            AlertChannel = alertChannel
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.AlertRuleId.Should().Be(alertRuleId);
        entity.AlertChannelId.Should().Be(alertChannelId);
        entity.Message.Should().Be("Login failures exceeded threshold");
        entity.DataJson.Should().Be("{\"count\":15,\"threshold\":10}");
        entity.IsRead.Should().BeTrue();
        entity.TriggeredAt.Should().Be(triggeredAt);
        entity.ReadAt.Should().Be(readAt);
        entity.AlertRule.Should().Be(alertRule);
        entity.AlertChannel.Should().Be(alertChannel);
    }

    [Fact]
    public void AlertNotification_NavigationProperties_CanBeNull()
    {
        // Arrange & Act
        var entity = new AlertNotification
        {
            Id = Guid.NewGuid(),
            AlertRule = null,
            AlertChannel = null
        };

        // Assert
        entity.AlertRule.Should().BeNull();
        entity.AlertChannel.Should().BeNull();
    }

    #endregion

    #region SavedFilter Entity Tests

    [Fact]
    public void SavedFilter_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new SavedFilter();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.UserId.Should().Be(Guid.Empty);
        entity.Name.Should().BeEmpty();
        entity.FilterJson.Should().BeEmpty();
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void SavedFilter_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-7);
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new SavedFilter
        {
            Id = id,
            TenantId = tenantId,
            UserId = userId,
            Name = "Security Events Last Week",
            FilterJson = "{\"category\":\"Security\",\"fromDate\":\"2023-01-01\"}",
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.UserId.Should().Be(userId);
        entity.Name.Should().Be("Security Events Last Week");
        entity.FilterJson.Should().Be("{\"category\":\"Security\",\"fromDate\":\"2023-01-01\"}");
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void SavedFilter_FilterJson_CanContainComplexFilter()
    {
        // Arrange
        var complexFilter = @"{
            ""tenantId"": ""123"",
            ""category"": ""Authentication"",
            ""severity"": ""Critical"",
            ""actorId"": ""user@test.com"",
            ""fromDate"": ""2023-01-01T00:00:00Z"",
            ""toDate"": ""2023-12-31T23:59:59Z""
        }";

        // Act
        var entity = new SavedFilter { FilterJson = complexFilter };

        // Assert
        entity.FilterJson.Should().Contain("Authentication");
        entity.FilterJson.Should().Contain("Critical");
    }

    #endregion

    #region LogStreamSubscription Entity Tests

    [Fact]
    public void LogStreamSubscription_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new LogStreamSubscription();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.Name.Should().BeEmpty();
        entity.TargetUrl.Should().BeEmpty();
        entity.AuthHeader.Should().BeNull();
        entity.FilterJson.Should().BeEmpty();
        entity.Enabled.Should().BeFalse();
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().BeNull();
        entity.LastPushedAt.Should().BeNull();
    }

    [Fact]
    public void LogStreamSubscription_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var updatedAt = DateTime.UtcNow.AddDays(-1);
        var lastPushedAt = DateTime.UtcNow.AddMinutes(-5);

        // Act
        var entity = new LogStreamSubscription
        {
            Id = id,
            TenantId = tenantId,
            Name = "SIEM Integration",
            Type = LogStreamType.Webhook,
            TargetUrl = "https://siem.company.com/api/events",
            AuthHeader = "Bearer secret-token",
            FilterJson = "{\"categories\":[\"Security\",\"Authentication\"],\"severity\":\"Critical\"}",
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            LastPushedAt = lastPushedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.Name.Should().Be("SIEM Integration");
        entity.Type.Should().Be(LogStreamType.Webhook);
        entity.TargetUrl.Should().Be("https://siem.company.com/api/events");
        entity.AuthHeader.Should().Be("Bearer secret-token");
        entity.FilterJson.Should().Contain("Security");
        entity.Enabled.Should().BeTrue();
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
        entity.LastPushedAt.Should().Be(lastPushedAt);
    }

    [Theory]
    [InlineData(LogStreamType.Webhook)]
    [InlineData(LogStreamType.SyslogHttpGateway)]
    public void LogStreamSubscription_AcceptsAllStreamTypes(LogStreamType type)
    {
        // Arrange & Act
        var entity = new LogStreamSubscription { Type = type };

        // Assert
        entity.Type.Should().Be(type);
    }

    [Fact]
    public void LogStreamSubscription_AuthHeader_CanBeNull()
    {
        // Arrange & Act
        var entity = new LogStreamSubscription
        {
            Id = Guid.NewGuid(),
            TargetUrl = "https://public-endpoint.com/logs",
            AuthHeader = null
        };

        // Assert
        entity.AuthHeader.Should().BeNull();
    }

    #endregion

    #region Enum Tests

    [Fact]
    public void LogStreamType_HasCorrectValues()
    {
        // Assert
        ((int)LogStreamType.Webhook).Should().Be(0);
        ((int)LogStreamType.SyslogHttpGateway).Should().Be(1);
    }

    [Fact]
    public void LogStreamType_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<LogStreamType>();

        // Assert
        values.Should().HaveCount(2);
    }

    [Fact]
    public void AlertChannelType_HasCorrectValues()
    {
        // Assert
        ((int)AlertChannelType.Email).Should().Be(0);
        ((int)AlertChannelType.Webhook).Should().Be(1);
    }

    [Fact]
    public void AlertChannelType_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<AlertChannelType>();

        // Assert
        values.Should().HaveCount(2);
    }

    [Fact]
    public void AlertRuleType_HasCorrectValues()
    {
        // Assert
        ((int)AlertRuleType.Threshold).Should().Be(0);
        ((int)AlertRuleType.EventPattern).Should().Be(1);
    }

    [Fact]
    public void AlertRuleType_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<AlertRuleType>();

        // Assert
        values.Should().HaveCount(2);
    }

    [Theory]
    [InlineData("Webhook", LogStreamType.Webhook)]
    [InlineData("SyslogHttpGateway", LogStreamType.SyslogHttpGateway)]
    public void LogStreamType_ParsesFromString(string name, LogStreamType expected)
    {
        // Act
        var parsed = Enum.Parse<LogStreamType>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    [Theory]
    [InlineData("Email", AlertChannelType.Email)]
    [InlineData("Webhook", AlertChannelType.Webhook)]
    public void AlertChannelType_ParsesFromString(string name, AlertChannelType expected)
    {
        // Act
        var parsed = Enum.Parse<AlertChannelType>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    [Theory]
    [InlineData("Threshold", AlertRuleType.Threshold)]
    [InlineData("EventPattern", AlertRuleType.EventPattern)]
    public void AlertRuleType_ParsesFromString(string name, AlertRuleType expected)
    {
        // Act
        var parsed = Enum.Parse<AlertRuleType>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    #endregion
}
