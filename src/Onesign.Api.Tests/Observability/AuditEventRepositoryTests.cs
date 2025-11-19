using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;
using Onesign.Modules.Observability.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditEventRepositoryTests : IDisposable
{
    private readonly DbContext _dbContext;
    private readonly AuditEventRepository _sut;

    public AuditEventRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new TestDbContext(options);
        _sut = new AuditEventRepository(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAuditEvent()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var entity = CreateAuditEventEntity(eventId);
        await _dbContext.Set<AuditEventEntity>().AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.GetByIdAsync(eventId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(eventId);
        result.TenantId.Should().Be(entity.TenantId);
        result.Category.Should().Be(entity.Category);
        result.Severity.Should().Be(entity.Severity);
        result.Action.Should().Be(entity.Action);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _sut.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WithCancellationToken_PassesTokenCorrectly()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var entity = CreateAuditEventEntity(eventId);
        await _dbContext.Set<AuditEventEntity>().AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        var cancellationToken = new CancellationToken();

        // Act
        var result = await _sut.GetByIdAsync(eventId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
    }

    #endregion

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_WithValidAuditEvent_AddsToDatabase()
    {
        // Arrange
        var auditEvent = CreateAuditEvent();

        // Act
        var result = await _sut.AddAsync(auditEvent);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(auditEvent.Id);

        var dbEntity = await _dbContext.Set<AuditEventEntity>().FindAsync(auditEvent.Id);
        dbEntity.Should().NotBeNull();
        dbEntity!.Action.Should().Be(auditEvent.Action);
    }

    [Fact]
    public async Task AddAsync_WithCancellationToken_PassesTokenCorrectly()
    {
        // Arrange
        var auditEvent = CreateAuditEvent();
        var cancellationToken = new CancellationToken();

        // Act
        var result = await _sut.AddAsync(auditEvent, cancellationToken);

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task AddAsync_ReturnsCorrectlyMappedDomainEntity()
    {
        // Arrange
        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-test",
            Category = AuditCategory.Security,
            Severity = AuditSeverity.Critical,
            ActorId = "admin-user",
            ActorDisplayName = "Admin User",
            ActorType = "Admin",
            Action = "Security.PasswordReset",
            TargetType = "User",
            TargetId = "target-user",
            IpAddress = "10.0.0.1",
            UserAgent = "AdminTool/1.0",
            Country = "UK",
            OccurredAt = DateTime.UtcNow.AddMinutes(-10),
            DataJson = "{\"forced\":true}"
        };

        // Act
        var result = await _sut.AddAsync(auditEvent);

        // Assert
        result.Id.Should().Be(auditEvent.Id);
        result.TenantId.Should().Be(auditEvent.TenantId);
        result.CorrelationId.Should().Be(auditEvent.CorrelationId);
        result.Category.Should().Be(auditEvent.Category);
        result.Severity.Should().Be(auditEvent.Severity);
        result.ActorId.Should().Be(auditEvent.ActorId);
        result.ActorDisplayName.Should().Be(auditEvent.ActorDisplayName);
        result.ActorType.Should().Be(auditEvent.ActorType);
        result.Action.Should().Be(auditEvent.Action);
        result.TargetType.Should().Be(auditEvent.TargetType);
        result.TargetId.Should().Be(auditEvent.TargetId);
        result.IpAddress.Should().Be(auditEvent.IpAddress);
        result.UserAgent.Should().Be(auditEvent.UserAgent);
        result.Country.Should().Be(auditEvent.Country);
        result.OccurredAt.Should().Be(auditEvent.OccurredAt);
        result.DataJson.Should().Be(auditEvent.DataJson);
    }

    #endregion

    #region SearchAsync Tests

    [Fact]
    public async Task SearchAsync_WithNoFilters_ReturnsAllEvents()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid())
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task SearchAsync_WithTenantIdFilter_ReturnsFilteredEvents()
    {
        // Arrange
        var targetTenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId),
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId),
            CreateAuditEventEntity(Guid.NewGuid(), otherTenantId)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(targetTenantId, null, null, null, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.TenantId == targetTenantId);
    }

    [Fact]
    public async Task SearchAsync_WithFromDateFilter_ReturnsEventsAfterDate()
    {
        // Arrange
        var fromDate = DateTime.UtcNow.AddDays(-1);

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddHours(-12)),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddDays(-5))
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, fromDate, null, null, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.OccurredAt >= fromDate);
    }

    [Fact]
    public async Task SearchAsync_WithToDateFilter_ReturnsEventsBeforeDate()
    {
        // Arrange
        var toDate = DateTime.UtcNow.AddDays(-2);

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddDays(-3)),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddDays(-5))
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, toDate, null, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.OccurredAt <= toDate);
    }

    [Fact]
    public async Task SearchAsync_WithCategoryFilter_ReturnsFilteredEvents()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), category: AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), category: AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), category: AuditCategory.Security)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, AuditCategory.Authentication, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.Category == AuditCategory.Authentication);
    }

    [Fact]
    public async Task SearchAsync_WithSeverityFilter_ReturnsFilteredEvents()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), severity: AuditSeverity.Critical),
            CreateAuditEventEntity(Guid.NewGuid(), severity: AuditSeverity.Info),
            CreateAuditEventEntity(Guid.NewGuid(), severity: AuditSeverity.Critical)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, AuditSeverity.Critical, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.Severity == AuditSeverity.Critical);
    }

    [Fact]
    public async Task SearchAsync_WithActorIdFilter_ReturnsFilteredEvents()
    {
        // Arrange
        var targetActorId = "user-123";

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), actorId: targetActorId),
            CreateAuditEventEntity(Guid.NewGuid(), actorId: "user-456"),
            CreateAuditEventEntity(Guid.NewGuid(), actorId: targetActorId)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, null, targetActorId, null, 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.ActorId == targetActorId);
    }

    [Fact]
    public async Task SearchAsync_WithActionFilter_ReturnsFilteredEvents()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), action: "User.Login"),
            CreateAuditEventEntity(Guid.NewGuid(), action: "User.Logout"),
            CreateAuditEventEntity(Guid.NewGuid(), action: "Admin.CreateUser")
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, null, null, "User", 0, 100);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.Action.Contains("User"));
    }

    [Fact]
    public async Task SearchAsync_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var events = Enumerable.Range(1, 25)
            .Select(i => CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddMinutes(-i)))
            .ToList();

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, null, null, null, 10, 10);

        // Assert
        result.Should().HaveCount(10);
    }

    [Fact]
    public async Task SearchAsync_OrdersByOccurredAtDescending()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddHours(-2)),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddHours(-1))
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(null, null, null, null, null, null, null, 0, 100);

        // Assert
        result.Should().BeInDescendingOrder(e => e.OccurredAt);
    }

    [Fact]
    public async Task SearchAsync_WithMultipleFilters_AppliesAllFilters()
    {
        // Arrange
        var targetTenantId = Guid.NewGuid();
        var fromDate = DateTime.UtcNow.AddDays(-1);

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId, DateTime.UtcNow, AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId, DateTime.UtcNow.AddDays(-5), AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId, DateTime.UtcNow, AuditCategory.Security)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.SearchAsync(targetTenantId, fromDate, null, AuditCategory.Authentication, null, null, null, 0, 100);

        // Assert
        result.Should().HaveCount(1);
    }

    #endregion

    #region CountAsync Tests

    [Fact]
    public async Task CountAsync_WithNoFilters_ReturnsAllCount()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid())
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, null, null, null);

        // Assert
        result.Should().Be(3);
    }

    [Fact]
    public async Task CountAsync_WithTenantIdFilter_ReturnsFilteredCount()
    {
        // Arrange
        var targetTenantId = Guid.NewGuid();

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId),
            CreateAuditEventEntity(Guid.NewGuid(), targetTenantId),
            CreateAuditEventEntity(Guid.NewGuid(), Guid.NewGuid())
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(targetTenantId, null, null, null, null, null, null);

        // Assert
        result.Should().Be(2);
    }

    [Fact]
    public async Task CountAsync_WithFromDateFilter_ReturnsFilteredCount()
    {
        // Arrange
        var fromDate = DateTime.UtcNow.AddDays(-1);

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddDays(-5))
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, fromDate, null, null, null, null, null);

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithToDateFilter_ReturnsFilteredCount()
    {
        // Arrange
        var toDate = DateTime.UtcNow.AddDays(-2);

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow),
            CreateAuditEventEntity(Guid.NewGuid(), occurredAt: DateTime.UtcNow.AddDays(-5))
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, toDate, null, null, null, null);

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithCategoryFilter_ReturnsFilteredCount()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), category: AuditCategory.Authentication),
            CreateAuditEventEntity(Guid.NewGuid(), category: AuditCategory.Security)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, AuditCategory.Authentication, null, null, null);

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithSeverityFilter_ReturnsFilteredCount()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), severity: AuditSeverity.Critical),
            CreateAuditEventEntity(Guid.NewGuid(), severity: AuditSeverity.Info)
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, AuditSeverity.Critical, null, null);

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithActorIdFilter_ReturnsFilteredCount()
    {
        // Arrange
        var targetActorId = "user-123";

        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), actorId: targetActorId),
            CreateAuditEventEntity(Guid.NewGuid(), actorId: "user-456")
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, null, targetActorId, null);

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithActionFilter_ReturnsFilteredCount()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid(), action: "User.Login"),
            CreateAuditEventEntity(Guid.NewGuid(), action: "Admin.CreateUser")
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, null, null, "User");

        // Assert
        result.Should().Be(1);
    }

    [Fact]
    public async Task CountAsync_WithEmptyActorId_DoesNotFilter()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid())
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, null, "", null);

        // Assert
        result.Should().Be(2);
    }

    [Fact]
    public async Task CountAsync_WithEmptyAction_DoesNotFilter()
    {
        // Arrange
        var events = new List<AuditEventEntity>
        {
            CreateAuditEventEntity(Guid.NewGuid()),
            CreateAuditEventEntity(Guid.NewGuid())
        };

        await _dbContext.Set<AuditEventEntity>().AddRangeAsync(events);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.CountAsync(null, null, null, null, null, null, "");

        // Assert
        result.Should().Be(2);
    }

    #endregion

    #region Helper Methods

    private static AuditEventEntity CreateAuditEventEntity(
        Guid id,
        Guid? tenantId = null,
        DateTime? occurredAt = null,
        AuditCategory? category = null,
        AuditSeverity? severity = null,
        string? actorId = null,
        string? action = null)
    {
        return new AuditEventEntity
        {
            Id = id,
            TenantId = tenantId ?? Guid.NewGuid(),
            CorrelationId = $"correlation-{id}",
            Category = category ?? AuditCategory.Authentication,
            Severity = severity ?? AuditSeverity.Info,
            ActorId = actorId ?? "user",
            ActorDisplayName = "User",
            ActorType = "User",
            Action = action ?? "Test.Action",
            TargetType = "Target",
            TargetId = "target",
            IpAddress = "127.0.0.1",
            UserAgent = "Test",
            OccurredAt = occurredAt ?? DateTime.UtcNow,
            DataJson = "{}"
        };
    }

    private static AuditEvent CreateAuditEvent()
    {
        return new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user",
            ActorDisplayName = "User",
            ActorType = "User",
            Action = "Test",
            TargetType = "Target",
            TargetId = "target",
            IpAddress = "127.0.0.1",
            UserAgent = "Test",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };
    }

    #endregion

    private class TestDbContext : DbContext
    {
        public TestDbContext(DbContextOptions<TestDbContext> options) : base(options)
        {
        }

        public DbSet<AuditEventEntity> AuditEvents { get; set; } = null!;
    }
}
