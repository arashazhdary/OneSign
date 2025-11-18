using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class OrgTreeServiceUnitTests
{
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IUserOrgUnitRepository> _userOrgUnitRepository;
    private readonly Mock<IApplicationOrgUnitRepository> _applicationOrgUnitRepository;
    private readonly Mock<ILogger<OrgTreeService>> _logger;
    private readonly OrgTreeService _service;

    public OrgTreeServiceUnitTests()
    {
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _userOrgUnitRepository = new Mock<IUserOrgUnitRepository>();
        _applicationOrgUnitRepository = new Mock<IApplicationOrgUnitRepository>();
        _logger = new Mock<ILogger<OrgTreeService>>();

        _service = new OrgTreeService(
            _orgUnitRepository.Object,
            _userOrgUnitRepository.Object,
            _applicationOrgUnitRepository.Object,
            _logger.Object);
    }

    #region CreateChildAsync Tests

    [Fact]
    public async Task CreateChildAsync_WithNoParent_CreatesRootOrgUnit()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var name = "Root Org";

        _orgUnitRepository.Setup(x => x.GetRootByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);
        _orgUnitRepository.Setup(x => x.GetMaxSortOrderForParentAsync(null, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _orgUnitRepository.Setup(x => x.AddAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit o, CancellationToken _) => o);

        // Act
        var result = await _service.CreateChildAsync(tenantId, null, name, null, null);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(name);
        result.Level.Should().Be(0);
        result.Path.Should().Be("000");
        result.ParentId.Should().BeNull();
        result.TenantId.Should().Be(tenantId);
        result.Status.Should().Be(OrgUnitStatus.Active);
    }

    [Fact]
    public async Task CreateChildAsync_WithParent_CreatesChildWithCorrectPathAndLevel()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var parent = new OrgUnit
        {
            Id = parentId,
            TenantId = tenantId,
            Path = "000",
            Level = 0,
            Name = "Parent"
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);
        _orgUnitRepository.Setup(x => x.GetMaxSortOrderForParentAsync(parentId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _orgUnitRepository.Setup(x => x.GetChildrenAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());
        _orgUnitRepository.Setup(x => x.AddAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit o, CancellationToken _) => o);

        // Act
        var result = await _service.CreateChildAsync(tenantId, parentId, "Child", null, null);

        // Assert
        result.Should().NotBeNull();
        result.Level.Should().Be(1);
        result.Path.Should().Be("000/001");
        result.ParentId.Should().Be(parentId);
    }

    [Fact]
    public async Task CreateChildAsync_WithInvalidParent_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.CreateChildAsync(tenantId, parentId, "Child", null, null);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Parent OrgUnit not found*");
    }

    [Fact]
    public async Task CreateChildAsync_WithParentFromDifferentTenant_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var differentTenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var parent = new OrgUnit
        {
            Id = parentId,
            TenantId = differentTenantId, // Different tenant
            Path = "000",
            Level = 0
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);

        // Act
        Func<Task> act = async () => await _service.CreateChildAsync(tenantId, parentId, "Child", null, null);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*does not belong to tenant*");
    }

    [Fact]
    public async Task CreateChildAsync_WithCustomSortOrder_UsesProvidedSortOrder()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var customSortOrder = 99;

        _orgUnitRepository.Setup(x => x.GetRootByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);
        _orgUnitRepository.Setup(x => x.AddAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit o, CancellationToken _) => o);

        // Act
        var result = await _service.CreateChildAsync(tenantId, null, "Test", null, customSortOrder);

        // Assert
        result.SortOrder.Should().Be(customSortOrder);
    }

    [Fact]
    public async Task CreateChildAsync_WithCode_SetsCodeCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var code = "DEPT-001";

        _orgUnitRepository.Setup(x => x.GetRootByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);
        _orgUnitRepository.Setup(x => x.GetMaxSortOrderForParentAsync(null, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _orgUnitRepository.Setup(x => x.AddAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit o, CancellationToken _) => o);

        // Act
        var result = await _service.CreateChildAsync(tenantId, null, "Test", code, null);

        // Assert
        result.Code.Should().Be(code);
    }

    [Fact]
    public async Task CreateChildAsync_WithExistingSiblings_GeneratesCorrectPath()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var parent = new OrgUnit
        {
            Id = parentId,
            TenantId = tenantId,
            Path = "000",
            Level = 0
        };

        var existingSiblings = new List<OrgUnit>
        {
            new OrgUnit { Id = Guid.NewGuid(), Path = "000/001" },
            new OrgUnit { Id = Guid.NewGuid(), Path = "000/002" },
            new OrgUnit { Id = Guid.NewGuid(), Path = "000/003" }
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);
        _orgUnitRepository.Setup(x => x.GetMaxSortOrderForParentAsync(parentId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(3);
        _orgUnitRepository.Setup(x => x.GetChildrenAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSiblings);
        _orgUnitRepository.Setup(x => x.AddAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit o, CancellationToken _) => o);

        // Act
        var result = await _service.CreateChildAsync(tenantId, parentId, "New Child", null, null);

        // Assert
        result.Path.Should().Be("000/004");
    }

    #endregion

    #region UpdateOrgUnitAsync Tests

    [Fact]
    public async Task UpdateOrgUnitAsync_WithValidId_UpdatesOrgUnit()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid(),
            Name = "Old Name",
            Code = "OLD",
            SortOrder = 1,
            Status = OrgUnitStatus.Active
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.UpdateAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateOrgUnitAsync(orgUnitId, "New Name", "NEW", 5, OrgUnitStatus.Inactive);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Name");
        result.Code.Should().Be("NEW");
        result.SortOrder.Should().Be(5);
        result.Status.Should().Be(OrgUnitStatus.Inactive);
        result.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateOrgUnitAsync_WithInvalidId_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.UpdateOrgUnitAsync(orgUnitId, "Name", null, 1, OrgUnitStatus.Active);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("OrgUnit not found");
    }

    #endregion

    #region MoveOrgUnitAsync Tests

    [Fact]
    public async Task MoveOrgUnitAsync_ToNewParent_UpdatesPathAndLevel()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var newParentId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = tenantId,
            ParentId = null,
            Path = "000",
            Level = 0
        };

        var newParent = new OrgUnit
        {
            Id = newParentId,
            TenantId = tenantId,
            Path = "001",
            Level = 0
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(newParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newParent);
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());
        _orgUnitRepository.Setup(x => x.GetChildrenAsync(newParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());
        _orgUnitRepository.Setup(x => x.UpdateAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.MoveOrgUnitAsync(orgUnitId, newParentId);

        // Assert
        orgUnit.ParentId.Should().Be(newParentId);
        _orgUnitRepository.Verify(x => x.UpdateAsync(orgUnit, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task MoveOrgUnitAsync_WithInvalidOrgUnit_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.MoveOrgUnitAsync(orgUnitId, null);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("OrgUnit not found");
    }

    [Fact]
    public async Task MoveOrgUnitAsync_ToOwnDescendant_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var descendantId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = tenantId,
            Path = "000",
            Level = 0
        };

        var descendant = new OrgUnit
        {
            Id = descendantId,
            TenantId = tenantId,
            Path = "000/001",
            Level = 1
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(descendantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(descendant);
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit> { descendant });

        // Act
        Func<Task> act = async () => await _service.MoveOrgUnitAsync(orgUnitId, descendantId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot move OrgUnit to its own descendant*");
    }

    [Fact]
    public async Task MoveOrgUnitAsync_ToDifferentTenant_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var newParentId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var differentTenantId = Guid.NewGuid();

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = tenantId,
            Path = "000",
            Level = 0
        };

        var newParent = new OrgUnit
        {
            Id = newParentId,
            TenantId = differentTenantId, // Different tenant
            Path = "000",
            Level = 0
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(newParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newParent);

        // Act
        Func<Task> act = async () => await _service.MoveOrgUnitAsync(orgUnitId, newParentId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*does not belong to tenant*");
    }

    [Fact]
    public async Task MoveOrgUnitAsync_WithDescendants_UpdatesAllDescendants()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var newParentId = Guid.NewGuid();
        var childId = Guid.NewGuid();
        var grandchildId = Guid.NewGuid();

        var parent = new OrgUnit
        {
            Id = parentId,
            TenantId = tenantId,
            Path = "000",
            Level = 0
        };

        var child = new OrgUnit
        {
            Id = childId,
            TenantId = tenantId,
            ParentId = parentId,
            Path = "000/001",
            Level = 1
        };

        var grandchild = new OrgUnit
        {
            Id = grandchildId,
            TenantId = tenantId,
            ParentId = childId,
            Path = "000/001/001",
            Level = 2
        };

        var newParent = new OrgUnit
        {
            Id = newParentId,
            TenantId = tenantId,
            Path = "001",
            Level = 0
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(newParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newParent);
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit> { child, grandchild });
        _orgUnitRepository.Setup(x => x.GetChildrenAsync(newParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());
        _orgUnitRepository.Setup(x => x.UpdateAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.MoveOrgUnitAsync(parentId, newParentId);

        // Assert
        _orgUnitRepository.Verify(x => x.UpdateAsync(It.IsAny<OrgUnit>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
    }

    #endregion

    #region DeleteOrgUnitAsync Tests

    [Fact]
    public async Task DeleteOrgUnitAsync_WithNoChildren_DeletesSuccessfully()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid(),
            Name = "Test"
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.HasChildrenAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _userOrgUnitRepository.Setup(x => x.HasUsersAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _applicationOrgUnitRepository.Setup(x => x.HasApplicationsAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _orgUnitRepository.Setup(x => x.DeleteAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteOrgUnitAsync(orgUnitId);

        // Assert
        _orgUnitRepository.Verify(x => x.DeleteAsync(orgUnitId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithChildren_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid()
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.HasChildrenAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _service.DeleteOrgUnitAsync(orgUnitId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot delete OrgUnit with children*");
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithUsers_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid()
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.HasChildrenAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _userOrgUnitRepository.Setup(x => x.HasUsersAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _service.DeleteOrgUnitAsync(orgUnitId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot delete OrgUnit with assigned users*");
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithApplications_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            TenantId = Guid.NewGuid()
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);
        _orgUnitRepository.Setup(x => x.HasChildrenAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _userOrgUnitRepository.Setup(x => x.HasUsersAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _applicationOrgUnitRepository.Setup(x => x.HasApplicationsAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _service.DeleteOrgUnitAsync(orgUnitId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot delete OrgUnit with assigned applications*");
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithInvalidId_ThrowsInvalidOperationException()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.DeleteOrgUnitAsync(orgUnitId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("OrgUnit not found");
    }

    #endregion

    #region GetTreeForTenantAsync Tests

    [Fact]
    public async Task GetTreeForTenantAsync_ReturnsAllOrgUnitsForTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Root" },
            new OrgUnit { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Child 1" },
            new OrgUnit { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Child 2" }
        };

        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _service.GetTreeForTenantAsync(tenantId);

        // Assert
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(orgUnits);
    }

    [Fact]
    public async Task GetTreeForTenantAsync_WithNoOrgUnits_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.GetTreeForTenantAsync(tenantId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GeneratePathAsync Tests

    [Fact]
    public async Task GeneratePathAsync_WithNoParent_ReturnsRootPath()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetRootByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        var result = await _service.GeneratePathAsync(null, tenantId);

        // Assert
        result.Should().Be("000");
    }

    [Fact]
    public async Task GeneratePathAsync_WithExistingRoot_ReturnsExistingRootPath()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var existingRoot = new OrgUnit { Path = "001" };

        _orgUnitRepository.Setup(x => x.GetRootByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRoot);

        // Act
        var result = await _service.GeneratePathAsync(null, tenantId);

        // Assert
        result.Should().Be("001");
    }

    [Fact]
    public async Task GeneratePathAsync_WithParentAndNoSiblings_ReturnsFirstChildPath()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var parent = new OrgUnit
        {
            Id = parentId,
            Path = "000"
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);
        _orgUnitRepository.Setup(x => x.GetChildrenAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.GeneratePathAsync(parentId, tenantId);

        // Assert
        result.Should().Be("000/001");
    }

    [Fact]
    public async Task GeneratePathAsync_WithInvalidParent_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.GeneratePathAsync(parentId, tenantId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Parent OrgUnit not found");
    }

    #endregion

    #region CalculateLevelAsync Tests

    [Fact]
    public async Task CalculateLevelAsync_WithNoParent_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateLevelAsync(null);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task CalculateLevelAsync_WithParent_ReturnsParentLevelPlusOne()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var parent = new OrgUnit
        {
            Id = parentId,
            Level = 2
        };

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);

        // Act
        var result = await _service.CalculateLevelAsync(parentId);

        // Assert
        result.Should().Be(3);
    }

    [Fact]
    public async Task CalculateLevelAsync_WithInvalidParent_ThrowsInvalidOperationException()
    {
        // Arrange
        var parentId = Guid.NewGuid();

        _orgUnitRepository.Setup(x => x.GetByIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrgUnit?)null);

        // Act
        Func<Task> act = async () => await _service.CalculateLevelAsync(parentId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Parent OrgUnit not found");
    }

    #endregion
}
