using FluentAssertions;
using Moq;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Application.Queries;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class SearchAuditEventsQueryHandlerTests
{
    private readonly Mock<IAuditEventRepository> _mockRepository;
    private readonly SearchAuditEventsQueryHandler _sut;

    public SearchAuditEventsQueryHandlerTests()
    {
        _mockRepository = new Mock<IAuditEventRepository>();
        _sut = new SearchAuditEventsQueryHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task Handle_WithValidFilter_ReturnsSuccessWithMappedEvents()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var filter = new AuditSearchFilterDto
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        var auditEvents = new List<AuditEvent>
        {
            new AuditEvent
            {
                Id = eventId,
                TenantId = tenantId,
                CorrelationId = "correlation-1",
                Category = AuditCategory.Authentication,
                Severity = AuditSeverity.Info,
                ActorId = "user-1",
                ActorDisplayName = "John Doe",
                ActorType = "User",
                Action = "User.Login",
                TargetType = "Session",
                TargetId = "session-1",
                IpAddress = "192.168.1.1",
                UserAgent = "Chrome",
                Country = "US",
                OccurredAt = DateTime.UtcNow,
                DataJson = "{\"browser\":\"Chrome\"}"
            }
        };

        _mockRepository
            .Setup(x => x.SearchAsync(
                tenantId,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                10,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvents);

        _mockRepository
            .Setup(x => x.CountAsync(
                tenantId,
                null,
                null,
                null,
                null,
                null,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Events.Should().HaveCount(1);
        result.Value.TotalCount.Should().Be(1);
        result.Value.PageNumber.Should().Be(1);
        result.Value.PageSize.Should().Be(10);

        var eventDto = result.Value.Events.First();
        eventDto.Id.Should().Be(eventId);
        eventDto.TenantId.Should().Be(tenantId);
        eventDto.CorrelationId.Should().Be("correlation-1");
        eventDto.Category.Should().Be(AuditCategory.Authentication);
        eventDto.Severity.Should().Be(AuditSeverity.Info);
        eventDto.ActorId.Should().Be("user-1");
        eventDto.ActorDisplayName.Should().Be("John Doe");
        eventDto.ActorType.Should().Be("User");
        eventDto.Action.Should().Be("User.Login");
        eventDto.TargetType.Should().Be("Session");
        eventDto.TargetId.Should().Be("session-1");
        eventDto.IpAddress.Should().Be("192.168.1.1");
        eventDto.UserAgent.Should().Be("Chrome");
        eventDto.Country.Should().Be("US");
        eventDto.DataJson.Should().Be("{\"browser\":\"Chrome\"}");
    }

    [Fact]
    public async Task Handle_WithAllFilters_PassesCorrectParametersToRepository()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var fromDate = DateTime.UtcNow.AddDays(-7);
        var toDate = DateTime.UtcNow;
        var category = AuditCategory.Security;
        var severity = AuditSeverity.Warning;
        var actorId = "user-123";
        var action = "Security.Alert";

        var filter = new AuditSearchFilterDto
        {
            TenantId = tenantId,
            FromDate = fromDate,
            ToDate = toDate,
            Category = category,
            Severity = severity,
            ActorId = actorId,
            Action = action,
            PageNumber = 2,
            PageSize = 25
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                tenantId,
                fromDate,
                toDate,
                category,
                severity,
                actorId,
                action,
                25,  // Skip = (2-1) * 25
                25,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                tenantId,
                fromDate,
                toDate,
                category,
                severity,
                actorId,
                action,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        _mockRepository.Verify(x => x.SearchAsync(
            tenantId,
            fromDate,
            toDate,
            category,
            severity,
            actorId,
            action,
            25,
            25,
            It.IsAny<CancellationToken>()), Times.Once);

        _mockRepository.Verify(x => x.CountAsync(
            tenantId,
            fromDate,
            toDate,
            category,
            severity,
            actorId,
            action,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyResults_ReturnsSuccessWithEmptyList()
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                10,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Events.Should().BeEmpty();
        result.Value.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithMultipleEvents_MapsAllEventsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var filter = new AuditSearchFilterDto
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 50
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        var auditEvents = new List<AuditEvent>
        {
            CreateAuditEvent(Guid.NewGuid(), tenantId, "Action1"),
            CreateAuditEvent(Guid.NewGuid(), tenantId, "Action2"),
            CreateAuditEvent(Guid.NewGuid(), tenantId, "Action3")
        };

        _mockRepository
            .Setup(x => x.SearchAsync(
                tenantId,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                50,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvents);

        _mockRepository
            .Setup(x => x.CountAsync(
                tenantId,
                null,
                null,
                null,
                null,
                null,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(3);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Events.Should().HaveCount(3);
        result.Value.TotalCount.Should().Be(3);
        result.Value.Events.Select(e => e.Action).Should().Contain(new[] { "Action1", "Action2", "Action3" });
    }

    [Theory]
    [InlineData(1, 10, 0)]
    [InlineData(2, 10, 10)]
    [InlineData(3, 10, 20)]
    [InlineData(1, 25, 0)]
    [InlineData(2, 25, 25)]
    [InlineData(5, 20, 80)]
    public async Task Handle_WithPagination_CalculatesSkipCorrectly(int pageNumber, int pageSize, int expectedSkip)
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                expectedSkip,
                pageSize,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(100);

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        _mockRepository.Verify(x => x.SearchAsync(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            expectedSkip,
            pageSize,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_PassesTokenToRepository()
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };
        var cancellationToken = new CancellationToken();

        _mockRepository
            .Setup(x => x.SearchAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                10,
                cancellationToken))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                cancellationToken))
            .ReturnsAsync(0);

        // Act
        await _sut.Handle(query, cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.SearchAsync(
            null, null, null, null, null, null, null, 0, 10, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.CountAsync(
            null, null, null, null, null, null, null, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNullCountry_MapsNullCorrectly()
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        var auditEvent = new AuditEvent
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
            Country = null,
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null, null, null, null, null, null, null, 0, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent> { auditEvent });

        _mockRepository
            .Setup(x => x.CountAsync(
                null, null, null, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Events.First().Country.Should().BeNull();
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.Billing)]
    public async Task Handle_WithCategoryFilter_PassesCategoryToRepository(AuditCategory category)
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            Category = category,
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null, null, null, category, null, null, null, 0, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null, null, null, category, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        _mockRepository.Verify(x => x.SearchAsync(
            null, null, null, category, null, null, null, 0, 10, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public async Task Handle_WithSeverityFilter_PassesSeverityToRepository(AuditSeverity severity)
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            Severity = severity,
            PageNumber = 1,
            PageSize = 10
        };

        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null, null, null, null, severity, null, null, 0, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null, null, null, null, severity, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        _mockRepository.Verify(x => x.SearchAsync(
            null, null, null, null, severity, null, null, 0, 10, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDefaultFilter_UsesDefaultPagination()
    {
        // Arrange
        var filter = new AuditSearchFilterDto(); // Uses defaults
        var query = new SearchAuditEventsQuery { Filter = filter };

        _mockRepository
            .Setup(x => x.SearchAsync(
                null, null, null, null, null, null, null, 0, 50, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditEvent>());

        _mockRepository
            .Setup(x => x.CountAsync(
                null, null, null, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Value!.PageNumber.Should().Be(1);
        result.Value.PageSize.Should().Be(50);
    }

    private static AuditEvent CreateAuditEvent(Guid id, Guid tenantId, string action)
    {
        return new AuditEvent
        {
            Id = id,
            TenantId = tenantId,
            CorrelationId = $"correlation-{id}",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user",
            ActorDisplayName = "User",
            ActorType = "User",
            Action = action,
            TargetType = "Target",
            TargetId = "target",
            IpAddress = "127.0.0.1",
            UserAgent = "Test",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };
    }
}
