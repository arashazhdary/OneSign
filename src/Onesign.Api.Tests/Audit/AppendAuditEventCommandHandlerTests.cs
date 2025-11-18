using FluentAssertions;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Audit;

public class AppendAuditEventCommandHandlerTests
{
    private readonly Mock<IAuditEventRepository> _auditEventRepositoryMock;
    private readonly AppendAuditEventCommandHandler _handler;

    public AppendAuditEventCommandHandlerTests()
    {
        _auditEventRepositoryMock = new Mock<IAuditEventRepository>();
        _handler = new AppendAuditEventCommandHandler(_auditEventRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesAuditEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var actorId = Guid.NewGuid();

        var command = new AppendAuditEventCommand
        {
            TenantId = tenantId,
            ActorId = actorId,
            EventType = AuditEventType.UserLogin,
            Description = "User logged in successfully",
            Metadata = "{\"browser\":\"Chrome\"}",
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0"
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
        result.Value.EventType.Should().Be(AuditEventType.UserLogin);
        result.Value.Description.Should().Be("User logged in successfully");
        result.Value.Metadata.Should().Be("{\"browser\":\"Chrome\"}");
        result.Value.IpAddress.Should().Be("192.168.1.1");
        result.Value.UserAgent.Should().Be("Mozilla/5.0");

        _auditEventRepositoryMock.Verify(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueEventId()
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.UserCreated,
            Description = "New user created"
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
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.UserUpdated,
            Description = "User profile updated"
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

    [Fact]
    public async Task Handle_NullableFields_HandlesNulls()
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = null,
            ActorId = null,
            EventType = AuditEventType.TenantCreated,
            Description = "System event",
            Metadata = null,
            IpAddress = null,
            UserAgent = null
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TenantId.Should().BeNull();
        result.Value.ActorId.Should().BeNull();
        result.Value.Metadata.Should().BeNull();
        result.Value.IpAddress.Should().BeNull();
        result.Value.UserAgent.Should().BeNull();
    }

    [Theory]
    [InlineData(AuditEventType.UserLogin)]
    [InlineData(AuditEventType.UserLogout)]
    [InlineData(AuditEventType.UserCreated)]
    [InlineData(AuditEventType.UserUpdated)]
    [InlineData(AuditEventType.UserDeleted)]
    [InlineData(AuditEventType.PasswordChanged)]
    [InlineData(AuditEventType.PasswordReset)]
    [InlineData(AuditEventType.TenantCreated)]
    [InlineData(AuditEventType.ApplicationCreated)]
    [InlineData(AuditEventType.OrgUnitCreated)]
    public async Task Handle_AllEventTypes_CreatesSuccessfully(AuditEventType eventType)
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid(),
            EventType = eventType,
            Description = $"Event type: {eventType}"
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
    public async Task Handle_WithMetadata_PreservesJson()
    {
        // Arrange
        var metadata = "{\"key\":\"value\",\"nested\":{\"prop\":123}}";
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.ConfigurationChanged,
            Description = "Configuration updated",
            Metadata = metadata
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.Metadata.Should().Be(metadata);
    }

    [Fact]
    public async Task Handle_SecurityEvents_CreatesSuccessfully()
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            ActorId = Guid.NewGuid(),
            EventType = AuditEventType.SecurityBreach,
            Description = "Suspicious activity detected",
            IpAddress = "10.0.0.1"
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.EventType.Should().Be(AuditEventType.SecurityBreach);
    }

    [Fact]
    public async Task Handle_EmptyDescription_CreatesEvent()
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.UserLogin,
            Description = string.Empty
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Description.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_LongDescription_HandlesCorrectly()
    {
        // Arrange
        var longDescription = new string('A', 10000);
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.DataExportRequested,
            Description = longDescription
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Description.Should().Be(longDescription);
    }

    [Fact]
    public async Task Handle_DifferentIpFormats_HandlesCorrectly()
    {
        // Arrange
        var command = new AppendAuditEventCommand
        {
            TenantId = Guid.NewGuid(),
            EventType = AuditEventType.UserLogin,
            Description = "Login",
            IpAddress = "2001:0db8:85a3:0000:0000:8a2e:0370:7334" // IPv6
        };

        _auditEventRepositoryMock.Setup(x => x.AddAsync(It.IsAny<AuditEvent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditEvent evt, CancellationToken _) => evt);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IpAddress.Should().Contain("2001");
    }
}
