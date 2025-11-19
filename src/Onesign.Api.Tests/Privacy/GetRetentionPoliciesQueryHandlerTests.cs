using FluentAssertions;
using Moq;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Application.Queries;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class GetRetentionPoliciesQueryHandlerTests
{
    private readonly Mock<IDataRetentionService> _mockRetentionService;
    private readonly GetRetentionPoliciesQueryHandler _handler;

    public GetRetentionPoliciesQueryHandlerTests()
    {
        _mockRetentionService = new Mock<IDataRetentionService>();
        _handler = new GetRetentionPoliciesQueryHandler(_mockRetentionService.Object);
    }

    [Fact]
    public async Task Handle_NoPolicies_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Enumerable.Empty<DataRetentionPolicy>());

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithPolicies_ReturnsMappedDtos()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<DataRetentionPolicy>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.AuthEvents,
                RetentionPeriodDays = 90,
                HardDeleteAfter = false,
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow.AddDays(-10)
            }
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value[0].DataCategory.Should().Be(DataCategory.IdentityProfile.ToString());
        result.Value[1].DataCategory.Should().Be(DataCategory.AuthEvents.ToString());
    }

    [Fact]
    public async Task Handle_WithCategoryFilter_FiltersResults()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<DataRetentionPolicy>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.AuditLogs,
                RetentionPeriodDays = 180,
                HardDeleteAfter = false,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId,
            DataCategory = DataCategory.IdentityProfile
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].DataCategory.Should().Be(DataCategory.IdentityProfile.ToString());
    }

    [Fact]
    public async Task Handle_WithNonMatchingCategoryFilter_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<DataRetentionPolicy>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId,
            DataCategory = DataCategory.FederationLogs
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Theory]
    [InlineData(DataCategory.IdentityProfile)]
    [InlineData(DataCategory.AuthEvents)]
    [InlineData(DataCategory.AuditLogs)]
    [InlineData(DataCategory.FederationLogs)]
    [InlineData(DataCategory.AccessRequests)]
    [InlineData(DataCategory.LifecycleHistory)]
    public async Task Handle_AllCategoryFilters_Work(DataCategory category)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new DataRetentionPolicy
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DataCategory = category,
            RetentionPeriodDays = 90,
            HardDeleteAfter = false,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { policy });

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId,
            DataCategory = category
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].DataCategory.Should().Be(category.ToString());
    }

    [Fact]
    public async Task Handle_MapsAllDtoFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var updatedAt = DateTime.UtcNow;

        var policy = new DataRetentionPolicy
        {
            Id = policyId,
            TenantId = tenantId,
            DataCategory = DataCategory.AuditLogs,
            RetentionPeriodDays = 180,
            HardDeleteAfter = true,
            Enabled = false,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { policy });

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value[0];
        dto.Id.Should().Be(policyId);
        dto.TenantId.Should().Be(tenantId);
        dto.DataCategory.Should().Be(DataCategory.AuditLogs.ToString());
        dto.RetentionPeriodDays.Should().Be(180);
        dto.HardDeleteAfter.Should().BeTrue();
        dto.Enabled.Should().BeFalse();
        dto.CreatedAt.Should().Be(createdAt);
        dto.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_PassesToService()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        using var cts = new CancellationTokenSource();

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, cts.Token))
            .ReturnsAsync(Enumerable.Empty<DataRetentionPolicy>());

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _mockRetentionService.Verify(x => x.GetPoliciesAsync(tenantId, cts.Token), Times.Once);
    }

    [Fact]
    public async Task Handle_ServiceReturnsMultiplePolicies_AllAreMapped()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = Enum.GetValues(typeof(DataCategory))
            .Cast<DataCategory>()
            .Select(category => new DataRetentionPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = category,
                RetentionPeriodDays = 30,
                HardDeleteAfter = false,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            })
            .ToList();

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(policies.Count);
    }

    [Fact]
    public async Task Handle_NoCategoryFilter_ReturnsAllPolicies()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policies = new List<DataRetentionPolicy>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.AuditLogs,
                RetentionPeriodDays = 180,
                HardDeleteAfter = false,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = DataCategory.FederationLogs,
                RetentionPeriodDays = 90,
                HardDeleteAfter = true,
                Enabled = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policies);

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId,
            DataCategory = null
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);
    }

    [Fact]
    public void Constructor_WithNullService_ThrowsArgumentNullException()
    {
        // Act & Assert
        var action = () => new GetRetentionPoliciesQueryHandler(null!);
        action.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public async Task Handle_EmptyTenantId_CallsService()
    {
        // Arrange
        var tenantId = Guid.Empty;
        _mockRetentionService
            .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Enumerable.Empty<DataRetentionPolicy>());

        var query = new GetRetentionPoliciesQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _mockRetentionService.Verify(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleConcurrentQueries_AllSucceed()
    {
        // Arrange
        var tenantIds = Enumerable.Range(0, 5).Select(_ => Guid.NewGuid()).ToList();

        foreach (var tenantId in tenantIds)
        {
            _mockRetentionService
                .Setup(x => x.GetPoliciesAsync(tenantId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new[]
                {
                    new DataRetentionPolicy
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        DataCategory = DataCategory.AuditLogs,
                        RetentionPeriodDays = 90,
                        HardDeleteAfter = false,
                        Enabled = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                });
        }

        var queries = tenantIds.Select(id => new GetRetentionPoliciesQuery { TenantId = id }).ToList();

        // Act
        var tasks = queries.Select(q => _handler.Handle(q, CancellationToken.None));
        var results = await Task.WhenAll(tasks);

        // Assert
        foreach (var result in results)
        {
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().HaveCount(1);
        }
    }
}
