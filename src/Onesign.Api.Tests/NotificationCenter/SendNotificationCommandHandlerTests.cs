using FluentAssertions;
using Moq;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.Handlers;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.NotificationCenter;

public class SendNotificationCommandHandlerTests
{
    private readonly Mock<INotificationOutboxRepository> _outboxRepositoryMock;
    private readonly SendNotificationCommandHandler _handler;

    public SendNotificationCommandHandlerTests()
    {
        _outboxRepositoryMock = new Mock<INotificationOutboxRepository>();
        _handler = new SendNotificationCommandHandler(_outboxRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithNotificationId()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            RecipientUserId = Guid.NewGuid(),
            Subject = "Test Subject",
            Body = "Test Body",
            Priority = "Normal"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);
        capturedItem.Should().NotBeNull();
        capturedItem!.Id.Should().Be(result.Value);
    }

    [Fact]
    public async Task Handle_InvalidChannel_ReturnsFailure()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "InvalidChannel",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("Invalid channel");
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("Email", NotificationChannel.Email)]
    [InlineData("email", NotificationChannel.Email)]
    [InlineData("EMAIL", NotificationChannel.Email)]
    [InlineData("Sms", NotificationChannel.Sms)]
    [InlineData("sms", NotificationChannel.Sms)]
    [InlineData("InApp", NotificationChannel.InApp)]
    [InlineData("inapp", NotificationChannel.InApp)]
    [InlineData("Webhook", NotificationChannel.Webhook)]
    [InlineData("webhook", NotificationChannel.Webhook)]
    public async Task Handle_AllValidChannels_SetsCorrectChannel(string channelInput, NotificationChannel expectedChannel)
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = channelInput,
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(expectedChannel);
    }

    [Theory]
    [InlineData("Low", NotificationPriority.Low)]
    [InlineData("low", NotificationPriority.Low)]
    [InlineData("Normal", NotificationPriority.Normal)]
    [InlineData("normal", NotificationPriority.Normal)]
    [InlineData("High", NotificationPriority.High)]
    [InlineData("high", NotificationPriority.High)]
    [InlineData("Critical", NotificationPriority.Critical)]
    [InlineData("critical", NotificationPriority.Critical)]
    public async Task Handle_AllValidPriorities_SetsCorrectPriority(string priorityInput, NotificationPriority expectedPriority)
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body",
            Priority = priorityInput
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Priority.Should().Be(expectedPriority);
    }

    [Fact]
    public async Task Handle_InvalidPriority_DefaultsToNormal()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body",
            Priority = "InvalidPriority"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Priority.Should().Be(NotificationPriority.Normal);
    }

    [Fact]
    public async Task Handle_SetsTenantIdCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new SendNotificationCommand
        {
            TenantId = tenantId,
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public async Task Handle_SetsRecipientAddressCorrectly()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "recipient@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientAddress.Should().Be("recipient@example.com");
    }

    [Fact]
    public async Task Handle_SetsRecipientUserIdCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            RecipientUserId = userId,
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientUserId.Should().Be(userId);
    }

    [Fact]
    public async Task Handle_NullRecipientUserId_SetsToNull()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            RecipientUserId = null,
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.RecipientUserId.Should().BeNull();
    }

    [Fact]
    public async Task Handle_SetsSubjectCorrectly()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Important Notification",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().Be("Important Notification");
    }

    [Fact]
    public async Task Handle_SetsBodyCorrectly()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "This is the notification body content"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Body.Should().Be("This is the notification body content");
    }

    [Fact]
    public async Task Handle_SetsEventTypeToManualNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.EventType.Should().Be("manual.notification");
    }

    [Fact]
    public async Task Handle_SetsStatusToPending()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Status.Should().Be(DeliveryStatus.Pending);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtToCurrentTime()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        var beforeCreate = DateTime.UtcNow;

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        var afterCreate = DateTime.UtcNow;

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        capturedItem.CreatedAt.Should().BeOnOrBefore(afterCreate);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueId()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedItem.Should().NotBeNull();
        capturedItem!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_CallsRepositoryAddAsync()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        var cancellationToken = new CancellationToken();

        // Act
        await _handler.Handle(command, cancellationToken);

        // Assert
        _outboxRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptySubject_CreatesNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "",
            Body = "Test Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_EmptyBody_CreatesNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = ""
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Body.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_LongSubjectAndBody_CreatesNotification()
    {
        // Arrange
        var longSubject = new string('A', 1000);
        var longBody = new string('B', 10000);

        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = longSubject,
            Body = longBody
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().Be(longSubject);
        capturedItem.Body.Should().Be(longBody);
    }

    [Fact]
    public async Task Handle_SpecialCharactersInContent_CreatesNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test <Subject> & \"Special\" 'Characters'",
            Body = "<html><body>Test & Special</body></html>"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Subject.Should().Be("Test <Subject> & \"Special\" 'Characters'");
        capturedItem.Body.Should().Be("<html><body>Test & Special</body></html>");
    }

    [Fact]
    public async Task Handle_MultipleCalls_GeneratesUniqueIds()
    {
        // Arrange
        var ids = new List<Guid>();

        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => ids.Add(item.Id))
            .Returns(Task.CompletedTask);

        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Email",
            RecipientAddress = "test@example.com",
            Subject = "Test Subject",
            Body = "Test Body"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);
        await _handler.Handle(command, CancellationToken.None);
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        ids.Should().HaveCount(3);
        ids.Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public async Task Handle_SmsChannel_CreatesNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Sms",
            RecipientAddress = "+1234567890",
            Subject = "",
            Body = "SMS Body"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(NotificationChannel.Sms);
        capturedItem.RecipientAddress.Should().Be("+1234567890");
    }

    [Fact]
    public async Task Handle_WebhookChannel_CreatesNotification()
    {
        // Arrange
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "Webhook",
            RecipientAddress = "https://webhook.example.com/notify",
            Subject = "Webhook Event",
            Body = "{\"event\": \"test\"}"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(NotificationChannel.Webhook);
        capturedItem.RecipientAddress.Should().Be("https://webhook.example.com/notify");
    }

    [Fact]
    public async Task Handle_InAppChannel_CreatesNotification()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new SendNotificationCommand
        {
            TenantId = Guid.NewGuid(),
            Channel = "InApp",
            RecipientAddress = userId.ToString(),
            RecipientUserId = userId,
            Subject = "In-App Notification",
            Body = "You have a new message"
        };

        NotificationOutboxItem? capturedItem = null;
        _outboxRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationOutboxItem>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationOutboxItem, CancellationToken>((item, _) => capturedItem = item)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedItem.Should().NotBeNull();
        capturedItem!.Channel.Should().Be(NotificationChannel.InApp);
        capturedItem.RecipientUserId.Should().Be(userId);
    }
}
