using Xunit;
using Moq;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Audit.Application.Commands;

namespace Onesign.Api.Tests.Audit;

public class AuditLogServiceTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task AppendAuditEvent_ValidEvent_SavesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new AuditEventRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            EventType = AuditEventType.UserLogin,
            Action = "Login",
            Resource = "Authentication",
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            Timestamp = DateTime.UtcNow,
            IsSuccess = true
        };

        // Act
        var result = await repository.AddAsync(auditEvent, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AuditEventType.UserLogin, result.EventType);
        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task GetAuditEventsByTenant_ReturnsEvents()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new AuditEventRepository(context);
        var tenantId = Guid.NewGuid();

        for (int i = 0; i < 5; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                EventType = AuditEventType.UserLogin,
                Action = $"Action {i}",
                Resource = "Resource",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = DateTime.UtcNow.AddMinutes(-i),
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Act
        var events = await repository.GetByTenantIdAsync(tenantId, 1, 10, CancellationToken.None);

        // Assert
        Assert.NotNull(events);
        Assert.Equal(5, events.Count());
    }

    [Fact]
    public async Task GetAuditEventsByUser_ReturnsUserEvents()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new AuditEventRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Create events for the user
        for (int i = 0; i < 3; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                EventType = AuditEventType.UserLogin,
                Action = $"User Action {i}",
                Resource = "Resource",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = DateTime.UtcNow.AddMinutes(-i),
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Create events for another user
        for (int i = 0; i < 2; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(), // Different user
                EventType = AuditEventType.UserLogin,
                Action = $"Other Action {i}",
                Resource = "Resource",
                IpAddress = "192.168.1.2",
                UserAgent = "Test Agent",
                Timestamp = DateTime.UtcNow.AddMinutes(-i),
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Act
        var events = await repository.GetByUserIdAsync(userId, 1, 10, CancellationToken.None);

        // Assert
        Assert.NotNull(events);
        Assert.Equal(3, events.Count());
    }

    [Fact]
    public async Task GetAuditEventsByDateRange_ReturnsFilteredEvents()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new AuditEventRepository(context);
        var tenantId = Guid.NewGuid();

        var now = DateTime.UtcNow;

        // Create old events
        for (int i = 0; i < 2; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                EventType = AuditEventType.UserLogin,
                Action = "Old Action",
                Resource = "Resource",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = now.AddDays(-10), // 10 days ago
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Create recent events
        for (int i = 0; i < 3; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                EventType = AuditEventType.UserLogin,
                Action = "Recent Action",
                Resource = "Resource",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = now.AddHours(-i), // Recent
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Act
        var startDate = now.AddDays(-1);
        var endDate = now.AddDays(1);
        var events = await repository.GetByDateRangeAsync(tenantId, startDate, endDate, 1, 10, CancellationToken.None);

        // Assert
        Assert.NotNull(events);
        Assert.Equal(3, events.Count());
    }

    [Fact]
    public async Task GetFailedLoginAttempts_ReturnsOnlyFailed()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new AuditEventRepository(context);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Create successful logins
        for (int i = 0; i < 2; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                EventType = AuditEventType.UserLogin,
                Action = "Login",
                Resource = "Authentication",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = DateTime.UtcNow.AddMinutes(-i),
                IsSuccess = true
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Create failed logins
        for (int i = 0; i < 3; i++)
        {
            var auditEvent = new AuditEvent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                EventType = AuditEventType.UserLogin,
                Action = "Login",
                Resource = "Authentication",
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent",
                Timestamp = DateTime.UtcNow.AddMinutes(-i - 10),
                IsSuccess = false
            };
            await repository.AddAsync(auditEvent, CancellationToken.None);
        }

        // Act
        var events = await repository.GetFailedLoginAttemptsAsync(userId, DateTime.UtcNow.AddHours(-1), CancellationToken.None);

        // Assert
        Assert.NotNull(events);
        Assert.Equal(3, events.Count());
        Assert.All(events, e => Assert.False(e.IsSuccess));
    }
}
