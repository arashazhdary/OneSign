using FluentAssertions;
using Moq;
using Onesign.Modules.NotificationCenter.Application.Handlers;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.NotificationCenter;

public class GetNotificationsQueryHandlerTests
{
    private readonly Mock<INotificationOutboxRepository> _outboxRepositoryMock;
    private readonly GetNotificationsQueryHandler _handler;

    public GetNotificationsQueryHandlerTests()
    {
        _outboxRepositoryMock = new Mock<INotificationOutboxRepository>();
        _handler = new GetNotificationsQueryHandler(_outboxRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithUserIdAndNotifications_ReturnsSuccessWithDtos()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var sentAt = DateTime.UtcNow.AddMinutes(-5);

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Test Subject",
                Body = "Test Body",
                EventType = "user.created",
                Status = DeliveryStatus.Sent,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                SentAt = sentAt
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_WithoutUserId_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = null
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
        _outboxRepositoryMock.Verify(r => r.GetByRecipientAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithUserIdNoNotifications_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationOutboxItem>());

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_MapsIdCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var notificationId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = notificationId,
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Id.Should().Be(notificationId);
    }

    [Theory]
    [InlineData(NotificationChannel.Email, "Email")]
    [InlineData(NotificationChannel.Sms, "Sms")]
    [InlineData(NotificationChannel.InApp, "InApp")]
    [InlineData(NotificationChannel.Webhook, "Webhook")]
    public async Task Handle_MapsChannelCorrectly(NotificationChannel channel, string expectedChannelString)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = channel,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Channel.Should().Be(expectedChannelString);
    }

    [Fact]
    public async Task Handle_MapsRecipientAddressCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "recipient@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].RecipientAddress.Should().Be("recipient@example.com");
    }

    [Fact]
    public async Task Handle_MapsSubjectCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Important Notification Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Subject.Should().Be("Important Notification Subject");
    }

    [Fact]
    public async Task Handle_MapsBodyCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "This is the notification body content",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Body.Should().Be("This is the notification body content");
    }

    [Theory]
    [InlineData(DeliveryStatus.Pending, "Pending")]
    [InlineData(DeliveryStatus.Sent, "Sent")]
    [InlineData(DeliveryStatus.Delivered, "Delivered")]
    [InlineData(DeliveryStatus.Failed, "Failed")]
    [InlineData(DeliveryStatus.Cancelled, "Cancelled")]
    public async Task Handle_MapsStatusCorrectly(DeliveryStatus status, string expectedStatusString)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = status,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Status.Should().Be(expectedStatusString);
    }

    [Fact]
    public async Task Handle_MapsCreatedAtCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var createdAt = new DateTime(2024, 1, 15, 10, 30, 0, DateTimeKind.Utc);

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = createdAt
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_MapsSentAtCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var sentAt = new DateTime(2024, 1, 15, 10, 35, 0, DateTimeKind.Utc);

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Sent,
                CreatedAt = DateTime.UtcNow,
                SentAt = sentAt
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].SentAt.Should().Be(sentAt);
    }

    [Fact]
    public async Task Handle_NullSentAt_MapsToNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Subject",
                Body = "Body",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                SentAt = null
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].SentAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CallsRepositoryWithCorrectParameters()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationOutboxItem>());

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _outboxRepositoryMock.Verify(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, cancellationToken))
            .ReturnsAsync(new List<NotificationOutboxItem>());

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        await _handler.Handle(query, cancellationToken);

        // Assert
        _outboxRepositoryMock.Verify(r => r.GetByRecipientAsync(tenantId, userId, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleNotifications_MapsAllCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test1@example.com",
                RecipientUserId = userId,
                Subject = "Subject 1",
                Body = "Body 1",
                EventType = "event1",
                Status = DeliveryStatus.Sent,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                SentAt = DateTime.UtcNow.AddMinutes(-25)
            },
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Sms,
                Priority = NotificationPriority.High,
                RecipientAddress = "+1234567890",
                RecipientUserId = userId,
                Subject = "Subject 2",
                Body = "Body 2",
                EventType = "event2",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow.AddMinutes(-20),
                SentAt = null
            },
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.InApp,
                Priority = NotificationPriority.Low,
                RecipientAddress = userId.ToString(),
                RecipientUserId = userId,
                Subject = "Subject 3",
                Body = "Body 3",
                EventType = "event3",
                Status = DeliveryStatus.Delivered,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                SentAt = DateTime.UtcNow.AddMinutes(-9)
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);

        result.Value![0].Channel.Should().Be("Email");
        result.Value[0].Subject.Should().Be("Subject 1");
        result.Value[0].Status.Should().Be("Sent");
        result.Value[0].SentAt.Should().NotBeNull();

        result.Value[1].Channel.Should().Be("Sms");
        result.Value[1].Subject.Should().Be("Subject 2");
        result.Value[1].Status.Should().Be("Pending");
        result.Value[1].SentAt.Should().BeNull();

        result.Value[2].Channel.Should().Be("InApp");
        result.Value[2].Subject.Should().Be("Subject 3");
        result.Value[2].Status.Should().Be("Delivered");
    }

    [Fact]
    public async Task Handle_EmptyStrings_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "",
                RecipientUserId = userId,
                Subject = "",
                Body = "",
                EventType = "",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].RecipientAddress.Should().BeEmpty();
        result.Value[0].Subject.Should().BeEmpty();
        result.Value[0].Body.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_LargeNumberOfNotifications_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = Enumerable.Range(0, 100).Select(i => new NotificationOutboxItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Channel = NotificationChannel.Email,
            Priority = NotificationPriority.Normal,
            RecipientAddress = $"test{i}@example.com",
            RecipientUserId = userId,
            Subject = $"Subject {i}",
            Body = $"Body {i}",
            EventType = "test",
            Status = DeliveryStatus.Pending,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(100);
    }

    [Fact]
    public async Task Handle_SpecialCharactersInContent_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "test@example.com",
                RecipientUserId = userId,
                Subject = "Test <Subject> & \"Special\" 'Characters'",
                Body = "<html><body>Test & Special</body></html>",
                EventType = "test",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Subject.Should().Be("Test <Subject> & \"Special\" 'Characters'");
        result.Value[0].Body.Should().Be("<html><body>Test & Special</body></html>");
    }

    [Fact]
    public async Task Handle_WebhookNotification_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Webhook,
                Priority = NotificationPriority.Critical,
                RecipientAddress = "https://webhook.example.com/notify",
                RecipientUserId = userId,
                Subject = "Webhook Event",
                Body = "{\"event\": \"test\", \"data\": {}}",
                EventType = "webhook.event",
                Status = DeliveryStatus.Sent,
                CreatedAt = DateTime.UtcNow,
                SentAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Channel.Should().Be("Webhook");
        result.Value[0].RecipientAddress.Should().Be("https://webhook.example.com/notify");
        result.Value[0].Body.Should().Be("{\"event\": \"test\", \"data\": {}}");
    }

    [Fact]
    public async Task Handle_SmsNotification_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Sms,
                Priority = NotificationPriority.High,
                RecipientAddress = "+1234567890",
                RecipientUserId = userId,
                Subject = "",
                Body = "Your verification code is 123456",
                EventType = "sms.verification",
                Status = DeliveryStatus.Delivered,
                CreatedAt = DateTime.UtcNow,
                SentAt = DateTime.UtcNow
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Channel.Should().Be("Sms");
        result.Value[0].RecipientAddress.Should().Be("+1234567890");
        result.Value[0].Status.Should().Be("Delivered");
    }

    [Fact]
    public async Task Handle_FailedNotification_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var notifications = new List<NotificationOutboxItem>
        {
            new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.Normal,
                RecipientAddress = "invalid@invalid",
                RecipientUserId = userId,
                Subject = "Test",
                Body = "Test",
                EventType = "test",
                Status = DeliveryStatus.Failed,
                CreatedAt = DateTime.UtcNow,
                SentAt = null
            }
        };

        _outboxRepositoryMock
            .Setup(r => r.GetByRecipientAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Status.Should().Be("Failed");
        result.Value[0].SentAt.Should().BeNull();
    }
}
