using FluentAssertions;
using Moq;
using Onesign.Modules.Extensibility.Application.Commands;
using Onesign.Modules.Extensibility.Application.Handlers;
using Onesign.Modules.Extensibility.Application.Queries;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;

namespace Onesign.Api.Tests.Extensibility;

public class ExtensibilityHandlerTests
{
    private readonly Mock<IWebhookSubscriptionRepository> _webhookRepositoryMock;
    private readonly Mock<ILoginHookRepository> _loginHookRepositoryMock;

    public ExtensibilityHandlerTests()
    {
        _webhookRepositoryMock = new Mock<IWebhookSubscriptionRepository>();
        _loginHookRepositoryMock = new Mock<ILoginHookRepository>();
    }

    #region CreateWebhookCommandHandler Tests

    [Fact]
    public async Task CreateWebhook_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateWebhookCommandHandler(_webhookRepositoryMock.Object);

        var command = new CreateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Webhook",
            EndpointUrl = "https://example.com/webhook",
            Secret = "secret123",
            EventTypes = new List<string> { "user.created", "user.deleted" }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _webhookRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<WebhookSubscription>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateWebhook_WithEmptyName_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateWebhookCommandHandler(_webhookRepositoryMock.Object);

        var command = new CreateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            EndpointUrl = "https://example.com/webhook"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidName");
    }

    [Fact]
    public async Task CreateWebhook_WithEmptyEndpointUrl_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateWebhookCommandHandler(_webhookRepositoryMock.Object);

        var command = new CreateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Webhook",
            EndpointUrl = ""
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidEndpointUrl");
    }

    [Fact]
    public async Task CreateWebhook_SetsDefaultValues()
    {
        // Arrange
        var handler = new CreateWebhookCommandHandler(_webhookRepositoryMock.Object);

        var command = new CreateWebhookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Webhook",
            EndpointUrl = "https://example.com/webhook"
        };

        WebhookSubscription? savedWebhook = null;
        _webhookRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<WebhookSubscription>(), It.IsAny<CancellationToken>()))
            .Callback<WebhookSubscription, CancellationToken>((w, ct) => savedWebhook = w)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedWebhook.Should().NotBeNull();
        savedWebhook!.IsEnabled.Should().BeTrue();
        savedWebhook.MaxRetries.Should().Be(3);
    }

    #endregion

    #region CreateLoginHookCommandHandler Tests

    [Fact]
    public async Task CreateLoginHook_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateLoginHookCommandHandler(_loginHookRepositoryMock.Object);

        var command = new CreateLoginHookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Hook",
            Stage = "PreLogin",
            EndpointUrl = "https://example.com/hook",
            Secret = "secret123",
            TimeoutSeconds = 5,
            FailOpen = true
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _loginHookRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<LoginHook>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateLoginHook_WithEmptyName_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateLoginHookCommandHandler(_loginHookRepositoryMock.Object);

        var command = new CreateLoginHookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Stage = "PreLogin",
            EndpointUrl = "https://example.com/hook"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidName");
    }

    [Fact]
    public async Task CreateLoginHook_WithInvalidStage_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateLoginHookCommandHandler(_loginHookRepositoryMock.Object);

        var command = new CreateLoginHookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Hook",
            Stage = "InvalidStage",
            EndpointUrl = "https://example.com/hook"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidStage");
    }

    [Fact]
    public async Task CreateLoginHook_WithEmptyEndpointUrl_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateLoginHookCommandHandler(_loginHookRepositoryMock.Object);

        var command = new CreateLoginHookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Hook",
            Stage = "PreLogin",
            EndpointUrl = ""
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidEndpointUrl");
    }

    [Fact]
    public async Task CreateLoginHook_WithZeroTimeout_UsesDefault()
    {
        // Arrange
        var handler = new CreateLoginHookCommandHandler(_loginHookRepositoryMock.Object);

        var command = new CreateLoginHookCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Hook",
            Stage = "PreLogin",
            EndpointUrl = "https://example.com/hook",
            TimeoutSeconds = 0
        };

        LoginHook? savedHook = null;
        _loginHookRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<LoginHook>(), It.IsAny<CancellationToken>()))
            .Callback<LoginHook, CancellationToken>((h, ct) => savedHook = h)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedHook.Should().NotBeNull();
        savedHook!.TimeoutSeconds.Should().Be(2);
    }

    #endregion

    #region GetWebhooksQueryHandler Tests

    [Fact]
    public async Task GetWebhooks_ReturnsAllWebhooks()
    {
        // Arrange
        var handler = new GetWebhooksQueryHandler(_webhookRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var webhooks = new List<WebhookSubscription>
        {
            new WebhookSubscription { Id = Guid.NewGuid(), Name = "Webhook 1", IsEnabled = true },
            new WebhookSubscription { Id = Guid.NewGuid(), Name = "Webhook 2", IsEnabled = false }
        };

        var query = new GetWebhooksQuery { TenantId = tenantId, EnabledOnly = false };

        _webhookRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(webhooks);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetWebhooks_WithEnabledOnlyFilter_ReturnsOnlyEnabled()
    {
        // Arrange
        var handler = new GetWebhooksQueryHandler(_webhookRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var webhooks = new List<WebhookSubscription>
        {
            new WebhookSubscription { Id = Guid.NewGuid(), Name = "Webhook 1", IsEnabled = true }
        };

        var query = new GetWebhooksQuery { TenantId = tenantId, EnabledOnly = true };

        _webhookRepositoryMock
            .Setup(x => x.GetEnabledByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(webhooks);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetLoginHooksQueryHandler Tests

    [Fact]
    public async Task GetLoginHooks_ReturnsLoginHooks()
    {
        // Arrange
        var handler = new GetLoginHooksQueryHandler(_loginHookRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var hooks = new List<LoginHook>
        {
            new LoginHook { Id = Guid.NewGuid(), Name = "Hook 1", Stage = HookStage.PreLogin, IsEnabled = true },
            new LoginHook { Id = Guid.NewGuid(), Name = "Hook 2", Stage = HookStage.PostLogin, IsEnabled = false }
        };

        var query = new GetLoginHooksQuery { TenantId = tenantId };

        _loginHookRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hooks);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetLoginHooks_MapsFieldsCorrectly()
    {
        // Arrange
        var handler = new GetLoginHooksQueryHandler(_loginHookRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var hookId = Guid.NewGuid();
        var hooks = new List<LoginHook>
        {
            new LoginHook
            {
                Id = hookId,
                Name = "Test Hook",
                Stage = HookStage.PreLogin,
                EndpointUrl = "https://example.com",
                TimeoutSeconds = 5,
                FailOpen = true,
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        var query = new GetLoginHooksQuery { TenantId = tenantId };

        _loginHookRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hooks);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value![0];
        dto.Id.Should().Be(hookId);
        dto.Name.Should().Be("Test Hook");
        dto.Stage.Should().Be("PreLogin");
        dto.EndpointUrl.Should().Be("https://example.com");
        dto.TimeoutSeconds.Should().Be(5);
        dto.FailOpen.Should().BeTrue();
        dto.IsEnabled.Should().BeTrue();
    }

    #endregion
}
