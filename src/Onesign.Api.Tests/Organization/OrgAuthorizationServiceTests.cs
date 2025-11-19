using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class OrgAuthorizationServiceTests
{
    [Fact]
    public async Task GetEffectiveScopeAsync_GlobalAdmin_ReturnsGlobalAdminScope()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        // Create a global admin user
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var tenantId = Guid.NewGuid();
        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.TenantAdmin, // Global admin
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(tenantUser));
        await context.SaveChangesAsync();

        // Act
        var scope = await service.GetEffectiveScopeAsync(tenantUser.Id, CancellationToken.None);

        // Assert
        Assert.True(scope.IsGlobalAdmin);
        Assert.Empty(scope.RootOrgUnitIds);
        Assert.Empty(scope.AllowedOrgUnitIds);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_DelegatedAdminWithOrgOnly_ReturnsOnlyRootOrgUnit()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create OrgUnit
        var orgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = null,
            Name = "Department A",
            Path = "000",
            Level = 0,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(orgUnit));

        // Create delegated admin user
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "delegated@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.Member, // Not global admin
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(tenantUser));

        // Create delegated admin scope (OrgOnly)
        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = tenantUser.Id,
            OrgUnitId = orgUnit.Id,
            ScopeType = AdminScopeType.OrgOnly,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity.FromDomain(delegatedScope));
        await context.SaveChangesAsync();

        // Act
        var scope = await service.GetEffectiveScopeAsync(tenantUser.Id, CancellationToken.None);

        // Assert
        Assert.False(scope.IsGlobalAdmin);
        Assert.Single(scope.RootOrgUnitIds);
        Assert.Contains(orgUnit.Id, scope.RootOrgUnitIds);
        Assert.Single(scope.AllowedOrgUnitIds);
        Assert.Contains(orgUnit.Id, scope.AllowedOrgUnitIds);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_DelegatedAdminWithOrgAndDescendants_ReturnsRootAndChildren()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create OrgUnit hierarchy: Parent -> Child1, Child2
        var parent = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = null,
            Name = "Parent",
            Path = "000",
            Level = 0,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var child1 = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = parent.Id,
            Name = "Child 1",
            Path = "000/001",
            Level = 1,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var child2 = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = parent.Id,
            Name = "Child 2",
            Path = "000/002",
            Level = 1,
            SortOrder = 2,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity>()
            .AddRangeAsync(
                Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(parent),
                Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(child1),
                Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(child2)
            );

        // Create delegated admin user
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "delegated@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(tenantUser));

        // Create delegated admin scope (OrgAndDescendants)
        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = tenantUser.Id,
            OrgUnitId = parent.Id,
            ScopeType = AdminScopeType.OrgAndDescendants,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity.FromDomain(delegatedScope));
        await context.SaveChangesAsync();

        // Act
        var scope = await service.GetEffectiveScopeAsync(tenantUser.Id, CancellationToken.None);

        // Assert
        Assert.False(scope.IsGlobalAdmin);
        Assert.Single(scope.RootOrgUnitIds);
        Assert.Contains(parent.Id, scope.RootOrgUnitIds);
        Assert.Equal(3, scope.AllowedOrgUnitIds.Count); // Parent + 2 children
        Assert.Contains(parent.Id, scope.AllowedOrgUnitIds);
        Assert.Contains(child1.Id, scope.AllowedOrgUnitIds);
        Assert.Contains(child2.Id, scope.AllowedOrgUnitIds);
    }

    [Fact]
    public async Task CanManageUserAsync_GlobalAdmin_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create global admin
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var adminUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(adminUser));
        await context.SaveChangesAsync();

        var targetUserId = Guid.NewGuid();

        // Act
        var canManage = await service.CanManageUserAsync(adminUser.Id, targetUserId, CancellationToken.None);

        // Assert
        Assert.True(canManage);
    }

    [Fact]
    public async Task CanManageUserAsync_DelegatedAdminWithUserInScope_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create OrgUnit
        var orgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = null,
            Name = "Department",
            Path = "000",
            Level = 0,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(orgUnit));

        // Create delegated admin
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "delegated@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var delegatedAdmin = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(delegatedAdmin));

        // Create delegated admin scope
        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = delegatedAdmin.Id,
            OrgUnitId = orgUnit.Id,
            ScopeType = AdminScopeType.OrgOnly,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity.FromDomain(delegatedScope));

        // Create target user in the same org unit
        var targetUserId = Guid.NewGuid();
        var userOrgUnit = new UserOrgUnit
        {
            TenantUserId = targetUserId,
            OrgUnitId = orgUnit.Id,
            IsPrimary = true
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.UserOrgUnitEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.UserOrgUnitEntity.FromDomain(userOrgUnit));

        await context.SaveChangesAsync();

        // Act
        var canManage = await service.CanManageUserAsync(delegatedAdmin.Id, targetUserId, CancellationToken.None);

        // Assert
        Assert.True(canManage);
    }

    [Fact]
    public async Task CanManageUserAsync_DelegatedAdminWithUserOutOfScope_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var orgUnitRepository = new OrgUnitRepository(context);
        var userOrgUnitRepository = new UserOrgUnitRepository(context);
        var applicationOrgUnitRepository = new ApplicationOrgUnitRepository(context);
        var delegatedAdminRepository = new DelegatedAdminRepository(context);
        var applicationClientRepository = new ApplicationClientRepository(context);
        var logger = new Mock<ILogger<OrgAuthorizationService>>();

        var service = new OrgAuthorizationService(
            tenantUserRepository,
            orgUnitRepository,
            userOrgUnitRepository,
            applicationOrgUnitRepository,
            delegatedAdminRepository,
            applicationClientRepository,
            logger.Object);

        var tenantId = Guid.NewGuid();

        // Create two separate org units
        var orgUnitA = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = null,
            Name = "Department A",
            Path = "000",
            Level = 0,
            SortOrder = 1,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var orgUnitB = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = null,
            Name = "Department B",
            Path = "001",
            Level = 0,
            SortOrder = 2,
            Status = OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity>()
            .AddRangeAsync(
                Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(orgUnitA),
                Onesign.Modules.Organization.Infrastructure.EfCore.Entities.OrgUnitEntity.FromDomain(orgUnitB)
            );

        // Create delegated admin for Department A
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "delegated@example.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.GlobalUserEntity.FromDomain(globalUser));

        var delegatedAdmin = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .AddAsync(Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity.FromDomain(delegatedAdmin));

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = delegatedAdmin.Id,
            OrgUnitId = orgUnitA.Id,
            ScopeType = AdminScopeType.OrgOnly,
            CreatedAt = DateTime.UtcNow
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.DelegatedAdminScopeEntity.FromDomain(delegatedScope));

        // Create target user in Department B (out of scope)
        var targetUserId = Guid.NewGuid();
        var userOrgUnit = new UserOrgUnit
        {
            TenantUserId = targetUserId,
            OrgUnitId = orgUnitB.Id,
            IsPrimary = true
        };
        await context.Set<Onesign.Modules.Organization.Infrastructure.EfCore.Entities.UserOrgUnitEntity>()
            .AddAsync(Onesign.Modules.Organization.Infrastructure.EfCore.Entities.UserOrgUnitEntity.FromDomain(userOrgUnit));

        await context.SaveChangesAsync();

        // Act
        var canManage = await service.CanManageUserAsync(delegatedAdmin.Id, targetUserId, CancellationToken.None);

        // Assert
        Assert.False(canManage);
    }
}
