using FluentAssertions;
using Moq;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.Handlers;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;

namespace Onesign.Api.Tests.IdentityLifecycle;

public class IdentityLifecycleHandlerTests
{
    private readonly Mock<ILifecycleEventRepository> _lifecycleEventRepositoryMock;
    private readonly Mock<IHRIdentityRecordRepository> _hrRecordRepositoryMock;
    private readonly Mock<ILifecycleProcessor> _lifecycleProcessorMock;

    public IdentityLifecycleHandlerTests()
    {
        _lifecycleEventRepositoryMock = new Mock<ILifecycleEventRepository>();
        _hrRecordRepositoryMock = new Mock<IHRIdentityRecordRepository>();
        _lifecycleProcessorMock = new Mock<ILifecycleProcessor>();
    }

    #region ProcessLifecycleEventCommandHandler Tests

    [Fact]
    public async Task ProcessLifecycleEvent_WithValidJoinerEvent_ReturnsSuccess()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var eventId = Guid.NewGuid();
        var lifecycleEvent = new LifecycleEvent
        {
            Id = eventId,
            EventType = LifecycleEventType.Joiner,
            Status = ProcessingStatus.Pending
        };

        var command = new ProcessLifecycleEventCommand { EventId = eventId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lifecycleEvent);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();
        _lifecycleProcessorMock.Verify(
            x => x.ProcessJoinerAsync(lifecycleEvent, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessLifecycleEvent_WithMoverEvent_CallsProcessMover()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var eventId = Guid.NewGuid();
        var lifecycleEvent = new LifecycleEvent
        {
            Id = eventId,
            EventType = LifecycleEventType.Mover,
            Status = ProcessingStatus.Pending
        };

        var command = new ProcessLifecycleEventCommand { EventId = eventId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lifecycleEvent);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _lifecycleProcessorMock.Verify(
            x => x.ProcessMoverAsync(lifecycleEvent, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessLifecycleEvent_WithLeaverEvent_CallsProcessLeaver()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var eventId = Guid.NewGuid();
        var lifecycleEvent = new LifecycleEvent
        {
            Id = eventId,
            EventType = LifecycleEventType.Leaver,
            Status = ProcessingStatus.Pending
        };

        var command = new ProcessLifecycleEventCommand { EventId = eventId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lifecycleEvent);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _lifecycleProcessorMock.Verify(
            x => x.ProcessLeaverAsync(lifecycleEvent, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessLifecycleEvent_WithNonExistingEvent_ReturnsFailure()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var command = new ProcessLifecycleEventCommand { EventId = Guid.NewGuid() };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LifecycleEvent?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("EventNotFound");
    }

    [Fact]
    public async Task ProcessLifecycleEvent_WithNonPendingStatus_ReturnsFailure()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var eventId = Guid.NewGuid();
        var lifecycleEvent = new LifecycleEvent
        {
            Id = eventId,
            Status = ProcessingStatus.Completed
        };

        var command = new ProcessLifecycleEventCommand { EventId = eventId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lifecycleEvent);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidStatus");
    }

    [Fact]
    public async Task ProcessLifecycleEvent_WhenProcessorThrows_SetsStatusToFailed()
    {
        // Arrange
        var handler = new ProcessLifecycleEventCommandHandler(
            _lifecycleEventRepositoryMock.Object,
            _lifecycleProcessorMock.Object);

        var eventId = Guid.NewGuid();
        var lifecycleEvent = new LifecycleEvent
        {
            Id = eventId,
            EventType = LifecycleEventType.Joiner,
            Status = ProcessingStatus.Pending
        };

        var command = new ProcessLifecycleEventCommand { EventId = eventId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lifecycleEvent);

        _lifecycleProcessorMock
            .Setup(x => x.ProcessJoinerAsync(It.IsAny<LifecycleEvent>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Processing failed"));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        lifecycleEvent.Status.Should().Be(ProcessingStatus.Failed);
        lifecycleEvent.ErrorMessage.Should().Contain("Processing failed");
    }

    #endregion

    #region SyncHRDataCommandHandler Tests

    [Fact]
    public async Task SyncHRData_WithNewRecord_CreatesJoinerEvent()
    {
        // Arrange
        var handler = new SyncHRDataCommandHandler(
            _hrRecordRepositoryMock.Object,
            _lifecycleEventRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var command = new SyncHRDataCommand
        {
            TenantId = tenantId,
            Records = new List<HRRecordDto>
            {
                new HRRecordDto
                {
                    ExternalEmployeeId = "EMP001",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    OrgUnitCode = "IT",
                    JobRole = "Developer",
                    EmploymentStatus = "Active",
                    StartDate = DateTime.UtcNow
                }
            }
        };

        _hrRecordRepositoryMock
            .Setup(x => x.GetByExternalIdAsync(tenantId, "EMP001", It.IsAny<CancellationToken>()))
            .ReturnsAsync((HRIdentityRecord?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(1);
        _hrRecordRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<HRIdentityRecord>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _lifecycleEventRepositoryMock.Verify(
            x => x.AddAsync(It.Is<LifecycleEvent>(e => e.EventType == LifecycleEventType.Joiner), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SyncHRData_WithExistingRecordTerminated_CreatesLeaverEvent()
    {
        // Arrange
        var handler = new SyncHRDataCommandHandler(
            _hrRecordRepositoryMock.Object,
            _lifecycleEventRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var existingRecord = new HRIdentityRecord
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ExternalEmployeeId = "EMP001",
            Status = EmploymentStatus.Active
        };

        var command = new SyncHRDataCommand
        {
            TenantId = tenantId,
            Records = new List<HRRecordDto>
            {
                new HRRecordDto
                {
                    ExternalEmployeeId = "EMP001",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    EmploymentStatus = "Terminated",
                    StartDate = DateTime.UtcNow.AddYears(-1),
                    EndDate = DateTime.UtcNow
                }
            }
        };

        _hrRecordRepositoryMock
            .Setup(x => x.GetByExternalIdAsync(tenantId, "EMP001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRecord);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _lifecycleEventRepositoryMock.Verify(
            x => x.AddAsync(It.Is<LifecycleEvent>(e => e.EventType == LifecycleEventType.Leaver), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SyncHRData_WithRoleChange_CreatesMoverEvent()
    {
        // Arrange
        var handler = new SyncHRDataCommandHandler(
            _hrRecordRepositoryMock.Object,
            _lifecycleEventRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var existingRecord = new HRIdentityRecord
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ExternalEmployeeId = "EMP001",
            OrgUnitCode = "IT",
            JobRole = "Developer",
            Status = EmploymentStatus.Active
        };

        var command = new SyncHRDataCommand
        {
            TenantId = tenantId,
            Records = new List<HRRecordDto>
            {
                new HRRecordDto
                {
                    ExternalEmployeeId = "EMP001",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    OrgUnitCode = "Engineering",
                    JobRole = "Senior Developer",
                    EmploymentStatus = "Active",
                    StartDate = DateTime.UtcNow.AddYears(-1)
                }
            }
        };

        _hrRecordRepositoryMock
            .Setup(x => x.GetByExternalIdAsync(tenantId, "EMP001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRecord);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _lifecycleEventRepositoryMock.Verify(
            x => x.AddAsync(It.Is<LifecycleEvent>(e => e.EventType == LifecycleEventType.Mover), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SyncHRData_WithMultipleRecords_ProcessesAll()
    {
        // Arrange
        var handler = new SyncHRDataCommandHandler(
            _hrRecordRepositoryMock.Object,
            _lifecycleEventRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var command = new SyncHRDataCommand
        {
            TenantId = tenantId,
            Records = new List<HRRecordDto>
            {
                new HRRecordDto { ExternalEmployeeId = "EMP001", FirstName = "John", LastName = "Doe", Email = "john@test.com", StartDate = DateTime.UtcNow },
                new HRRecordDto { ExternalEmployeeId = "EMP002", FirstName = "Jane", LastName = "Doe", Email = "jane@test.com", StartDate = DateTime.UtcNow }
            }
        };

        _hrRecordRepositoryMock
            .Setup(x => x.GetByExternalIdAsync(tenantId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((HRIdentityRecord?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(2);
    }

    #endregion

    #region GetLifecycleEventsQueryHandler Tests

    [Fact]
    public async Task GetLifecycleEvents_ReturnsEvents()
    {
        // Arrange
        var handler = new GetLifecycleEventsQueryHandler(_lifecycleEventRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var events = new List<LifecycleEvent>
        {
            new LifecycleEvent { Id = Guid.NewGuid(), EventType = LifecycleEventType.Joiner, Status = ProcessingStatus.Pending },
            new LifecycleEvent { Id = Guid.NewGuid(), EventType = LifecycleEventType.Leaver, Status = ProcessingStatus.Completed }
        };

        var query = new GetLifecycleEventsQuery { TenantId = tenantId };

        _lifecycleEventRepositoryMock
            .Setup(x => x.GetPendingEventsAsync(tenantId, 1000, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    #endregion

    #region GetHRRecordsQueryHandler Tests

    [Fact]
    public async Task GetHRRecords_ReturnsRecords()
    {
        // Arrange
        var handler = new GetHRRecordsQueryHandler(_hrRecordRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var records = new List<HRIdentityRecord>
        {
            new HRIdentityRecord { Id = Guid.NewGuid(), FirstName = "John", LastName = "Doe", Status = EmploymentStatus.Active }
        };

        var query = new GetHRRecordsQuery { TenantId = tenantId };

        _hrRecordRepositoryMock
            .Setup(x => x.GetByTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(records);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion
}
