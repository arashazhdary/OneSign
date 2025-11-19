using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

namespace Onesign.Api.Tests.Notifications;

public class NotificationServiceTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task CreateNotification_ValidNotification_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationRepository(context);
        var userId = Guid.NewGuid();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = "Welcome",
            Message = "Welcome to OneSign!",
            Type = NotificationType.Info,
            Status = NotificationStatus.Unread,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(notification, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Welcome", result.Title);
        Assert.Equal(NotificationStatus.Unread, result.Status);
    }

    [Fact]
    public async Task GetUserNotifications_ReturnsNotifications()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationRepository(context);
        var userId = Guid.NewGuid();

        for (int i = 0; i < 5; i++)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = $"Notification {i}",
                Message = $"Message {i}",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow.AddMinutes(-i)
            };
            await repository.AddAsync(notification, CancellationToken.None);
        }

        // Act
        var notifications = await repository.GetByUserIdAsync(userId, 1, 10, CancellationToken.None);

        // Assert
        Assert.NotNull(notifications);
        Assert.Equal(5, notifications.Count());
    }

    [Fact]
    public async Task MarkAsRead_ValidNotification_MarksSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationRepository(context);
        var userId = Guid.NewGuid();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = "Test",
            Message = "Test message",
            Type = NotificationType.Info,
            Status = NotificationStatus.Unread,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(notification, CancellationToken.None);

        // Act
        notification.Status = NotificationStatus.Read;
        notification.ReadAt = DateTime.UtcNow;
        await repository.UpdateAsync(notification, CancellationToken.None);

        var result = await repository.GetByIdAsync(notification.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(NotificationStatus.Read, result.Status);
        Assert.NotNull(result.ReadAt);
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsCorrectCount()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationRepository(context);
        var userId = Guid.NewGuid();

        // Create unread notifications
        for (int i = 0; i < 3; i++)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = $"Unread {i}",
                Message = $"Message {i}",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow.AddMinutes(-i)
            };
            await repository.AddAsync(notification, CancellationToken.None);
        }

        // Create read notifications
        for (int i = 0; i < 2; i++)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = $"Read {i}",
                Message = $"Message {i}",
                Type = NotificationType.Info,
                Status = NotificationStatus.Read,
                ReadAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow.AddMinutes(-i - 10)
            };
            await repository.AddAsync(notification, CancellationToken.None);
        }

        // Act
        var unreadCount = await repository.GetUnreadCountAsync(userId, CancellationToken.None);

        // Assert
        Assert.Equal(3, unreadCount);
    }

    [Fact]
    public async Task CreateNotificationTemplate_ValidTemplate_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationTemplateRepository(context);
        var tenantId = Guid.NewGuid();

        var template = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "WelcomeEmail",
            Subject = "Welcome to {{companyName}}",
            Body = "Hello {{userName}}, welcome to {{companyName}}!",
            Type = NotificationType.Info,
            Channel = NotificationChannel.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(template, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("WelcomeEmail", result.Name);
        Assert.Contains("{{userName}}", result.Body);
    }

    [Fact]
    public async Task GetActiveTemplatesByTenant_ReturnsActiveTemplates()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new NotificationTemplateRepository(context);
        var tenantId = Guid.NewGuid();

        var activeTemplate = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "ActiveTemplate",
            Subject = "Active",
            Body = "Active template body",
            Type = NotificationType.Info,
            Channel = NotificationChannel.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inactiveTemplate = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "InactiveTemplate",
            Subject = "Inactive",
            Body = "Inactive template body",
            Type = NotificationType.Info,
            Channel = NotificationChannel.Email,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(activeTemplate, CancellationToken.None);
        await repository.AddAsync(inactiveTemplate, CancellationToken.None);

        // Act
        var templates = await repository.GetActiveByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(templates);
        Assert.Single(templates);
        Assert.Equal("ActiveTemplate", templates.First().Name);
    }
}
