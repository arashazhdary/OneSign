using FluentAssertions;
using Moq;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Application.Queries;
using Onesign.Modules.Privacy.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class GetDataSubjectRequestsQueryHandlerTests
{
    private readonly GetDataSubjectRequestsQueryHandler _handler;

    public GetDataSubjectRequestsQueryHandlerTests()
    {
        _handler = new GetDataSubjectRequestsQueryHandler();
    }

    [Fact]
    public async Task Handle_ValidQuery_ReturnsSuccessWithEmptyList()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_QueryWithSubjectIdFilter_ReturnsSuccess()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_QueryWithStatusFilter_ReturnsSuccess()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = DataSubjectRequestStatus.Requested
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_QueryWithTypeFilter_ReturnsSuccess()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_QueryWithAllFilters_ReturnsSuccess()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Status = DataSubjectRequestStatus.Completed,
            Type = DataSubjectRequestType.Delete
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Theory]
    [InlineData(DataSubjectRequestStatus.Requested)]
    [InlineData(DataSubjectRequestStatus.InReview)]
    [InlineData(DataSubjectRequestStatus.Approved)]
    [InlineData(DataSubjectRequestStatus.Processing)]
    [InlineData(DataSubjectRequestStatus.Completed)]
    [InlineData(DataSubjectRequestStatus.Rejected)]
    public async Task Handle_AllStatusValues_ReturnSuccess(DataSubjectRequestStatus status)
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = status
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Theory]
    [InlineData(DataSubjectRequestType.Export)]
    [InlineData(DataSubjectRequestType.Delete)]
    public async Task Handle_AllTypeValues_ReturnSuccess(DataSubjectRequestType type)
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Type = type
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithCancellationToken_CompletesSuccessfully()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid()
        };

        using var cts = new CancellationTokenSource();

        // Act
        var result = await _handler.Handle(query, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_EmptyTenantId_StillSucceeds()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.Empty
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_MultipleQueries_ReturnIndependentResults()
    {
        // Arrange
        var query1 = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = DataSubjectRequestStatus.Requested
        };

        var query2 = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = DataSubjectRequestStatus.Completed
        };

        // Act
        var result1 = await _handler.Handle(query1, CancellationToken.None);
        var result2 = await _handler.Handle(query2, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_NullFilters_ReturnsSuccess()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            SubjectId = null,
            Status = null,
            Type = null
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ReturnsList_NotNull()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value.Should().NotBeNull();
        result.Value.Should().BeOfType<List<DataSubjectRequestDto>>();
    }

    [Fact]
    public async Task Handle_SameTenantDifferentFilters_BothSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var exportQuery = new GetDataSubjectRequestsQuery
        {
            TenantId = tenantId,
            Type = DataSubjectRequestType.Export
        };

        var deleteQuery = new GetDataSubjectRequestsQuery
        {
            TenantId = tenantId,
            Type = DataSubjectRequestType.Delete
        };

        // Act
        var exportResult = await _handler.Handle(exportQuery, CancellationToken.None);
        var deleteResult = await _handler.Handle(deleteQuery, CancellationToken.None);

        // Assert
        exportResult.IsSuccess.Should().BeTrue();
        deleteResult.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_QueryWithOnlyRequiredField_Succeeds()
    {
        // Arrange
        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ConcurrentQueries_AllSucceed()
    {
        // Arrange
        var queries = Enumerable.Range(0, 10)
            .Select(_ => new GetDataSubjectRequestsQuery
            {
                TenantId = Guid.NewGuid()
            })
            .ToList();

        // Act
        var tasks = queries.Select(q => _handler.Handle(q, CancellationToken.None));
        var results = await Task.WhenAll(tasks);

        // Assert
        foreach (var result in results)
        {
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
        }
    }
}
