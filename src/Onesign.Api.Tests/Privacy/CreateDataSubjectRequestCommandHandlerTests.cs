using FluentAssertions;
using Moq;
using Onesign.Modules.Privacy.Application.Commands;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class CreateDataSubjectRequestCommandHandlerTests
{
    private readonly CreateDataSubjectRequestCommandHandler _handler;

    public CreateDataSubjectRequestCommandHandlerTests()
    {
        _handler = new CreateDataSubjectRequestCommandHandler();
    }

    [Fact]
    public async Task Handle_ValidExportRequest_ReturnsSuccessWithDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var requestedBy = Guid.NewGuid();
        var reason = "GDPR data export request";

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Export,
            RequestedBy = requestedBy,
            Reason = reason
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().NotBeEmpty();
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.SubjectId.Should().Be(subjectId);
        result.Value.Type.Should().Be(DataSubjectRequestType.Export.ToString());
        result.Value.Status.Should().Be(DataSubjectRequestStatus.Requested.ToString());
        result.Value.RequestedBy.Should().Be(requestedBy);
        result.Value.Reason.Should().Be(reason);
        result.Value.RequestedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_ValidDeleteRequest_ReturnsSuccessWithDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var requestedBy = Guid.NewGuid();
        var reason = "Right to be forgotten request";

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Delete,
            RequestedBy = requestedBy,
            Reason = reason
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Type.Should().Be(DataSubjectRequestType.Delete.ToString());
        result.Value.Status.Should().Be(DataSubjectRequestStatus.Requested.ToString());
    }

    [Fact]
    public async Task Handle_RequestWithoutReason_ReturnsSuccessWithNullReason()
    {
        // Arrange
        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.NewGuid(),
            Reason = null
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Reason.Should().BeNull();
    }

    [Fact]
    public async Task Handle_MultipleRequests_GeneratesUniqueIds()
    {
        // Arrange
        var command1 = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.NewGuid()
        };

        var command2 = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Delete,
            RequestedBy = Guid.NewGuid()
        };

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.Value.Id.Should().NotBe(result2.Value.Id);
    }

    [Fact]
    public async Task Handle_SameSubjectDifferentTypes_BothSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var requestedBy = Guid.NewGuid();

        var exportCommand = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Export,
            RequestedBy = requestedBy
        };

        var deleteCommand = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Delete,
            RequestedBy = requestedBy
        };

        // Act
        var exportResult = await _handler.Handle(exportCommand, CancellationToken.None);
        var deleteResult = await _handler.Handle(deleteCommand, CancellationToken.None);

        // Assert
        exportResult.IsSuccess.Should().BeTrue();
        deleteResult.IsSuccess.Should().BeTrue();
        exportResult.Value.Type.Should().Be("Export");
        deleteResult.Value.Type.Should().Be("Delete");
    }

    [Fact]
    public async Task Handle_WithCancellationToken_CompletesSuccessfully()
    {
        // Arrange
        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.NewGuid()
        };

        using var cts = new CancellationTokenSource();

        // Act
        var result = await _handler.Handle(command, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_DtoContainsAllExpectedFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var requestedBy = Guid.NewGuid();
        var reason = "Test reason";

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Export,
            RequestedBy = requestedBy,
            Reason = reason
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        var dto = result.Value;
        dto.Should().NotBeNull();
        dto.Id.Should().NotBeEmpty();
        dto.TenantId.Should().Be(tenantId);
        dto.SubjectId.Should().Be(subjectId);
        dto.Type.Should().NotBeNullOrEmpty();
        dto.Status.Should().NotBeNullOrEmpty();
        dto.RequestedAt.Should().NotBe(default);
        dto.RequestedBy.Should().Be(requestedBy);
        dto.CompletedAt.Should().BeNull();
        dto.ResultLocation.Should().BeNull();
        dto.Reason.Should().Be(reason);
    }

    [Fact]
    public async Task Handle_RequestedAtIsSetToUtcNow()
    {
        // Arrange
        var beforeRequest = DateTime.UtcNow;

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterRequest = DateTime.UtcNow;

        // Assert
        result.Value.RequestedAt.Should().BeOnOrAfter(beforeRequest);
        result.Value.RequestedAt.Should().BeOnOrBefore(afterRequest);
    }

    [Fact]
    public async Task Handle_EmptyGuids_StillSucceeds()
    {
        // Arrange
        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.Empty,
            SubjectId = Guid.Empty,
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.Empty
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.TenantId.Should().Be(Guid.Empty);
        result.Value.SubjectId.Should().Be(Guid.Empty);
        result.Value.RequestedBy.Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task Handle_LongReason_IsPreserved()
    {
        // Arrange
        var longReason = new string('x', 1000);

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            RequestedBy = Guid.NewGuid(),
            Reason = longReason
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Reason.Should().Be(longReason);
    }
}
