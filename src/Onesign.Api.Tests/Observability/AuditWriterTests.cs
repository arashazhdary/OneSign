using FluentAssertions;
using Moq;
using Onesign.Modules.Observability.Application.Services;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditWriterTests
{
    private readonly Mock<IAuditEventRepository> _mockRepository;
    private readonly AuditWriter _sut;

    public AuditWriterTests()
    {
        _mockRepository = new Mock<IAuditEventRepository>();
        _sut = new AuditWriter(_mockRepository.Object);
    }

    [Fact]
    public async Task WriteAsync_WithParameters_CreatesAuditEventAndSavesToRepository()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var category = AuditCategory.Authentication;
        var severity = AuditSeverity.Info;
        var action = "User.Login";
        var actorId = "user-123";
        var actorDisplayName = "John Doe";
        var actorType = "User";
        var targetType = "User";
        var targetId = "user-123";
        var ipAddress = "192.168.1.1";
        var userAgent = "Mozilla/5.0";
        var dataJson = "{\"key\":\"value\"}";

        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            tenantId,
            category,
            severity,
            action,
            actorId,
            actorDisplayName,
            actorType,
            targetType,
            targetId,
            ipAddress,
            userAgent,
            dataJson);

        // Assert
        _mockRepository.Verify(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()), Times.Once);

        capturedEvent.Should().NotBeNull();
        capturedEvent!.Id.Should().NotBeEmpty();
        capturedEvent.TenantId.Should().Be(tenantId);
        capturedEvent.CorrelationId.Should().NotBeNullOrEmpty();
        capturedEvent.Category.Should().Be(category);
        capturedEvent.Severity.Should().Be(severity);
        capturedEvent.Action.Should().Be(action);
        capturedEvent.ActorId.Should().Be(actorId);
        capturedEvent.ActorDisplayName.Should().Be(actorDisplayName);
        capturedEvent.ActorType.Should().Be(actorType);
        capturedEvent.TargetType.Should().Be(targetType);
        capturedEvent.TargetId.Should().Be(targetId);
        capturedEvent.IpAddress.Should().Be(ipAddress);
        capturedEvent.UserAgent.Should().Be(userAgent);
        capturedEvent.DataJson.Should().Be(dataJson);
        capturedEvent.OccurredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task WriteAsync_WithNullTenantId_CreatesAuditEventWithNullTenant()
    {
        // Arrange
        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            null,
            AuditCategory.Security,
            AuditSeverity.Warning,
            "System.Event",
            "system",
            "System",
            "System",
            "System",
            "system",
            "127.0.0.1",
            "System");

        // Assert
        capturedEvent.Should().NotBeNull();
        capturedEvent!.TenantId.Should().BeNull();
    }

    [Fact]
    public async Task WriteAsync_WithNullDataJson_SetsDefaultEmptyJson()
    {
        // Arrange
        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            Guid.NewGuid(),
            AuditCategory.UserManagement,
            AuditSeverity.Info,
            "User.Created",
            "admin",
            "Admin User",
            "User",
            "User",
            "new-user",
            "10.0.0.1",
            "Chrome",
            null);

        // Assert
        capturedEvent.Should().NotBeNull();
        capturedEvent!.DataJson.Should().Be("{}");
    }

    [Fact]
    public async Task WriteAsync_WithAuditEvent_SavesDirectlyToRepository()
    {
        // Arrange
        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CorrelationId = "correlation-123",
            Category = AuditCategory.Billing,
            Severity = AuditSeverity.Critical,
            ActorId = "billing-service",
            ActorDisplayName = "Billing Service",
            ActorType = "Service",
            Action = "Payment.Failed",
            TargetType = "Payment",
            TargetId = "payment-456",
            IpAddress = "0.0.0.0",
            UserAgent = "BillingService/1.0",
            OccurredAt = DateTime.UtcNow.AddMinutes(-5),
            DataJson = "{\"amount\":100}"
        };

        _mockRepository
            .Setup(x => x.AddAsync(auditEvent, It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditEvent);

        // Act
        await _sut.WriteAsync(auditEvent);

        // Assert
        _mockRepository.Verify(x => x.AddAsync(auditEvent, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task WriteAsync_WithCancellationToken_PassesTokenToRepository()
    {
        // Arrange
        var cancellationToken = new CancellationToken();

        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), cancellationToken))
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            Guid.NewGuid(),
            AuditCategory.ApplicationManagement,
            AuditSeverity.Info,
            "App.Created",
            "admin",
            "Admin",
            "User",
            "Application",
            "app-1",
            "192.168.1.100",
            "Firefox",
            null,
            cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.AddAsync(It.IsAny<AuditEvent>(), cancellationToken), Times.Once);
    }

    [Fact]
    public async Task WriteAsync_WithAuditEventAndCancellationToken_PassesTokenToRepository()
    {
        // Arrange
        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            Category = AuditCategory.Federation,
            Severity = AuditSeverity.Info,
            Action = "SAML.Login",
            ActorId = "user-1",
            ActorDisplayName = "Test User",
            ActorType = "User",
            TargetType = "Session",
            TargetId = "session-1",
            IpAddress = "10.0.0.1",
            UserAgent = "Chrome",
            OccurredAt = DateTime.UtcNow
        };

        var cancellationToken = new CancellationToken();

        _mockRepository
            .Setup(x => x.AddAsync(auditEvent, cancellationToken))
            .ReturnsAsync(auditEvent);

        // Act
        await _sut.WriteAsync(auditEvent, cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.AddAsync(auditEvent, cancellationToken), Times.Once);
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
    public async Task WriteAsync_WithAllCategories_CreatesCorrectAuditEvent(AuditCategory category)
    {
        // Arrange
        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            Guid.NewGuid(),
            category,
            AuditSeverity.Info,
            "Test.Action",
            "actor",
            "Actor Name",
            "User",
            "Target",
            "target-1",
            "127.0.0.1",
            "Test");

        // Assert
        capturedEvent.Should().NotBeNull();
        capturedEvent!.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public async Task WriteAsync_WithAllSeverities_CreatesCorrectAuditEvent(AuditSeverity severity)
    {
        // Arrange
        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            Guid.NewGuid(),
            AuditCategory.Security,
            severity,
            "Test.Action",
            "actor",
            "Actor Name",
            "User",
            "Target",
            "target-1",
            "127.0.0.1",
            "Test");

        // Assert
        capturedEvent.Should().NotBeNull();
        capturedEvent!.Severity.Should().Be(severity);
    }

    [Fact]
    public async Task WriteAsync_GeneratesUniqueIdsForEachCall()
    {
        // Arrange
        var capturedEvents = new List<AuditEvent>();
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvents.Add(e))
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            Guid.NewGuid(),
            AuditCategory.Authentication,
            AuditSeverity.Info,
            "Test.Action1",
            "actor",
            "Actor",
            "User",
            "Target",
            "target-1",
            "127.0.0.1",
            "Test");

        await _sut.WriteAsync(
            Guid.NewGuid(),
            AuditCategory.Authentication,
            AuditSeverity.Info,
            "Test.Action2",
            "actor",
            "Actor",
            "User",
            "Target",
            "target-2",
            "127.0.0.1",
            "Test");

        // Assert
        capturedEvents.Should().HaveCount(2);
        capturedEvents[0].Id.Should().NotBe(capturedEvents[1].Id);
        capturedEvents[0].CorrelationId.Should().NotBe(capturedEvents[1].CorrelationId);
    }

    [Fact]
    public async Task WriteAsync_WithEmptyStrings_AcceptsEmptyValues()
    {
        // Arrange
        AuditEvent? capturedEvent = null;
        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .Callback<AuditEvent, CancellationToken>((e, _) => capturedEvent = e)
            .ReturnsAsync((AuditEvent e, CancellationToken _) => e);

        // Act
        await _sut.WriteAsync(
            null,
            AuditCategory.SystemConfiguration,
            AuditSeverity.Info,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "");

        // Assert
        capturedEvent.Should().NotBeNull();
        capturedEvent!.Action.Should().BeEmpty();
        capturedEvent.ActorId.Should().BeEmpty();
        capturedEvent.ActorDisplayName.Should().BeEmpty();
        capturedEvent.ActorType.Should().BeEmpty();
        capturedEvent.TargetType.Should().BeEmpty();
        capturedEvent.TargetId.Should().BeEmpty();
        capturedEvent.IpAddress.Should().BeEmpty();
        capturedEvent.UserAgent.Should().BeEmpty();
    }
}
