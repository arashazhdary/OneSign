using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Tenants.Application.Queries;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class GetTenantsQueryHandlerTests
{
    [Fact]
    public async Task Handle_NoTenants_ReturnsEmptyPagedResult()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_SingleTenant_ReturnsSingleItem()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
        result.Items[0].Id.Should().Be(tenant.Id);
        result.Items[0].Name.Should().Be("Test Tenant");
        result.Items[0].Slug.Should().Be("test-tenant");
        result.Items[0].Status.Should().Be(TenantStatus.Active);
    }

    [Fact]
    public async Task Handle_MultipleTenants_ReturnsOrderedByName()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var tenants = new[]
        {
            new Tenant { Id = Guid.NewGuid(), Name = "Zebra Corp", Slug = "zebra", Status = TenantStatus.Active, CreatedAt = DateTime.UtcNow },
            new Tenant { Id = Guid.NewGuid(), Name = "Alpha Inc", Slug = "alpha", Status = TenantStatus.Active, CreatedAt = DateTime.UtcNow },
            new Tenant { Id = Guid.NewGuid(), Name = "Beta LLC", Slug = "beta", Status = TenantStatus.Suspended, CreatedAt = DateTime.UtcNow }
        };

        foreach (var tenant in tenants)
        {
            await tenantRepository.AddAsync(tenant, CancellationToken.None);
        }

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
        result.Items[0].Name.Should().Be("Alpha Inc");
        result.Items[1].Name.Should().Be("Beta LLC");
        result.Items[2].Name.Should().Be("Zebra Corp");
    }

    [Fact]
    public async Task Handle_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        // Create 5 tenants
        for (int i = 1; i <= 5; i++)
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = $"Tenant {i:D2}",
                Slug = $"tenant-{i}",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantRepository.AddAsync(tenant, CancellationToken.None);
        }

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 2,
            PageSize = 2
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.Items[0].Name.Should().Be("Tenant 03");
        result.Items[1].Name.Should().Be("Tenant 04");
    }

    [Fact]
    public async Task Handle_LastPagePartialResults_ReturnsRemainingItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        // Create 5 tenants
        for (int i = 1; i <= 5; i++)
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = $"Tenant {i:D2}",
                Slug = $"tenant-{i}",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantRepository.AddAsync(tenant, CancellationToken.None);
        }

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 3,
            PageSize = 2
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(5);
        result.Items[0].Name.Should().Be("Tenant 05");
    }

    [Fact]
    public async Task Handle_PageBeyondData_ReturnsEmptyItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 10,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_DifferentStatuses_ReturnsAllStatuses()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var tenants = new[]
        {
            new Tenant { Id = Guid.NewGuid(), Name = "Active Tenant", Slug = "active", Status = TenantStatus.Active, CreatedAt = DateTime.UtcNow },
            new Tenant { Id = Guid.NewGuid(), Name = "Inactive Tenant", Slug = "inactive", Status = TenantStatus.Inactive, CreatedAt = DateTime.UtcNow },
            new Tenant { Id = Guid.NewGuid(), Name = "Suspended Tenant", Slug = "suspended", Status = TenantStatus.Suspended, CreatedAt = DateTime.UtcNow }
        };

        foreach (var tenant in tenants)
        {
            await tenantRepository.AddAsync(tenant, CancellationToken.None);
        }

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items.Should().Contain(i => i.Status == TenantStatus.Active);
        result.Items.Should().Contain(i => i.Status == TenantStatus.Inactive);
        result.Items.Should().Contain(i => i.Status == TenantStatus.Suspended);
    }

    [Fact]
    public async Task Handle_WithMockedRepository_WorksCorrectly()
    {
        // Arrange
        var mockRepository = new Mock<ITenantRepository>();
        var tenants = new List<Tenant>
        {
            new() { Id = Guid.NewGuid(), Name = "Test Tenant", Slug = "test", Status = TenantStatus.Active, CreatedAt = DateTime.UtcNow }
        };

        mockRepository
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenants);

        var handler = new GetTenantsQueryHandler(mockRepository.Object);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DefaultQueryValues_UsesDefaults()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery(); // Uses default values

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_LargePageSize_ReturnsAllItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        // Create 3 tenants
        for (int i = 1; i <= 3; i++)
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = $"Tenant {i}",
                Slug = $"tenant-{i}",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantRepository.AddAsync(tenant, CancellationToken.None);
        }

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 100
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
        result.PageSize.Should().Be(100);
    }

    [Fact]
    public async Task Handle_MapsAllDtoPropertiesCorrectly()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantRepository = new TenantRepository(context);

        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Mapped Tenant",
            Slug = "mapped-tenant",
            Status = TenantStatus.Suspended,
            CreatedAt = DateTime.UtcNow
        };
        await tenantRepository.AddAsync(tenant, CancellationToken.None);

        var handler = new GetTenantsQueryHandler(tenantRepository);

        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Items.First();
        dto.Id.Should().Be(tenantId);
        dto.Name.Should().Be("Mapped Tenant");
        dto.Slug.Should().Be("mapped-tenant");
        dto.Status.Should().Be(TenantStatus.Suspended);
    }
}
