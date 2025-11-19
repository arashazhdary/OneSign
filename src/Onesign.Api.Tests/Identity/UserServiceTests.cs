using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

namespace Onesign.Api.Tests.Identity;

public class UserServiceTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task CreateUser_ValidUser_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRepository(context);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(user, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("test@example.com", result.Email);
        Assert.Equal("Test", result.FirstName);
    }

    [Fact]
    public async Task GetUserByEmail_ExistingUser_ReturnsUser()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRepository(context);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            FirstName = "Existing",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(user, CancellationToken.None);

        // Act
        var result = await repository.GetByEmailAsync("existing@example.com", CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("existing@example.com", result.Email);
    }

    [Fact]
    public async Task GetUserByEmail_NonExistentUser_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByEmailAsync("nonexistent@example.com", CancellationToken.None);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateUser_ValidUpdate_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserRepository(context);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "update@example.com",
            FirstName = "Original",
            LastName = "Name",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(user, CancellationToken.None);

        // Act
        user.FirstName = "Updated";
        user.LastName = "NewName";
        user.IsEmailVerified = true;
        await repository.UpdateAsync(user, CancellationToken.None);

        var result = await repository.GetByIdAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated", result.FirstName);
        Assert.Equal("NewName", result.LastName);
        Assert.True(result.IsEmailVerified);
    }

    [Fact]
    public async Task VerifyPassword_CorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "TestPassword123!";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // Act
        var isValid = BCrypt.Net.BCrypt.Verify(password, passwordHash);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public async Task VerifyPassword_IncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var password = "TestPassword123!";
        var wrongPassword = "WrongPassword123!";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // Act
        var isValid = BCrypt.Net.BCrypt.Verify(wrongPassword, passwordHash);

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public async Task CreateTenantUser_ValidTenantUser_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var tenantUserRepository = new TenantUserRepository(context);
        var userRepository = new UserRepository(context);
        var tenantId = Guid.NewGuid();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "tenant-user@example.com",
            FirstName = "Tenant",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.AddAsync(user, CancellationToken.None);

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = user.Id,
            Status = TenantUserStatus.Active,
            JoinedAt = DateTime.UtcNow
        };

        // Act
        var result = await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(tenantId, result.TenantId);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(TenantUserStatus.Active, result.Status);
    }

    [Fact]
    public async Task GetTenantUsers_ReturnsTenantUsers()
    {
        // Arrange
        using var context = CreateContext();
        var tenantUserRepository = new TenantUserRepository(context);
        var userRepository = new UserRepository(context);
        var tenantId = Guid.NewGuid();

        // Create users
        for (int i = 0; i < 3; i++)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@example.com",
                FirstName = $"User{i}",
                LastName = "Test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            await userRepository.AddAsync(user, CancellationToken.None);

            var tenantUser = new TenantUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = user.Id,
                Status = TenantUserStatus.Active,
                JoinedAt = DateTime.UtcNow
            };

            await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);
        }

        // Act
        var tenantUsers = await tenantUserRepository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(tenantUsers);
        Assert.Equal(3, tenantUsers.Count());
    }

    [Fact]
    public async Task SuspendTenantUser_ValidUser_SuspendsSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var tenantUserRepository = new TenantUserRepository(context);
        var userRepository = new UserRepository(context);
        var tenantId = Guid.NewGuid();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "suspend@example.com",
            FirstName = "Suspend",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.AddAsync(user, CancellationToken.None);

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = user.Id,
            Status = TenantUserStatus.Active,
            JoinedAt = DateTime.UtcNow
        };

        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        // Act
        tenantUser.Status = TenantUserStatus.Suspended;
        await tenantUserRepository.UpdateAsync(tenantUser, CancellationToken.None);

        var result = await tenantUserRepository.GetByIdAsync(tenantUser.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(TenantUserStatus.Suspended, result.Status);
    }
}
