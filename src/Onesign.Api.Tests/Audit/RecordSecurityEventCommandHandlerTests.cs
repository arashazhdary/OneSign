using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Audit;

public class RecordSecurityEventCommandHandlerTests
{
    private readonly Mock<IAuditEventRepository> _auditEventRepositoryMock;
    private readonly Mock<ILogger<RecordSecurityEventCommandHandler>> _loggerMock;
    private readonly RecordSecurityEventCommandHandler _handler;

    public RecordSecurityEventCommandHandlerTests()
    {
        _auditEventRepositoryMock = new Mock<IAuditEventRepository>();
        _loggerMock = new Mock<ILogger<RecordSecurityEventCommandHandler>>();
        _handler = new RecordSecurityEventCommandHandler(
            _auditEventRepositoryMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidSecurityEvent_CreatesAuditEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var actorId = Guid.NewGuid();

        var command = new RecordSecurityEventCommand
        {
            TenantId = tenantId,
            ActorId = actorId,
            EventType = AuditEventType.FailedLoginAttempt,
            Description = "Failed login attempt detected",
            Severity = SecurityEventSeverity.Medium,
            IpAddress = "192.168.1.100",
            UserAgent = "Mozilla/5.0",
            GeoLocation = "US, California",
            TargetResource = "user/login",
            AttemptedAction = "authenticate",
            WasBlocked = false
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.TenantId.Should().Be(tenantId);
        result.Value.ActorId.Should().Be(actorId);
        result.Value.EventType.Should().Be(AuditEventType.FailedLoginAttempt);
        result.Value.IpAddress.Should().Be("192.168.1.100");

        _auditEventRepositoryMock.Verify(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_BuildsSecurityMetadata()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.SecurityBreach,
            Description = "Security breach detected",
            Severity = SecurityEventSeverity.Critical,
            GeoLocation = "Unknown",
            TargetResource = "/api/admin",
            AttemptedAction = "deleteAll",
            WasBlocked = true,
            CorrelationId = "corr-123",
            SessionId = "sess-456",
            DeviceFingerprint = "fp-789",
            RiskScore = 95,
            Tags = new List<string> { "critical", "breach", "admin" },
            RequiresAlert = true,
            RequiresCompliance = true,
            AdditionalMetadata = "{\"extra\":\"data\"}"
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedEvent!.Metadata.Should().NotBeNullOrEmpty();
        capturedEvent.Metadata.Should().Contain("Critical");
        capturedEvent.Metadata.Should().Contain("Unknown");
        capturedEvent.Metadata.Should().Contain("corr-123");
        capturedEvent.Metadata.Should().Contain("sess-456");
        capturedEvent.Metadata.Should().Contain("fp-789");
        capturedEvent.Metadata.Should().Contain("95");
    }

    [Theory]
    [InlineData(SecurityEventSeverity.Low)]
    [InlineData(SecurityEventSeverity.Medium)]
    [InlineData(SecurityEventSeverity.High)]
    [InlineData(SecurityEventSeverity.Critical)]
    public async Task Handle_AllSeverityLevels_CreatesSuccessfully(SecurityEventSeverity severity)
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.SuspiciousActivity,
            Description = $"Event with severity: {severity}",
            Severity = severity
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Metadata.Should().Contain(severity.ToString());
    }

    [Fact]
    public async Task Handle_RequiresAlert_TriggersAlertLogging()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.SecurityBreach,
            Description = "Critical security event",
            Severity = SecurityEventSeverity.Critical,
            RequiresAlert = true
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("SECURITY ALERT")),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_CriticalSeverity_LogsAsCritical()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.SecurityBreach,
            Description = "Critical event",
            Severity = SecurityEventSeverity.Critical
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Critical,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_HighSeverity_LogsAsError()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.UnauthorizedAccess,
            Description = "High severity event",
            Severity = SecurityEventSeverity.High
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_MediumSeverity_LogsAsWarning()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.SuspiciousActivity,
            Description = "Medium severity event",
            Severity = SecurityEventSeverity.Medium
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_LowSeverity_LogsAsInformation()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.MfaEnrolled,
            Description = "Low severity event",
            Severity = SecurityEventSeverity.Low
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithTags_IncludesInMetadata()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.AccountLockout,
            Description = "Account locked",
            Severity = SecurityEventSeverity.High,
            Tags = new List<string> { "lockout", "bruteforce", "automated" }
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedEvent!.Metadata.Should().Contain("lockout");
        capturedEvent.Metadata.Should().Contain("bruteforce");
        capturedEvent.Metadata.Should().Contain("automated");
    }

    [Fact]
    public async Task Handle_WasBlocked_IncludesInMetadata()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.RateLimitExceeded,
            Description = "Rate limit exceeded and blocked",
            Severity = SecurityEventSeverity.Medium,
            WasBlocked = true
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedEvent!.Metadata.Should().Contain("true");
    }

    [Fact]
    public async Task Handle_GeneratesUniqueEventId()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.TokenCompromised,
            Description = "Token compromised",
            Severity = SecurityEventSeverity.Critical
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedEvent!.Id.Should().NotBe(Guid.Empty);
        result.Value!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtTimestamp()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.IpBlocked,
            Description = "IP address blocked",
            Severity = SecurityEventSeverity.Medium
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        capturedEvent!.CreatedAt.Should().BeOnOrAfter(beforeTime);
        capturedEvent.CreatedAt.Should().BeOnOrBefore(afterTime);
    }

    [Theory]
    [InlineData(AuditEventType.SecurityBreach)]
    [InlineData(AuditEventType.SuspiciousActivity)]
    [InlineData(AuditEventType.FailedLoginAttempt)]
    [InlineData(AuditEventType.AccountLockout)]
    [InlineData(AuditEventType.RateLimitExceeded)]
    [InlineData(AuditEventType.UnauthorizedAccess)]
    [InlineData(AuditEventType.TokenCompromised)]
    [InlineData(AuditEventType.PrivilegeEscalation)]
    public async Task Handle_SecurityEventTypes_CreatesSuccessfully(AuditEventType eventType)
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = eventType,
            Description = $"Security event: {eventType}",
            Severity = SecurityEventSeverity.High
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.EventType.Should().Be(eventType);
    }

    [Fact]
    public async Task Handle_WithRiskScore_IncludesInMetadata()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.AnomalousPattern,
            Description = "Anomalous activity detected",
            Severity = SecurityEventSeverity.High,
            RiskScore = 87
        };

        AuditEvent? capturedEvent = null;
        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((evt, _) => capturedEvent = evt)
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedEvent!.Metadata.Should().Contain("87");
    }

    [Fact]
    public async Task Handle_NoAlertRequired_DoesNotTriggerAlertLogging()
    {
        // Arrange
        var command = new RecordSecurityEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.MfaEnrolled,
            Description = "MFA enrolled",
            Severity = SecurityEventSeverity.Low,
            RequiresAlert = false
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("SECURITY ALERT")),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
    }
}
