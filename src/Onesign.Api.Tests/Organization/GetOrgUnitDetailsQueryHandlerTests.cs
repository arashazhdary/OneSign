using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetOrgUnitDetailsQueryHandlerTests
{
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<ILogger<GetOrgUnitDetailsQueryHandler>> _logger;
    private readonly GetOrgUnitDetailsQueryHandler _handler;

    public GetOrgUnitDetailsQueryHandlerTests()
    {
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _logger = new Mock<ILogger<GetOrgUnitDetailsQueryHandler>>();

        _handler = new GetOrgUnitDetailsQueryHandler(
            _orgUnitRepository.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidOrgUnitId_ReturnsOrgUnitDetails()
    {
        // Arrange
        var query = new GetOrgUnitDetailsQuery
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = query.OrgUnitId,
            TenantId = query.TenantId,
            ParentId = Guid.NewGuid(),
            Name = "Test Department",
            Code = "DEPT",
            Path = "000/001",
            Level = 1,
            SortOrder = 5,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(query.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(orgUnit.Id);
        result.Value.TenantId.Should().Be(orgUnit.TenantId);
        result.Value.ParentId.Should().Be(orgUnit.ParentId);
        result.Value.Name.Should().Be(orgUnit.Name);
        result.Value.Code.Should().Be(orgUnit.Code);
        result.Value.Path.Should().Be(orgUnit.Path);
        result.Value.Level.Should().Be(orgUnit.Level);
        result.Value.SortOrder.Should().Be(orgUnit.SortOrder);
        result.Value.Status.Should().Be(orgUnit.Status);
        result.Value.CreatedAt.Should().Be(orgUnit.CreatedAt);
        result.Value.UpdatedAt.Should().Be(orgUnit.UpdatedAt);
    }

    [Fact]
    public async Task Handle_WithNonExistentOrgUnit_ReturnsNotFoundError()
    {
        // Arrange
        var query = new GetOrgUnitDetailsQuery
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(query.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ORG_UNIT_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_WithTenantMismatch_ReturnsTenantMismatchError()
    {
        // Arrange
        var query = new GetOrgUnitDetailsQuery
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = query.OrgUnitId,
            TenantId = Guid.NewGuid(), // Different tenant
            Name = "Test"
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(query.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("TENANT_MISMATCH");
    }

    [Fact]
    public async Task Handle_WithRootOrgUnit_ReturnsOrgUnitWithNullParent()
    {
        // Arrange
        var query = new GetOrgUnitDetailsQuery
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = query.OrgUnitId,
            TenantId = query.TenantId,
            ParentId = null, // Root
            Name = "Root",
            Path = "000",
            Level = 0,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(query.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.ParentId.Should().BeNull();
        result.Value.Level.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithInactiveOrgUnit_ReturnsCorrectStatus()
    {
        // Arrange
        var query = new GetOrgUnitDetailsQuery
        {
            OrgUnitId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnit = new OrgUnit
        {
            Id = query.OrgUnitId,
            TenantId = query.TenantId,
            Name = "Inactive Dept",
            Status = OrgUnitStatus.Inactive,
            CreatedAt = DateTime.UtcNow
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(query.OrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Status.Should().Be(OrgUnitStatus.Inactive);
    }
}
