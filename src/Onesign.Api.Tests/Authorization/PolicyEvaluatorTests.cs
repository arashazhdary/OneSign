using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Repositories;

namespace Onesign.Api.Tests.Authorization;

public class PolicyEvaluatorTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task GetRolesByTenantId_ReturnsRoles()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new RoleRepository(context);
        var tenantId = Guid.NewGuid();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Admin",
            Description = "Administrator role",
            IsSystem = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(role, CancellationToken.None);

        // Act
        var roles = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(roles);
        Assert.Single(roles);
        Assert.Equal("Admin", roles.First().Name);
    }

    [Fact]
    public async Task GetRoleByName_ExistingRole_ReturnsRole()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new RoleRepository(context);
        var tenantId = Guid.NewGuid();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Manager",
            Description = "Manager role",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(role, CancellationToken.None);

        // Act
        var result = await repository.GetByNameAsync(tenantId, "Manager", CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Manager", result.Name);
    }

    [Fact]
    public async Task GetRoleByName_NonExistentRole_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new RoleRepository(context);
        var tenantId = Guid.NewGuid();

        // Act
        var result = await repository.GetByNameAsync(tenantId, "NonExistent", CancellationToken.None);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteRole_SystemRole_ShouldPrevent()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new RoleRepository(context);
        var tenantId = Guid.NewGuid();

        var systemRole = new Role
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "SuperAdmin",
            Description = "System administrator",
            IsSystem = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(systemRole, CancellationToken.None);

        // Act & Assert - System roles shouldn't be deleted
        var role = await repository.GetByIdAsync(systemRole.Id, CancellationToken.None);
        Assert.NotNull(role);
        Assert.True(role.IsSystem);
    }
}
