using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Identity.Application.Queries;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class GetTenantUsersQueryHandlerTests
{
    #region Basic Query Tests

    [Fact]
    public async Task Handle_NoUsers_ReturnsEmptyList()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
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
    public async Task Handle_SingleUser_ReturnsUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create user
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            CreatedAt = DateTime.UtcNow
        };
        await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.Should().HaveCount(1);
        result.Items[0].Email.Should().Be("test@example.com");
        result.Items[0].Status.Should().Be(TenantUserStatus.Active);
    }

    [Fact]
    public async Task Handle_MultipleUsers_ReturnsAllUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create multiple users
        for (int i = 0; i < 5; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(5);
        result.Items.Should().HaveCount(5);
    }

    #endregion

    #region Pagination Tests

    [Fact]
    public async Task Handle_FirstPage_ReturnsCorrectItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create 15 users
        for (int i = 0; i < 15; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i:D2}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 5
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(15);
        result.Items.Should().HaveCount(5);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(5);
    }

    [Fact]
    public async Task Handle_SecondPage_ReturnsCorrectItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create 15 users
        for (int i = 0; i < 15; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i:D2}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 2,
            PageSize = 5
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(15);
        result.Items.Should().HaveCount(5);
        result.PageNumber.Should().Be(2);
    }

    [Fact]
    public async Task Handle_LastPage_ReturnsRemainingItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create 12 users
        for (int i = 0; i < 12; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 3,
            PageSize = 5
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(12);
        result.Items.Should().HaveCount(2); // Only 2 remaining on page 3
    }

    [Fact]
    public async Task Handle_PageBeyondTotal_ReturnsEmptyItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create 3 users
        for (int i = 0; i < 3; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 10, // Page doesn't exist
            PageSize = 5
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(3);
        result.Items.Should().BeEmpty();
    }

    #endregion

    #region Tenant Isolation Tests

    [Fact]
    public async Task Handle_MultiTenant_ReturnsOnlyRequestedTenantUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        // Create users for tenant 1
        for (int i = 0; i < 3; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"tenant1-user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId1,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        // Create users for tenant 2
        for (int i = 0; i < 5; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"tenant2-user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId2,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId1,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(3);
        result.Items.Should().HaveCount(3);
        result.Items.Should().AllSatisfy(x => x.TenantId.Should().Be(tenantId1));
        result.Items.Should().AllSatisfy(x => x.Email.Should().StartWith("tenant1-"));
    }

    #endregion

    #region User Status Tests

    [Fact]
    public async Task Handle_MixedStatuses_ReturnsAllUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        var statuses = new[] { TenantUserStatus.Active, TenantUserStatus.Invited, TenantUserStatus.Disabled, TenantUserStatus.Suspended };

        foreach (var status in statuses)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"{status.ToString().ToLower()}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(4);
        result.Items.Should().Contain(x => x.Status == TenantUserStatus.Active);
        result.Items.Should().Contain(x => x.Status == TenantUserStatus.Invited);
        result.Items.Should().Contain(x => x.Status == TenantUserStatus.Disabled);
        result.Items.Should().Contain(x => x.Status == TenantUserStatus.Suspended);
    }

    #endregion

    #region DTO Mapping Tests

    [Fact]
    public async Task Handle_ReturnsCorrectDtoFields()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();
        var firstLoginAt = DateTime.UtcNow.AddDays(-20);
        var lastLoginAt = DateTime.UtcNow.AddHours(-5);
        var createdAt = DateTime.UtcNow.AddDays(-30);

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            CreatedAt = DateTime.UtcNow
        };
        await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = true,
            FirstLoginAt = firstLoginAt,
            LastLoginAt = lastLoginAt,
            CreatedAt = createdAt
        };
        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Items[0];
        dto.Id.Should().Be(tenantUser.Id);
        dto.GlobalUserId.Should().Be(globalUser.Id);
        dto.TenantId.Should().Be(tenantId);
        dto.Email.Should().Be("test@example.com");
        dto.Status.Should().Be(TenantUserStatus.Active);
        dto.IsAdmin.Should().BeTrue();
        dto.FirstLoginAt.Should().Be(firstLoginAt);
        dto.LastLoginAt.Should().Be(lastLoginAt);
        dto.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task Handle_GlobalUserNotFound_ReturnsEmptyEmail()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create tenant user without corresponding global user
        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = Guid.NewGuid(), // Non-existent global user
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Email.Should().BeEmpty();
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task Handle_DefaultPageSize_ReturnsCorrectly()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        for (int i = 0; i < 3; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId
            // Using default PageNumber = 1, PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(3);
        result.Items.Should().HaveCount(3);
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
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantId = Guid.NewGuid();

        for (int i = 0; i < 5; i++)
        {
            var globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                CreatedAt = DateTime.UtcNow
            };
            await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                GlobalUserId = globalUser.Id,
                TenantId = tenantId,
                Status = TenantUserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            PageNumber = 1,
            PageSize = 1000
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(5);
        result.Items.Should().HaveCount(5);
    }

    [Fact]
    public async Task Handle_EmptyTenantGuid_ReturnsNoUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);

        var handler = new GetTenantUsersQueryHandler(
            tenantUserRepository,
            globalUserRepository,
            context);

        var query = new GetTenantUsersQuery
        {
            TenantId = Guid.Empty,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(0);
        result.Items.Should().BeEmpty();
    }

    #endregion
}
