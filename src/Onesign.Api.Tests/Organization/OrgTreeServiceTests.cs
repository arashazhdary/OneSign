using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class OrgTreeServiceTests
{
    [Fact]
    public async Task CreateChildAsync_WithNoParent_CreatesRootOrgUnit()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Act
        var orgUnit = await service.CreateChildAsync(tenantId, null, "Root Org", null, null, CancellationToken.None);

        // Assert
        Assert.NotNull(orgUnit);
        Assert.Equal("Root Org", orgUnit.Name);
        Assert.Equal(0, orgUnit.Level);
        Assert.Equal("000", orgUnit.Path);
        Assert.Null(orgUnit.ParentId);
        Assert.Equal(tenantId, orgUnit.TenantId);
    }

    [Fact]
    public async Task CreateChildAsync_WithParent_CreatesChildWithCorrectPathAndLevel()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create root first
        var root = await service.CreateChildAsync(tenantId, null, "Root", null, null, CancellationToken.None);

        // Act
        var child = await service.CreateChildAsync(tenantId, root.Id, "Child 1", null, null, CancellationToken.None);

        // Assert
        Assert.NotNull(child);
        Assert.Equal("Child 1", child.Name);
        Assert.Equal(1, child.Level);
        Assert.Equal("000/001", child.Path);
        Assert.Equal(root.Id, child.ParentId);
    }

    [Fact]
    public async Task CreateChildAsync_MultipleChildren_GeneratesIncrementalPaths()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();
        var root = await service.CreateChildAsync(tenantId, null, "Root", null, null, CancellationToken.None);

        // Act
        var child1 = await service.CreateChildAsync(tenantId, root.Id, "Child 1", null, null, CancellationToken.None);
        var child2 = await service.CreateChildAsync(tenantId, root.Id, "Child 2", null, null, CancellationToken.None);
        var child3 = await service.CreateChildAsync(tenantId, root.Id, "Child 3", null, null, CancellationToken.None);

        // Assert
        Assert.Equal("000/001", child1.Path);
        Assert.Equal("000/002", child2.Path);
        Assert.Equal("000/003", child3.Path);
    }

    [Fact]
    public async Task MoveOrgUnitAsync_UpdatesPathAndLevelForUnitAndDescendants()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create structure: Root -> Branch1 -> Leaf, and Root -> Branch2
        var root = await service.CreateChildAsync(tenantId, null, "Root", null, null, CancellationToken.None);
        var branch1 = await service.CreateChildAsync(tenantId, root.Id, "Branch 1", null, null, CancellationToken.None);
        var leaf = await service.CreateChildAsync(tenantId, branch1.Id, "Leaf", null, null, CancellationToken.None);
        var branch2 = await service.CreateChildAsync(tenantId, root.Id, "Branch 2", null, null, CancellationToken.None);

        // Act - Move Branch1 (and its child Leaf) under Branch2
        await service.MoveOrgUnitAsync(branch1.Id, branch2.Id, CancellationToken.None);

        // Assert
        var movedBranch1 = await orgUnitRepository.GetByIdAsync(branch1.Id, CancellationToken.None);
        var movedLeaf = await orgUnitRepository.GetByIdAsync(leaf.Id, CancellationToken.None);

        Assert.NotNull(movedBranch1);
        Assert.NotNull(movedLeaf);
        Assert.Equal("000/002/001", movedBranch1.Path); // Now under branch2
        Assert.Equal(2, movedBranch1.Level);
        Assert.Equal("000/002/001/001", movedLeaf.Path); // Descendant also updated
        Assert.Equal(3, movedLeaf.Level);
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithChildren_ThrowsException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();
        var root = await service.CreateChildAsync(tenantId, null, "Root", null, null, CancellationToken.None);
        var child = await service.CreateChildAsync(tenantId, root.Id, "Child", null, null, CancellationToken.None);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await service.DeleteOrgUnitAsync(root.Id, CancellationToken.None);
        });
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithNoChildrenButHasUsers_ThrowsException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();
        var orgUnit = await service.CreateChildAsync(tenantId, null, "Org", null, null, CancellationToken.None);

        // Assign a user to this org unit
        var userOrgUnit = new Onesign.Modules.Organization.Domain.Entities.UserOrgUnit
        {
            TenantUserId = Guid.NewGuid(),
            OrgUnitId = orgUnit.Id,
            IsPrimary = true
        };
        await userOrgUnitRepository.AddAsync(userOrgUnit, CancellationToken.None);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await service.DeleteOrgUnitAsync(orgUnit.Id, CancellationToken.None);
        });
    }

    [Fact]
    public async Task DeleteOrgUnitAsync_WithNoChildrenNoUsersNoApps_DeletesSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var logger = new Mock<ILogger<OrgTreeService>>();

        var service = new OrgTreeService(
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();
        var orgUnit = await service.CreateChildAsync(tenantId, null, "Empty Org", null, null, CancellationToken.None);

        // Act
        await service.DeleteOrgUnitAsync(orgUnit.Id, CancellationToken.None);

        // Assert
        var deleted = await orgUnitRepository.GetByIdAsync(orgUnit.Id, CancellationToken.None);
        Assert.Null(deleted);
    }
}
