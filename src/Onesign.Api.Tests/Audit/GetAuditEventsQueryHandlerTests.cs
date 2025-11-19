using FluentAssertions;
using Moq;
using Onesign.Modules.Audit.Application.Queries;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Audit;

public class GetAuditEventsQueryHandlerTests
{
    private readonly Mock<IAuditEventRepository> _auditEventRepositoryMock;
    private readonly GetAuditEventsQueryHandler _handler;

    public GetAuditEventsQueryHandlerTests()
    {
        _auditEventRepositoryMock = new Mock<IAuditEventRepository>();
        _handler = new GetAuditEventsQueryHandler(_auditEventRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedEvents()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = CreateTestEvents(tenantId, 5);

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(5);
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_AppliesPagination()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = CreateTestEvents(tenantId, 25);

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 2,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(10);
        result.TotalCount.Should().Be(25);
        result.PageNumber.Should().Be(2);
    }

    [Fact]
    public async Task Handle_FiltersByEventType()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = new List<AuditEvent>
        {
            CreateEvent(tenantId, AuditEventType.UserLogin),
            CreateEvent(tenantId, AuditEventType.UserLogin),
            CreateEvent(tenantId, AuditEventType.UserLogout),
            CreateEvent(tenantId, AuditEventType.UserCreated)
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            EventType = AuditEventType.UserLogin,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items.Should().AllSatisfy(e => e.EventType.Should().Be(AuditEventType.UserLogin));
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_FiltersByActorId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var targetActorId = Guid.NewGuid();
        var otherActorId = Guid.NewGuid();

        var events = new List<AuditEvent>
        {
            CreateEvent(tenantId, AuditEventType.UserLogin, targetActorId),
            CreateEvent(tenantId, AuditEventType.UserLogin, targetActorId),
            CreateEvent(tenantId, AuditEventType.UserLogin, otherActorId),
            CreateEvent(tenantId, AuditEventType.UserLogin, otherActorId),
            CreateEvent(tenantId, AuditEventType.UserLogin, otherActorId)
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            ActorId = targetActorId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items.Should().AllSatisfy(e => e.ActorId.Should().Be(targetActorId));
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_CombinesFilters()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var targetActorId = Guid.NewGuid();
        var otherActorId = Guid.NewGuid();

        var events = new List<AuditEvent>
        {
            CreateEvent(tenantId, AuditEventType.UserLogin, targetActorId),
            CreateEvent(tenantId, AuditEventType.UserLogout, targetActorId),
            CreateEvent(tenantId, AuditEventType.UserLogin, otherActorId),
            CreateEvent(tenantId, AuditEventType.UserUpdated, targetActorId)
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            EventType = AuditEventType.UserLogin,
            ActorId = targetActorId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().EventType.Should().Be(AuditEventType.UserLogin);
        result.Items.First().ActorId.Should().Be(targetActorId);
    }

    [Fact]
    public async Task Handle_EmptyResults_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_PassesDateFilters()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var fromDate = DateTime.UtcNow.AddDays(-7);
        var toDate = DateTime.UtcNow;

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                fromDate,
                toDate,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _auditEventRepositoryMock.Verify(x => x.GetByTenantIdAsync(
            tenantId,
            fromDate,
            toDate,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MapsAllProperties()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var actorId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddHours(-1);

        var events = new List<AuditEvent>
        {
            new()
            {
                Id = eventId,
                TenantId = tenantId,
                ActorId = actorId,
                EventType = AuditEventType.UserLogin,
                Description = "User logged in",
                Metadata = "{\"browser\":\"Chrome\"}",
                CreatedAt = createdAt,
                IpAddress = "192.168.1.1",
                UserAgent = "Mozilla/5.0"
            }
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var item = result.Items.First();
        item.Id.Should().Be(eventId);
        item.TenantId.Should().Be(tenantId);
        item.ActorId.Should().Be(actorId);
        item.EventType.Should().Be(AuditEventType.UserLogin);
        item.Description.Should().Be("User logged in");
        item.Metadata.Should().Be("{\"browser\":\"Chrome\"}");
        item.CreatedAt.Should().Be(createdAt);
        item.IpAddress.Should().Be("192.168.1.1");
        item.UserAgent.Should().Be("Mozilla/5.0");
    }

    [Fact]
    public async Task Handle_LastPage_ReturnsRemainingItems()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = CreateTestEvents(tenantId, 23);

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 3,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3); // 23 - 20 = 3 remaining
        result.TotalCount.Should().Be(23);
        result.PageNumber.Should().Be(3);
    }

    [Fact]
    public async Task Handle_PageBeyondResults_ReturnsEmpty()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = CreateTestEvents(tenantId, 5);

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 10,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(5);
    }

    [Fact]
    public async Task Handle_DefaultPagination_UsesDefaultValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = CreateTestEvents(tenantId, 20);

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId
            // Using default PageNumber = 1 and PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(10);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_FilterByNonExistentEventType_ReturnsEmpty()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = new List<AuditEvent>
        {
            CreateEvent(tenantId, AuditEventType.UserLogin),
            CreateEvent(tenantId, AuditEventType.UserLogout)
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            EventType = AuditEventType.SecurityBreach,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_NullableActorId_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var events = new List<AuditEvent>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ActorId = null, // System event with no actor
                EventType = AuditEventType.TenantCreated,
                Description = "Tenant created by system",
                CreatedAt = DateTime.UtcNow
            }
        };

        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        _auditEventRepositoryMock.Setup(x => x.GetByTenantIdAsync(
                tenantId,
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().ActorId.Should().BeNull();
    }

    #region Helper Methods

    private static List<AuditEvent> CreateTestEvents(Guid tenantId, int count)
    {
        return Enumerable.Range(0, count)
            .Select(i => CreateEvent(tenantId, AuditEventType.UserLogin))
            .ToList();
    }

    private static AuditEvent CreateEvent(
        Guid tenantId,
        AuditEventType eventType,
        Guid? actorId = null)
    {
        return new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ActorId = actorId ?? Guid.NewGuid(),
            EventType = eventType,
            Description = $"Test event: {eventType}",
            CreatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
