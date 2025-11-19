using FluentAssertions;
using Moq;
using Onesign.Modules.NotificationCenter.Application.Services;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.NotificationCenter;

public class NotificationRouterServiceTests
{
    private readonly Mock<INotificationEventSubscriptionRepository> _subscriptionRepositoryMock;
    private readonly Mock<INotificationTemplateRepository> _templateRepositoryMock;
    private readonly Mock<INotificationOutboxRepository> _outboxRepositoryMock;
    private readonly NotificationRouterService _service;

    public NotificationRouterServiceTests()
    {
        _subscriptionRepositoryMock = new Mock<INotificationEventSubscriptionRepository>();
        _templateRepositoryMock = new Mock<INotificationTemplateRepository>();
        _outboxRepositoryMock = new Mock<INotificationOutboxRepository>();

        _service = new NotificationRouterService(
            _subscriptionRepositoryMock.Object,
            _templateRepositoryMock.Object,
            _outboxRepositoryMock.Object);
    }

    [Fact]
    public async Task RouteEventAsync_WithValidSubscription_CreatesOutboxItem()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Welcome {{UserName}}",
            BodyTemplate = "Hello {{UserName}}, welcome to our platform!",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserName", "John Doe" },
            { "UserEmail", "john@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.TenantId.Should().Be(tenantId);
        capturedItem.Channel.Should().Be(NotificationChannel.Email);
        capturedItem.Priority.Should().Be(NotificationPriority.Normal);
        capturedItem.RecipientAddress.Should().Be("john@example.com");
        capturedItem.Subject.Should().Be("Welcome John Doe");
        capturedItem.Body.Should().Be("Hello John Doe, welcome to our platform!");
        capturedItem.EventType.Should().Be(eventType);
        capturedItem.Status.Should().Be(DeliveryStatus.Pending);

        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RouteEventAsync_WithTemplateNotInSubscription_FetchesFromRepository()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Welcome {{UserName}}",
            BodyTemplate = "Hello {{UserName}}!",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = null // Template not loaded in subscription
        };

        var context = new Dictionary<string, object>
        {
            { "UserName", "Jane Doe" },
            { "UserEmail", "jane@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        _templateRepositoryMock
            .Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _templateRepositoryMock.Verify(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()), Times.Once);
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RouteEventAsync_WithDisabledTemplate_SkipsNotification()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Welcome",
            BodyTemplate = "Hello",
            IsEnabled = false, // Disabled
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RouteEventAsync_WithNullTemplate_SkipsNotification()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = null
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        _templateRepositoryMock
            .Setup(r => r.GetByIdAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NotificationTemplate?)null);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RouteEventAsync_WithUserSelector_ResolvesUserEmail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "user@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientAddress.Should().Be("user@example.com");
    }

    [Fact]
    public async Task RouteEventAsync_WithManagerSelector_ResolvesManagerEmail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "access.request";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "access-request",
            Name = "Access Request",
            Category = TemplateCategory.AccessRequest,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "manager",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "ManagerEmail", "manager@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientAddress.Should().Be("manager@example.com");
    }

    [Fact]
    public async Task RouteEventAsync_WithUnknownSelector_SkipsNotification()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "unknown",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RouteEventAsync_WithMissingUserEmail_SkipsNotification()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserName", "John" } // No UserEmail
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RouteEventAsync_WithNoSubscriptions_DoesNothing()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var context = new Dictionary<string, object>();

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription>());

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RouteEventAsync_WithMultipleSubscriptions_ProcessesAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";

        var template1 = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TemplateKey = "email-template",
            Name = "Email Template",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Email Subject",
            BodyTemplate = "Email Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var template2 = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TemplateKey = "sms-template",
            Name = "SMS Template",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Sms,
            SubjectTemplate = "",
            BodyTemplate = "SMS Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscriptions = new List<NotificationEventSubscription>
        {
            new NotificationEventSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                EventType = eventType,
                Channel = NotificationChannel.Email,
                TemplateId = template1.Id,
                RecipientSelector = "user",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow,
                Template = template1
            },
            new NotificationEventSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                EventType = eventType,
                Channel = NotificationChannel.Sms,
                TemplateId = template2.Id,
                RecipientSelector = "user",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow,
                Template = template2
            }
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscriptions);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task RouteEventAsync_RendersTemplateWithContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Welcome {{FirstName}} {{LastName}}",
            BodyTemplate = "Hello {{FirstName}}, your email is {{Email}}",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "FirstName", "John" },
            { "LastName", "Doe" },
            { "Email", "john@example.com" },
            { "UserEmail", "john@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().Be("Welcome John Doe");
        capturedItem.Body.Should().Be("Hello John, your email is john@example.com");
    }

    [Fact]
    public async Task RouteEventAsync_WithUserId_SetsRecipientUserId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserId", userId },
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientUserId.Should().Be(userId);
    }

    [Fact]
    public async Task RouteEventAsync_WithoutUserId_SetsRecipientUserIdToNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientUserId.Should().BeNull();
    }

    [Fact]
    public async Task RouteEventAsync_SerializesContextToJson()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" },
            { "UserName", "John" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.ContextDataJson.Should().Contain("UserEmail");
        capturedItem.ContextDataJson.Should().Contain("test@example.com");
        capturedItem.ContextDataJson.Should().Contain("UserName");
        capturedItem.ContextDataJson.Should().Contain("John");
    }

    [Fact]
    public async Task RouteEventAsync_SetsCorrectChannel()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.InApp,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.InApp,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(NotificationChannel.InApp);
    }

    [Fact]
    public async Task RouteEventAsync_HandlesNullValueInContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            SubjectTemplate = "Welcome {{UserName}}",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = NotificationChannel.Email,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserName", null! },
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().Be("Welcome ");
    }

    [Fact]
    public async Task RouteEventAsync_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var context = new Dictionary<string, object>();
        var cancellationToken = new CancellationToken();

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, cancellationToken))
            .ReturnsAsync(new List<NotificationEventSubscription>());

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context, cancellationToken);

        // Assert
        _subscriptionRepositoryMock.Verify(r => r.GetByEventTypeAsync(tenantId, eventType, cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData(NotificationChannel.Email)]
    [InlineData(NotificationChannel.Sms)]
    [InlineData(NotificationChannel.InApp)]
    [InlineData(NotificationChannel.Webhook)]
    public async Task RouteEventAsync_SupportsAllChannels(NotificationChannel channel)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventType = "user.created";
        var templateId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = templateId,
            TenantId = tenantId,
            TemplateKey = "user-created",
            Name = "User Created",
            Category = TemplateCategory.Account,
            Channel = channel,
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = eventType,
            Channel = channel,
            TemplateId = templateId,
            RecipientSelector = "user",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            Template = template
        };

        var context = new Dictionary<string, object>
        {
            { "UserEmail", "test@example.com" }
        };

        _subscriptionRepositoryMock
            .Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationEventSubscription> { subscription });

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _service.RouteEventAsync(tenantId, eventType, context);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(channel);
    }
}
