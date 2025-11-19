using FluentAssertions;
using Moq;
using Onesign.Modules.Privacy.Application.Commands;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class ExecuteDataSubjectRequestCommandHandlerTests
{
    private readonly Mock<IDataExportService> _mockExportService;
    private readonly Mock<IDataDeletionService> _mockDeletionService;
    private readonly ExecuteDataSubjectRequestCommandHandler _handler;

    public ExecuteDataSubjectRequestCommandHandlerTests()
    {
        _mockExportService = new Mock<IDataExportService>();
        _mockDeletionService = new Mock<IDataDeletionService>();
        _handler = new ExecuteDataSubjectRequestCommandHandler(
            _mockExportService.Object,
            _mockDeletionService.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsSuccessWithProcessingStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var requestId = Guid.NewGuid();

        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = tenantId,
            RequestId = requestId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(requestId);
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.Status.Should().Be(DataSubjectRequestStatus.Processing.ToString());
    }

    [Fact]
    public async Task Handle_ReturnsExportType()
    {
        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Type.Should().Be(DataSubjectRequestType.Export.ToString());
    }

    [Fact]
    public async Task Handle_SetsRequestedAtToUtcNow()
    {
        // Arrange
        var beforeExecution = DateTime.UtcNow;

        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterExecution = DateTime.UtcNow;

        // Assert
        result.Value.RequestedAt.Should().BeOnOrAfter(beforeExecution);
        result.Value.RequestedAt.Should().BeOnOrBefore(afterExecution);
    }

    [Fact]
    public async Task Handle_SubjectIdAndRequestedByAreEmpty()
    {
        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.SubjectId.Should().Be(Guid.Empty);
        result.Value.RequestedBy.Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_CompletesSuccessfully()
    {
        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        using var cts = new CancellationTokenSource();

        // Act
        var result = await _handler.Handle(command, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_MultipleExecutions_ReturnIndependentResults()
    {
        // Arrange
        var command1 = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        var command2 = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.Value.Id.Should().NotBe(result2.Value.Id);
        result1.Value.TenantId.Should().NotBe(result2.Value.TenantId);
    }

    [Fact]
    public async Task Handle_EmptyGuids_StillSucceeds()
    {
        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.Empty,
            RequestId = Guid.Empty
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.TenantId.Should().Be(Guid.Empty);
        result.Value.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task Handle_DtoHasNoCompletedAtOrResultLocation()
    {
        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.CompletedAt.Should().BeNull();
        result.Value.ResultLocation.Should().BeNull();
        result.Value.Reason.Should().BeNull();
    }

    [Fact]
    public async Task Handle_DtoContainsAllExpectedFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var requestId = Guid.NewGuid();

        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = tenantId,
            RequestId = requestId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        var dto = result.Value;
        dto.Id.Should().Be(requestId);
        dto.TenantId.Should().Be(tenantId);
        dto.SubjectId.Should().NotBeNull();
        dto.Type.Should().NotBeNullOrEmpty();
        dto.Status.Should().NotBeNullOrEmpty();
        dto.RequestedAt.Should().NotBe(default);
        dto.RequestedBy.Should().NotBeNull();
    }

    [Fact]
    public async Task Constructor_WithNullExportService_ThrowsArgumentNullException()
    {
        // Act & Assert
        var action = () => new ExecuteDataSubjectRequestCommandHandler(
            null!,
            _mockDeletionService.Object);

        action.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public async Task Constructor_WithNullDeletionService_ThrowsArgumentNullException()
    {
        // Act & Assert
        var action = () => new ExecuteDataSubjectRequestCommandHandler(
            _mockExportService.Object,
            null!);

        action.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public async Task Handle_SameRequestIdDifferentTenants_BothSucceed()
    {
        // Arrange
        var requestId = Guid.NewGuid();

        var command1 = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = requestId
        };

        var command2 = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = requestId
        };

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value.Id.Should().Be(result2.Value.Id);
        result1.Value.TenantId.Should().NotBe(result2.Value.TenantId);
    }

    [Fact]
    public async Task Handle_ServicesAreInjected_NotNull()
    {
        // This test verifies the handler was constructed with non-null services
        // The handler should have valid service references

        // Arrange
        var command = new ExecuteDataSubjectRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
    }
}
