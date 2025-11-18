using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetOrgUnitTreeQueryHandlerTests
{
    private readonly Mock<IOrgTreeService> _orgTreeService;
    private readonly Mock<ILogger<GetOrgUnitTreeQueryHandler>> _logger;
    private readonly GetOrgUnitTreeQueryHandler _handler;

    public GetOrgUnitTreeQueryHandlerTests()
    {
        _orgTreeService = new Mock<IOrgTreeService>();
        _logger = new Mock<ILogger<GetOrgUnitTreeQueryHandler>>();

        _handler = new GetOrgUnitTreeQueryHandler(
            _orgTreeService.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithValidTenantId_ReturnsTreeStructure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        var rootId = Guid.NewGuid();
        var child1Id = Guid.NewGuid();
        var child2Id = Guid.NewGuid();

        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit
            {
                Id = rootId,
                TenantId = tenantId,
                ParentId = null,
                Name = "Root",
                Code = "ROOT",
                Path = "000",
                Level = 0,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = child1Id,
                TenantId = tenantId,
                ParentId = rootId,
                Name = "Child 1",
                Code = "C1",
                Path = "000/001",
                Level = 1,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = child2Id,
                TenantId = tenantId,
                ParentId = rootId,
                Name = "Child 2",
                Code = "C2",
                Path = "000/002",
                Level = 1,
                SortOrder = 2,
                Status = OrgUnitStatus.Active
            }
        };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1); // One root node
        result.Value.First().Name.Should().Be("Root");
        result.Value.First().Children.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithEmptyTenant_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithMultiLevelHierarchy_BuildsCorrectTree()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        var rootId = Guid.NewGuid();
        var childId = Guid.NewGuid();
        var grandchildId = Guid.NewGuid();

        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit
            {
                Id = rootId,
                ParentId = null,
                Name = "Root",
                Level = 0,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = childId,
                ParentId = rootId,
                Name = "Child",
                Level = 1,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = grandchildId,
                ParentId = childId,
                Name = "Grandchild",
                Level = 2,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            }
        };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value.First().Children.Should().HaveCount(1);
        result.Value.First().Children.First().Children.Should().HaveCount(1);
        result.Value.First().Children.First().Children.First().Name.Should().Be("Grandchild");
    }

    [Fact]
    public async Task Handle_WithMultipleRoots_ReturnsAllRoots()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        var root1Id = Guid.NewGuid();
        var root2Id = Guid.NewGuid();

        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit
            {
                Id = root1Id,
                ParentId = null,
                Name = "Root 1",
                Level = 0,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = root2Id,
                ParentId = null,
                Name = "Root 2",
                Level = 0,
                SortOrder = 2,
                Status = OrgUnitStatus.Active
            }
        };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_MapsAllPropertiesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        var orgUnitId = Guid.NewGuid();
        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit
            {
                Id = orgUnitId,
                ParentId = null,
                Name = "Test Org",
                Code = "TEST",
                Level = 0,
                SortOrder = 1,
                Status = OrgUnitStatus.Inactive
            }
        };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var node = result.Value.First();
        node.Id.Should().Be(orgUnitId);
        node.ParentId.Should().BeNull();
        node.Name.Should().Be("Test Org");
        node.Code.Should().Be("TEST");
        node.Level.Should().Be(0);
        node.Status.Should().Be(OrgUnitStatus.Inactive);
        node.Children.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_SortsChildrenBySortOrder()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };

        var rootId = Guid.NewGuid();
        var child1Id = Guid.NewGuid();
        var child2Id = Guid.NewGuid();
        var child3Id = Guid.NewGuid();

        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit
            {
                Id = rootId,
                ParentId = null,
                Name = "Root",
                Level = 0,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = child3Id,
                ParentId = rootId,
                Name = "Child 3",
                Level = 1,
                SortOrder = 3,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = child1Id,
                ParentId = rootId,
                Name = "Child 1",
                Level = 1,
                SortOrder = 1,
                Status = OrgUnitStatus.Active
            },
            new OrgUnit
            {
                Id = child2Id,
                ParentId = rootId,
                Name = "Child 2",
                Level = 1,
                SortOrder = 2,
                Status = OrgUnitStatus.Active
            }
        };

        _orgTreeService.Setup(x => x.GetTreeForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var children = result.Value.First().Children;
        children[0].Name.Should().Be("Child 1");
        children[1].Name.Should().Be("Child 2");
        children[2].Name.Should().Be("Child 3");
    }
}
