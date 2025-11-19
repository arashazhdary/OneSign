using FluentAssertions;
using Moq;
using Onesign.Modules.Observability.Application.Queries;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class GetAuditEventByIdQueryHandlerTests
{
    private readonly Mock<IAuditEventRepository> _mockRepository;
    private readonly GetAuditEventByIdQueryHandler _sut;

    public GetAuditEventByIdQueryHandlerTests()
    {
        _mockRepository = new Mock<IAuditEventRepository>();
        _sut = new GetAuditEventByIdQueryHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task Handle_WithExistingId_ReturnsSuccessWithMappedDto()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var occurredAt = DateTime.UtcNow.AddHours(-1);

        var auditEvent = new AuditEvent
        {
            Id = eventId,
            TenantId = tenantId,
            CorrelationId = "correlation-123",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user-456",
            ActorDisplayName = "John Doe",
            ActorType = "User",
            Action = "User.Login",
            TargetType = "Session",
            TargetId = "session-789",
            IpAddress = "192.168.1.100",
            UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Country = "US",
            OccurredAt = occurredAt,
            DataJson = "{\"browser\":\"Chrome\",\"os\":\"Windows\"}"
        };

        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Value.Should().NotBeNull();

        var dto = result.Value!;
        dto.Id.Should().Be(eventId);
        dto.TenantId.Should().Be(tenantId);
        dto.CorrelationId.Should().Be("correlation-123");
        dto.Category.Should().Be(AuditCategory.Authentication);
        dto.Severity.Should().Be(AuditSeverity.Info);
        dto.ActorId.Should().Be("user-456");
        dto.ActorDisplayName.Should().Be("John Doe");
        dto.ActorType.Should().Be("User");
        dto.Action.Should().Be("User.Login");
        dto.TargetType.Should().Be("Session");
        dto.TargetId.Should().Be("session-789");
        dto.IpAddress.Should().Be("192.168.1.100");
        dto.UserAgent.Should().Be("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        dto.Country.Should().Be("US");
        dto.OccurredAt.Should().Be(occurredAt);
        dto.DataJson.Should().Be("{\"browser\":\"Chrome\",\"os\":\"Windows\"}");
    }

    [Fact]
    public async Task Handle_WithNonExistingId_ReturnsFailure()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent?)null);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("AUDIT_EVENT_NOT_FOUND");
        result.ErrorMessage.Should().Be("Audit event not found");
        result.Value.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithCancellationToken_PassesTokenToRepository()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();
        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, cancellationToken))
            .ReturnsAsync((AuditEvent?)null);

        // Act
        await _sut.Handle(query, cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.GetByIdAsync(eventId, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNullTenantId_MapsNullCorrectly()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var auditEvent = new AuditEvent
        {
            Id = eventId,
            TenantId = null,
            CorrelationId = "correlation",
            Category = AuditCategory.SystemConfiguration,
            Severity = AuditSeverity.Info,
            ActorId = "system",
            ActorDisplayName = "System",
            ActorType = "System",
            Action = "System.Startup",
            TargetType = "System",
            TargetId = "system",
            IpAddress = "0.0.0.0",
            UserAgent = "System",
            Country = null,
            OccurredAt = DateTime.UtcNow,
            DataJson = "{}"
        };

        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TenantId.Should().BeNull();
        result.Value.Country.Should().BeNull();
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.ApplicationManagement)]
    [InlineData(AuditCategory.Billing)]
    [InlineData(AuditCategory.Federation)]
    [InlineData(AuditCategory.Scim)]
    [InlineData(AuditCategory.OrganizationManagement)]
    [InlineData(AuditCategory.SystemConfiguration)]
    [InlineData(AuditCategory.AccessControl)]
    public async Task Handle_WithAllCategories_MapsCorrectly(AuditCategory category)
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var auditEvent = CreateAuditEvent(eventId, category, AuditSeverity.Info);
        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public async Task Handle_WithAllSeverities_MapsCorrectly(AuditSeverity severity)
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var auditEvent = CreateAuditEvent(eventId, AuditCategory.Security, severity);
        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Severity.Should().Be(severity);
    }

    [Fact]
    public async Task Handle_WithEmptyGuid_CallsRepositoryWithEmptyGuid()
    {
        // Arrange
        var query = new GetAuditEventByIdQuery { Id = Guid.Empty };

        _mockRepository
            .Setup(x => x.GetByIdAsync(Guid.Empty, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent?)null);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        _mockRepository.Verify(x => x.GetByIdAsync(Guid.Empty, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithLargeDataJson_MapsCorrectly()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var largeJson = "{" + string.Join(",", Enumerable.Range(1, 100).Select(i => $"\"field{i}\":\"value{i}\"")) + "}";

        var auditEvent = new AuditEvent
        {
            Id = eventId,
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
            DataJson = largeJson
        };

        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.DataJson.Should().Be(largeJson);
    }

    [Fact]
    public async Task Handle_WithSpecialCharactersInFields_MapsCorrectly()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var auditEvent = new AuditEvent
        {
            Id = eventId,
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-with-special-chars-!@#$%",
            Category = AuditCategory.UserManagement,
            Severity = AuditSeverity.Info,
            ActorId = "user@example.com",
            ActorDisplayName = "John O'Brien",
            ActorType = "User",
            Action = "User.Update",
            TargetType = "User Profile",
            TargetId = "target/123",
            IpAddress = "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            UserAgent = "Mozilla/5.0 (compatible; \"Test\" Browser)",
            Country = "US",
            OccurredAt = DateTime.UtcNow,
            DataJson = "{\"message\":\"Hello\\nWorld\"}"
        };

        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ActorDisplayName.Should().Be("John O'Brien");
        result.Value.IpAddress.Should().Be("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
        result.Value.CorrelationId.Should().Be("correlation-with-special-chars-!@#$%");
    }

    [Fact]
    public async Task Handle_WithPastOccurredAt_PreservesExactDateTime()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var occurredAt = new DateTime(2020, 1, 15, 14, 30, 45, DateTimeKind.Utc);

        var auditEvent = new AuditEvent
        {
            Id = eventId,
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
            OccurredAt = occurredAt,
            DataJson = "{}"
        };

        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.OccurredAt.Should().Be(occurredAt);
    }

    [Fact]
    public async Task Handle_RepositoryCalledExactlyOnce()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var query = new GetAuditEventByIdQuery { Id = eventId };

        _mockRepository
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent?)null);

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        _mockRepository.Verify(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static AuditEvent CreateAuditEvent(Guid id, AuditCategory category, AuditSeverity severity)
    {
        return new AuditEvent
        {
            Id = id,
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation",
            Category = category,
            Severity = severity,
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
}
